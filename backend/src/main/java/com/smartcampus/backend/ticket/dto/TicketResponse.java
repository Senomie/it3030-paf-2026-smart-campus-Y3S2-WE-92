package com.smartcampus.backend.ticket.dto;

import com.smartcampus.backend.ticket.Ticket;
import com.smartcampus.backend.ticket.TicketStatus;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TicketResponse {

	Long id;
	Long reporterId;
	Long assigneeId;
	String title;
	String description;
	TicketStatus status;

	public static TicketResponse from(Ticket t) {
		return TicketResponse.builder()
				.id(t.getId())
				.reporterId(t.getReporterId())
				.assigneeId(t.getAssigneeId())
				.title(t.getTitle())
				.description(t.getDescription())
				.status(t.getStatus())
				.build();
	}
}
