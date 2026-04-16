package com.smartcampus.backend.notification;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.notification.dto.NotificationResponse;
import com.smartcampus.backend.notification.dto.NotificationPreferenceResponse;
import com.smartcampus.backend.notification.dto.UpdateNotificationPreferenceRequest;
import com.smartcampus.backend.user.Role;
import com.smartcampus.backend.user.User;
import com.smartcampus.backend.user.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

	private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

	private final NotificationService notificationService;
	private final UserRepository userRepository;

	@PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<NotificationResponse>> listForUser(Authentication auth, @PathVariable Long userId) {
		try {
			if (userId == null || userId <= 0) {
				logger.warn("Invalid userId parameter: {}", userId);
				return ResponseEntity.badRequest().build();
			}
			logger.debug("Fetching notifications for user: {}", userId);
			Caller c = Caller.from(auth, userRepository);
			List<NotificationResponse> notifications = notificationService.listForUser(c.userId(), c.role(), userId);
			logger.debug("Retrieved {} notifications for user: {}", notifications.size(), userId);
			return ResponseEntity.ok(notifications);
		} catch (Exception e) {
			logger.error("Error fetching notifications for user: {}", userId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
	@PatchMapping("/{id}/read")
	public ResponseEntity<NotificationResponse> markRead(Authentication auth, @PathVariable Long id) {
		try {
			if (id == null || id <= 0) {
				logger.warn("Invalid notification id: {}", id);
				return ResponseEntity.badRequest().build();
			}
			logger.debug("Marking notification as read: {}", id);
			Caller c = Caller.from(auth, userRepository);
			NotificationResponse response = notificationService.markRead(c.userId(), c.role(), id);
			logger.debug("Notification marked as read: {}", id);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			logger.warn("Notification not found or access denied: {}", id, e);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		} catch (Exception e) {
			logger.error("Error marking notification as read: {}", id, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
		try {
			if (id == null || id <= 0) {
				logger.warn("Invalid notification id for deletion: {}", id);
				return ResponseEntity.badRequest().build();
			}
			logger.debug("Deleting notification: {}", id);
			Caller c = Caller.from(auth, userRepository);
			notificationService.delete(c.userId(), c.role(), id);
			logger.debug("Notification deleted: {}", id);
			return ResponseEntity.noContent().build();
		} catch (IllegalArgumentException e) {
			logger.warn("Notification not found or access denied: {}", id, e);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		} catch (Exception e) {
			logger.error("Error deleting notification: {}", id, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
	@GetMapping("/preferences/{userId}")
	public ResponseEntity<List<NotificationPreferenceResponse>> getPreferences(Authentication auth, @PathVariable Long userId) {
		try {
			if (userId == null || userId <= 0) {
				logger.warn("Invalid userId for preferences: {}", userId);
				return ResponseEntity.badRequest().build();
			}
			logger.debug("Fetching notification preferences for user: {}", userId);
			Caller c = Caller.from(auth, userRepository);
			List<NotificationPreferenceResponse> preferences = notificationService.getPreferences(c.userId(), c.role(), userId);
			logger.debug("Retrieved {} preference settings for user: {}", preferences.size(), userId);
			return ResponseEntity.ok(preferences);
		} catch (Exception e) {
			logger.error("Error fetching preferences for user: {}", userId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
	@PutMapping("/preferences/{userId}")
	public ResponseEntity<NotificationPreferenceResponse> updatePreference(
			Authentication auth,
			@PathVariable Long userId,
			@Valid @RequestBody UpdateNotificationPreferenceRequest request) {
		
		try {
			if (userId == null || userId <= 0) {
				logger.warn("Invalid userId for preference update: {}", userId);
				return ResponseEntity.badRequest().build();
			}
			logger.debug("Updating notification preference for user: {} - type: {}", userId, request.type());
			Caller c = Caller.from(auth, userRepository);
			NotificationPreferenceResponse response = notificationService.updatePreference(c.userId(), c.role(), userId, request.type(), request.enabled());
			logger.debug("Preference updated for user: {} - type: {}", userId, request.type());
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			logger.warn("Invalid preference update request: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		} catch (Exception e) {
			logger.error("Error updating preference for user: {}", userId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	private record Caller(Long userId, Role role) {
		static Caller from(Authentication auth, UserRepository users) {
			Long id = (Long) auth.getPrincipal();
			User u = users.findById(id)
					.orElseThrow(() -> new IllegalArgumentException("User not found"));
			return new Caller(u.getId(), u.getRole());
		}
	}
}
