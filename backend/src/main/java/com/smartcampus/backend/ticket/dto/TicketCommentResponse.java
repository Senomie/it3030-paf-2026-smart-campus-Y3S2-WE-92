package com.smartcampus.backend.ticket.dto;

import java.time.Instant;

import com.smartcampus.backend.ticket.TicketComment;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TicketCommentResponse {

	Long id;
	Long ticketId;
	Long authorId;
	String body;
	Instant createdAt;

	public static TicketCommentResponse from(TicketComment c) {
		return TicketCommentResponse.builder()
				.id(c.getId())
				.ticketId(c.getTicketId())
				.authorId(c.getAuthorId())
				.body(c.getBody())
				.createdAt(c.getCreatedAt())
				.build();
	}
}
