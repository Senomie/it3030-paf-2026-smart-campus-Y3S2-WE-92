package com.smartcampus.backend.auth;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.user.User;
import com.smartcampus.backend.user.UserRepository;
import com.smartcampus.backend.user.dto.UserResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final UserRepository userRepository;

	@GetMapping("/me")
	public UserResponse me(Authentication authentication) {
		Long userId = (Long) authentication.getPrincipal();
		User user = userRepository.findById(userId).orElseThrow();
		return UserResponse.from(user);
	}
}
