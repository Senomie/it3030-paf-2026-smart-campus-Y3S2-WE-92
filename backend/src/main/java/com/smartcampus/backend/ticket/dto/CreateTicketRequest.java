package com.smartcampus.backend.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTicketRequest(
		@NotBlank String title,
		@NotBlank String description,
		Long assigneeId) {
}
