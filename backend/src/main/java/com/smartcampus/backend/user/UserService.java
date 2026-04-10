package com.smartcampus.backend.user;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;

	@Value("${app.security.admin-emails:}")
	private String adminEmailsRaw;

	@Value("${app.security.technician-emails:}")
	private String technicianEmailsRaw;

	@Transactional
	public User processOAuthPostLogin(OAuth2User oauth2User) {
		String email = oauth2User.getAttribute("email");
		if (email == null || email.isBlank()) {
			throw new IllegalStateException("Google account has no email attribute");
		}
		final String finalEmail = email.trim().toLowerCase(Locale.ROOT);
		String name = oauth2User.getAttribute("name");
		final String finalName = (name == null || name.isBlank()) ? finalEmail : name;

		final Set<String> adminEmails = parseEmails(adminEmailsRaw);
		final Set<String> techEmails = parseEmails(technicianEmailsRaw);

		return userRepository.findByEmail(finalEmail).map(existing -> {
			if (!finalName.equals(existing.getName())) {
				existing.setName(finalName);
				return userRepository.save(existing);
			}
			return existing;
		}).orElseGet(() -> {
			Role role = Role.USER;
			if (adminEmails.contains(finalEmail)) {
				role = Role.ADMIN;
			} else if (techEmails.contains(finalEmail)) {
				role = Role.TECHNICIAN;
			}
			User u = User.builder()
					.email(finalEmail)
					.name(finalName)
					.role(role)
					.build();
			return userRepository.save(u);
		});
	}

	@Transactional(readOnly = true)
	public User requireById(Long id) {
		return userRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
	}

	@Transactional
	public User updateRole(Long userId, Role newRole) {
		User u = requireById(userId);
		u.setRole(newRole);
		return userRepository.save(u);
	}

	private static Set<String> parseEmails(String raw) {
		if (raw == null || raw.isBlank()) {
			return Set.of();
		}
		return new HashSet<>(Arrays.stream(raw.split(","))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.map(s -> s.toLowerCase(Locale.ROOT))
				.toList());
	}
}
