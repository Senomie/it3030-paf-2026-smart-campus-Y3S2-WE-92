package com.smartcampus.backend.booking.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.smartcampus.backend.booking.BookingRecurrence; 

public record CreateBookingRequest(
		@NotBlank String resourceLabel,
		@NotBlank String purpose,
		@NotNull LocalDateTime startTime,
		@NotNull LocalDateTime endTime,
		BookingRecurrence recurrence,
	    String fullName,
        String phoneNumber){
}
