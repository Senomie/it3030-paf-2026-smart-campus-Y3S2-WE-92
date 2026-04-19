package com.smartcampus.backend.booking;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.backend.booking.dto.BookingResponse;
import com.smartcampus.backend.booking.dto.CreateBookingRequest;
import com.smartcampus.backend.booking.dto.UpdateBookingRequest;
import com.smartcampus.backend.notification.NotificationService;
import com.smartcampus.backend.user.User;
import com.smartcampus.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public BookingResponse create(Long userId, CreateBookingRequest req) {
        if (!req.endTime().isAfter(req.startTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }
        long overlaps = bookingRepository.countOverlapping(
                req.resourceLabel(), req.startTime(), req.endTime(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED));
        if (overlaps > 0) {
            throw new IllegalStateException("Resource is already booked for this time range");
        }
        Booking b = Booking.builder()
                .userId(userId)
                .resourceLabel(req.resourceLabel().trim())
                .purpose(req.purpose().trim())
                .startTime(req.startTime())
                .endTime(req.endTime())
                .status(BookingStatus.PENDING)
                .recurrence(req.recurrence() != null ? req.recurrence() : BookingRecurrence.SINGLE)
                .fullName(req.fullName())
                .phoneNumber(req.phoneNumber())
                .build();
        return BookingResponse.from(bookingRepository.save(b));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listMine(Long userId) {
        return bookingRepository.findByUserIdOrderByStartTimeDesc(userId).stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listPending() {
        return bookingRepository.findByStatusOrderByStartTimeAsc(BookingStatus.PENDING).stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getByResourceLabel(String resourceLabel) {
        return bookingRepository.findByResourceLabel(resourceLabel).stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listAll(BookingStatus status) {
        List<Booking> result = status != null
                ? bookingRepository.findByStatusOrderByStartTimeDesc(status)
                : bookingRepository.findAllByOrderByStartTimeDesc();
        return result.stream().map(BookingResponse::from).toList();
    }

    // ── Update ────────────────────────────────────────────────────────────────
    @Transactional
    public BookingResponse update(Long userId, Long bookingId, UpdateBookingRequest req) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Only the owner can update
        if (!b.getUserId().equals(userId)) {
            throw new SecurityException("You can only edit your own bookings");
        }
        // Only PENDING bookings can be edited
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be updated");
        }
        if (!req.endTime().isAfter(req.startTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }

        // Check overlaps excluding this booking itself
        long overlaps = bookingRepository.countOverlappingExclude(
                b.getResourceLabel(), req.startTime(), req.endTime(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED), bookingId);
        if (overlaps > 0) {
            throw new IllegalStateException("Resource is already booked for this time range");
        }

        b.setPurpose(req.purpose().trim());
        b.setStartTime(req.startTime());
        b.setEndTime(req.endTime());
        if (req.fullName() != null)    b.setFullName(req.fullName());
        if (req.phoneNumber() != null) b.setPhoneNumber(req.phoneNumber());
        if (req.recurrence() != null)  b.setRecurrence(req.recurrence());

        return BookingResponse.from(bookingRepository.save(b));
    }

    // ── Cancel (soft delete) ──────────────────────────────────────────────────
    @Transactional
    public void cancel(Long userId, Long bookingId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Only the owner can cancel
        if (!b.getUserId().equals(userId)) {
            throw new SecurityException("You can only cancel your own bookings");
        }
        // Can only cancel PENDING or APPROVED bookings
        if (b.getStatus() == BookingStatus.REJECTED || b.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already " + b.getStatus());
        }

        b.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(b);
    }

    // ── Admin decide ──────────────────────────────────────────────────────────
    @Transactional
    public BookingResponse decide(Long bookingId, boolean approved, String reason) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be decided");
        }
        User requester = userRepository.findById(b.getUserId()).orElseThrow();
        if (approved) {
            long overlaps = bookingRepository.countOverlapping(
                    b.getResourceLabel(), b.getStartTime(), b.getEndTime(),
                    List.of(BookingStatus.APPROVED));
            if (overlaps > 0) {
                throw new IllegalStateException("Another approved booking overlaps this slot");
            }
            b.setStatus(BookingStatus.APPROVED);
            b.setAdminReason(null);
            bookingRepository.save(b);
            notificationService.notifyBookingApproved(requester, b.getId(), b.getResourceLabel());
        } else {
            b.setStatus(BookingStatus.REJECTED);
            b.setAdminReason(reason);
            bookingRepository.save(b);
            notificationService.notifyBookingRejected(requester, b.getId(), b.getResourceLabel(), reason);
        }
        return BookingResponse.from(b);
    }
}