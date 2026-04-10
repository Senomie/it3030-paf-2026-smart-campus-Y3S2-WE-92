package com.smartcampus.backend.ticket.dto;

import com.smartcampus.backend.ticket.TicketStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateTicketStatusRequest(@NotNull TicketStatus status) {
}
