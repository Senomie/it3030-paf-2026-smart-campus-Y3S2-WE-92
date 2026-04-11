package com.smartcampus.backend.notification;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.smartcampus.backend.notification.dto.NotificationResponse;
import com.smartcampus.backend.user.Role;

class NotificationServiceTest {

	@Mock
	private NotificationRepository notificationRepository;

	@Mock
	private NotificationPreferenceRepository preferenceRepository;

	@InjectMocks
	private NotificationService notificationService;

	@BeforeEach
	void setup() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testListForUserAsOwner() {
		Long userId = 1L;
		Notification n = Notification.builder()
				.id(1L)
				.userId(userId)
				.type(NotificationType.BOOKING_APPROVED)
				.title("Test")
				.message("Test message")
				.readFlag(false)
				.build();

		when(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId))
				.thenReturn(List.of(n));

		List<NotificationResponse> result = notificationService.listForUser(userId, Role.USER, userId);

		assertNotNull(result);
		assertEquals(1, result.size());
		verify(notificationRepository, times(1)).findByUserIdOrderByCreatedAtDesc(userId);
	}

	@Test
	void testListForUserAsAdmin() {
		Long principalId = 1L;
		Long requestedId = 2L;
		Notification n = Notification.builder()
				.id(1L)
				.userId(requestedId)
				.type(NotificationType.BOOKING_APPROVED)
				.title("Test")
				.message("Test message")
				.readFlag(false)
				.build();

		when(notificationRepository.findByUserIdOrderByCreatedAtDesc(requestedId))
				.thenReturn(List.of(n));

		List<NotificationResponse> result = notificationService.listForUser(principalId, Role.ADMIN, requestedId);

		assertNotNull(result);
		assertEquals(1, result.size());
	}

	@Test
	void testListForUserUnauthorized() {
		Long principalId = 1L;
		Long requestedId = 2L;

		assertThrows(SecurityException.class, () ->
			notificationService.listForUser(principalId, Role.USER, requestedId)
		);
	}

	@Test
	void testMarkReadSuccess() {
		Long userId = 1L;
		Long notificationId = 1L;
		Notification n = Notification.builder()
				.id(notificationId)
				.userId(userId)
				.type(NotificationType.TICKET_STATUS)
				.title("Ticket updated")
				.message("Your ticket was updated")
				.readFlag(false)
				.build();

		when(notificationRepository.findById(notificationId))
				.thenReturn(Optional.of(n));
		when(notificationRepository.save(any(Notification.class)))
				.thenReturn(n);

		NotificationResponse result = notificationService.markRead(userId, Role.USER, notificationId);

		assertNotNull(result);
		verify(notificationRepository, times(1)).save(any(Notification.class));
	}

	@Test
	void testMarkReadNotFound() {
		when(notificationRepository.findById(anyLong()))
				.thenReturn(Optional.empty());

		assertThrows(IllegalArgumentException.class, () ->
			notificationService.markRead(1L, Role.USER, 999L)
		);
	}

	@Test
	void testDeleteSuccess() {
		Long userId = 1L;
		Long notificationId = 1L;
		Notification n = Notification.builder()
				.id(notificationId)
				.userId(userId)
				.type(NotificationType.BOOKING_REJECTED)
				.title("Booking rejected")
				.message("Your booking was rejected")
				.readFlag(false)
				.build();

		when(notificationRepository.findById(notificationId))
				.thenReturn(Optional.of(n));

		notificationService.delete(userId, Role.USER, notificationId);

		verify(notificationRepository, times(1)).delete(n);
	}

	@Test
	void testDeleteUnauthorized() {
		Long userId = 1L;
		Long otherId = 2L;
		Notification n = Notification.builder()
				.id(1L)
				.userId(otherId)
				.type(NotificationType.TICKET_COMMENT)
				.title("New comment")
				.message("Someone commented")
				.readFlag(false)
				.build();

		when(notificationRepository.findById(1L))
				.thenReturn(Optional.of(n));

		assertThrows(SecurityException.class, () ->
			notificationService.delete(userId, Role.USER, 1L)
		);
	}
}
