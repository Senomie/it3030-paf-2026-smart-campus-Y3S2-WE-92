package com.smartcampus.backend.booking.dto;

import java.time.LocalDateTime;

import com.smartcampus.backend.booking.BookingRecurrence;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateBookingRequest(
    @NotBlank String purpose,
    @NotNull LocalDateTime startTime,
    @NotNull LocalDateTime endTime,
    String fullName,
    String phoneNumber,
    BookingRecurrence recurrence
) {}