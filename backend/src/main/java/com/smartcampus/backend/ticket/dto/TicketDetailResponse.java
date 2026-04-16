package com.smartcampus.backend.ticket.dto;

import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TicketDetailResponse {

	TicketResponse ticket;
	List<TicketCommentResponse> comments;
}
