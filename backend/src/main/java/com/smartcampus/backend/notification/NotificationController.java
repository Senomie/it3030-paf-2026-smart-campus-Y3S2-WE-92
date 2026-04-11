package com.smartcampus.backend.notification;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

	private final NotificationService notificationService;
	private final UserRepository userRepository;

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<NotificationResponse>> listForUser(Authentication auth, @PathVariable Long userId) {
		if (userId == null || userId <= 0) {
			return ResponseEntity.badRequest().build();
		}
		Caller c = Caller.from(auth, userRepository);
		return ResponseEntity.ok(notificationService.listForUser(c.userId(), c.role(), userId));
	}

	@PatchMapping("/{id}/read")
	public ResponseEntity<NotificationResponse> markRead(Authentication auth, @PathVariable Long id) {
		if (id == null || id <= 0) {
			return ResponseEntity.badRequest().build();
		}
		Caller c = Caller.from(auth, userRepository);
		return ResponseEntity.ok(notificationService.markRead(c.userId(), c.role(), id));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
		if (id == null || id <= 0) {
			return ResponseEntity.badRequest().build();
		}
		Caller c = Caller.from(auth, userRepository);
		notificationService.delete(c.userId(), c.role(), id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/preferences/{userId}")
	public ResponseEntity<List<NotificationPreferenceResponse>> getPreferences(Authentication auth, @PathVariable Long userId) {
		if (userId == null || userId <= 0) {
			return ResponseEntity.badRequest().build();
		}
		Caller c = Caller.from(auth, userRepository);
		return ResponseEntity.ok(notificationService.getPreferences(c.userId(), c.role(), userId));
	}

	@PutMapping("/preferences/{userId}")
	public ResponseEntity<NotificationPreferenceResponse> updatePreference(
			Authentication auth,
			@PathVariable Long userId,
			@Valid @RequestBody UpdateNotificationPreferenceRequest request) {
		
		if (userId == null || userId <= 0) {
			return ResponseEntity.badRequest().build();
		}
		Caller c = Caller.from(auth, userRepository);
		return ResponseEntity.ok(
			notificationService.updatePreference(c.userId(), c.role(), userId, request.type(), request.enabled())
		);
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
