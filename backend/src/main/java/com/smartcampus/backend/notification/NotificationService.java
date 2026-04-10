package com.smartcampus.backend.notification;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.backend.notification.dto.NotificationResponse;
import com.smartcampus.backend.user.Role;
import com.smartcampus.backend.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

	private final NotificationRepository notificationRepository;

	@Transactional(readOnly = true)
	public List<NotificationResponse> listForUser(Long principalUserId, Role principalRole, Long requestedUserId) {
		if (!principalUserId.equals(requestedUserId) && principalRole != Role.ADMIN) {
			throw new SecurityException("Cannot read another user's notifications");
		}
		return notificationRepository.findByUserIdOrderByCreatedAtDesc(requestedUserId).stream()
				.map(NotificationResponse::from)
				.toList();
	}

	@Transactional
	public NotificationResponse markRead(Long principalUserId, Role principalRole, Long notificationId) {
		Notification n = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new IllegalArgumentException("Notification not found"));
		if (!n.getUserId().equals(principalUserId) && principalRole != Role.ADMIN) {
			throw new SecurityException("Cannot modify this notification");
		}
		n.setReadFlag(true);
		return NotificationResponse.from(notificationRepository.save(n));
	}

	@Transactional
	public void delete(Long principalUserId, Role principalRole, Long notificationId) {
		Notification n = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new IllegalArgumentException("Notification not found"));
		if (!n.getUserId().equals(principalUserId) && principalRole != Role.ADMIN) {
			throw new SecurityException("Cannot delete this notification");
		}
		notificationRepository.delete(n);
	}

	@Transactional
	public void notifyBookingApproved(User recipient, Long bookingId, String resourceLabel) {
		save(recipient.getId(), NotificationType.BOOKING_APPROVED, "Booking approved",
				"Your booking for \"" + resourceLabel + "\" was approved.", bookingId, null);
	}

	@Transactional
	public void notifyBookingRejected(User recipient, Long bookingId, String resourceLabel, String reason) {
		String msg = "Your booking for \"" + resourceLabel + "\" was rejected.";
		if (reason != null && !reason.isBlank()) {
			msg += " Reason: " + reason;
		}
		save(recipient.getId(), NotificationType.BOOKING_REJECTED, "Booking rejected", msg, bookingId, null);
	}

	@Transactional
	public void notifyTicketStatus(User recipient, Long ticketId, String title, String newStatus) {
		save(recipient.getId(), NotificationType.TICKET_STATUS, "Ticket updated",
				"Ticket \"" + title + "\" is now " + newStatus + ".", null, ticketId);
	}

	@Transactional
	public void notifyTicketComment(User recipient, Long ticketId, String title, String authorName) {
		save(recipient.getId(), NotificationType.TICKET_COMMENT, "New comment on ticket",
				authorName + " commented on \"" + title + "\".", null, ticketId);
	}

	private void save(Long userId, NotificationType type, String title, String message,
			Long bookingId, Long ticketId) {
		Notification n = Notification.builder()
				.userId(userId)
				.type(type)
				.title(title)
				.message(message)
				.readFlag(false)
				.relatedBookingId(bookingId)
				.relatedTicketId(ticketId)
				.build();
		notificationRepository.save(n);
	}
}
