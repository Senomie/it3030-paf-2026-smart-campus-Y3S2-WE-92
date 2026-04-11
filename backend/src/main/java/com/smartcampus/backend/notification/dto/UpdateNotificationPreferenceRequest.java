package com.smartcampus.backend.notification.dto;

import com.smartcampus.backend.notification.NotificationType;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationPreferenceRequest(
	@NotNull(message = "Type is required")
	NotificationType type,
	
	@NotNull(message = "Enabled flag is required")
	Boolean enabled
) {
}
