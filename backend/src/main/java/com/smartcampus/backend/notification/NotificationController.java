package com.smartcampus.backend.notification;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.notification.dto.NotificationResponse;
import com.smartcampus.backend.user.Role;
import com.smartcampus.backend.user.User;
import com.smartcampus.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

	private final NotificationService notificationService;
	private final UserRepository userRepository;

	@GetMapping("/user/{userId}")
	public List<NotificationResponse> listForUser(Authentication auth, @PathVariable Long userId) {
		Caller c = Caller.from(auth, userRepository);
		return notificationService.listForUser(c.userId(), c.role(), userId);
	}

	@PatchMapping("/{id}/read")
	public NotificationResponse markRead(Authentication auth, @PathVariable Long id) {
		Caller c = Caller.from(auth, userRepository);
		return notificationService.markRead(c.userId(), c.role(), id);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
		Caller c = Caller.from(auth, userRepository);
		notificationService.delete(c.userId(), c.role(), id);
		return ResponseEntity.noContent().build();
	}

	private record Caller(Long userId, Role role) {
		static Caller from(Authentication auth, UserRepository users) {
			Long id = (Long) auth.getPrincipal();
			User u = users.findById(id).orElseThrow();
			return new Caller(u.getId(), u.getRole());
		}
	}
}
