package com.smartcampus.backend.notification.dto;

import com.smartcampus.backend.notification.NotificationType;

public record NotificationPreferenceResponse(
	Long id,
	NotificationType type,
	Boolean enabled
) {
	public static NotificationPreferenceResponse from(com.smartcampus.backend.notification.NotificationPreference pref) {
		return new NotificationPreferenceResponse(pref.getId(), pref.getType(), pref.getEnabled());
	}
}
