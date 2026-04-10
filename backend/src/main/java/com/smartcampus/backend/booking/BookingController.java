package com.smartcampus.backend.booking;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.booking.dto.BookingDecisionRequest;
import com.smartcampus.backend.booking.dto.BookingResponse;
import com.smartcampus.backend.booking.dto.CreateBookingRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

	private final BookingService bookingService;

	@PostMapping
	public BookingResponse create(Authentication auth, @Valid @RequestBody CreateBookingRequest request) {
		Long userId = (Long) auth.getPrincipal();
		return bookingService.create(userId, request);
	}

	@GetMapping("/mine")
	public List<BookingResponse> mine(Authentication auth) {
		Long userId = (Long) auth.getPrincipal();
		return bookingService.listMine(userId);
	}

	@GetMapping("/pending")
	@PreAuthorize("hasRole('ADMIN')")
	public List<BookingResponse> pending() {
		return bookingService.listPending();
	}

	@PatchMapping("/{id}/decision")
	@PreAuthorize("hasRole('ADMIN')")
	public BookingResponse decide(@PathVariable Long id, @Valid @RequestBody BookingDecisionRequest request) {
		return bookingService.decide(id, request.approved(), request.reason());
	}
}
