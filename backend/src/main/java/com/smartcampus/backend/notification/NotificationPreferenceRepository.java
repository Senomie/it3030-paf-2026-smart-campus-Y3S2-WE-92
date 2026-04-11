package com.smartcampus.backend.notification;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
	List<NotificationPreference> findByUserId(Long userId);
	Optional<NotificationPreference> findByUserIdAndType(Long userId, NotificationType type);
}
