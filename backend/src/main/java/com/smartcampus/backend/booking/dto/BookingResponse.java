package com.smartcampus.backend.booking.dto;

import java.time.LocalDateTime;

import com.smartcampus.backend.booking.Booking;
import com.smartcampus.backend.booking.BookingRecurrence;
import com.smartcampus.backend.booking.BookingStatus;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BookingResponse {

	Long id;
	Long userId;
	String resourceLabel;
	String fullName;
    String phoneNumber;
	String purpose;
	LocalDateTime startTime;
	LocalDateTime endTime;
	BookingStatus status;
	String adminReason;
	BookingRecurrence recurrence; 

	public static BookingResponse from(Booking b) {
		return BookingResponse.builder()
				.id(b.getId())
				.userId(b.getUserId())
				.resourceLabel(b.getResourceLabel())
				.fullName(b.getFullName())
                .phoneNumber(b.getPhoneNumber())
				.purpose(b.getPurpose())
				.startTime(b.getStartTime())
				.endTime(b.getEndTime())
				.status(b.getStatus())
				.adminReason(b.getAdminReason())
				.recurrence(b.getRecurrence())
				.build();
	}
}
