package com.smartcampus.backend.booking.dto;

import jakarta.validation.constraints.NotNull;

public record BookingDecisionRequest(
		@NotNull Boolean approved,
		String reason) {
}
