package com.smartcampus.backend.user.dto;

import com.smartcampus.backend.user.Role;
import com.smartcampus.backend.user.User;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserResponse {

	Long id;
	String email;
	String name;
	String role;

	public static UserResponse from(User user) {
		return UserResponse.builder()
				.id(user.getId())
				.email(user.getEmail())
				.name(user.getName())
				.role("ROLE_" + user.getRole().name())
				.build();
	}

	public static String roleString(Role role) {
		return "ROLE_" + role.name();
	}
}
