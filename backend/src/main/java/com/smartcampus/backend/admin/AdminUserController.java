package com.smartcampus.backend.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.user.User;
import com.smartcampus.backend.user.UserRepository;
import com.smartcampus.backend.user.UserService;
import com.smartcampus.backend.user.dto.UpdateRoleRequest;
import com.smartcampus.backend.user.dto.UserResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

	private final UserService userService;
	private final UserRepository userRepository;

	/**
	 * GET /api/admin/users - List all users
	 * 
	 * @return List of all users in the system
	 */
	@GetMapping
	public ResponseEntity<List<UserResponse>> getAllUsers() {
		List<User> users = userRepository.findAll();
		List<UserResponse> responses = users.stream()
				.map(UserResponse::from)
				.toList();
		return ResponseEntity.ok(responses);
	}

	/**
	 * PUT /api/admin/users/{id}/role - Update user role
	 * 
	 * @param id The user ID
	 * @param request Request with new role
	 * @return Updated user response
	 */
	@PutMapping("/{id}/role")
	public UserResponse updateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
		return UserResponse.from(userService.updateRole(id, request.role()));
	}

	/**
	 * PATCH /api/admin/users/{id}/role - Update user role (semantic alternative to PUT)
	 * 
	 * @param id The user ID
	 * @param request Request with new role
	 * @return Updated user response
	 */
	@PatchMapping("/{id}/role")
	public UserResponse patchUpdateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
		return UserResponse.from(userService.updateRole(id, request.role()));
	}
}
