package com.smartcampus.backend.admin;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.user.UserService;
import com.smartcampus.backend.user.dto.UpdateRoleRequest;
import com.smartcampus.backend.user.dto.UserResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

	private final UserService userService;

	@PutMapping("/{id}/role")
	@PreAuthorize("hasRole('ADMIN')")
	public UserResponse updateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
		return UserResponse.from(userService.updateRole(id, request.role()));
	}
}
