package com.smartcampus.backend.notification.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartcampus.backend.notification.Notification;
import com.smartcampus.backend.notification.NotificationType;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class NotificationResponse {

	Long id;
	NotificationType type;
	String title;
	String message;
	@JsonProperty("read")
	boolean read;
	Instant createdAt;
	Long relatedBookingId;
	Long relatedTicketId;

	public static NotificationResponse from(Notification n) {
		return NotificationResponse.builder()
				.id(n.getId())
				.type(n.getType())
				.title(n.getTitle())
				.message(n.getMessage())
				.read(n.isReadFlag())
				.createdAt(n.getCreatedAt())
				.relatedBookingId(n.getRelatedBookingId())
				.relatedTicketId(n.getRelatedTicketId())
				.build();
	}
}
