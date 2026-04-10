package com.smartcampus.backend.booking.dto;

import java.time.LocalDateTime;

import com.smartcampus.backend.booking.Booking;
import com.smartcampus.backend.booking.BookingStatus;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BookingResponse {

	Long id;
	Long userId;
	String resourceLabel;
	String purpose;
	LocalDateTime startTime;
	LocalDateTime endTime;
	BookingStatus status;
	String adminReason;

	public static BookingResponse from(Booking b) {
		return BookingResponse.builder()
				.id(b.getId())
				.userId(b.getUserId())
				.resourceLabel(b.getResourceLabel())
				.purpose(b.getPurpose())
				.startTime(b.getStartTime())
				.endTime(b.getEndTime())
				.status(b.getStatus())
				.adminReason(b.getAdminReason())
				.build();
	}
}
