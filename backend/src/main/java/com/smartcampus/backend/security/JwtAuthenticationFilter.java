package com.smartcampus.backend.security;

import java.io.IOException;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.smartcampus.backend.user.Role;
import com.smartcampus.backend.user.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

	private final JwtService jwtService;
	private final UserRepository userRepository;

	@Override
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {

		String path = request.getRequestURI();
		if (path != null && (path.startsWith("/oauth2") || path.startsWith("/login/oauth2"))) {
			logger.debug("Skipping JWT filter for OAuth2 path: {}", path);
			filterChain.doFilter(request, response);
			return;
		}

		try {
			String header = request.getHeader("Authorization");
			if (header != null && header.startsWith("Bearer ")) {
				String token = header.substring(7);
				logger.debug("Processing JWT token for request: {}", path);
				
				if (jwtService.isTokenValid(token)) {
					Long userId = jwtService.extractUserId(token);
					userRepository.findById(userId).ifPresentOrElse(
						user -> {
							var auth = new UsernamePasswordAuthenticationToken(
									user.getId(),
									null,
									Collections.singletonList(new SimpleGrantedAuthority(roleAuthority(user.getRole()))));
							SecurityContextHolder.getContext().setAuthentication(auth);
							logger.debug("Authentication set for user: {}, path: {}", userId, path);
						},
						() -> logger.warn("User not found for JWT token - userId: {}", userId)
					);
				} else {
					logger.warn("Invalid or expired JWT token");
				}
			} else {
				logger.debug("No Authorization header found for path: {}", path);
			}
		} catch (Exception e) {
			logger.error("Error processing JWT authentication", e);
			SecurityContextHolder.clearContext();
		}

		filterChain.doFilter(request, response);
	}

	private static String roleAuthority(Role role) {
		return "ROLE_" + role.name();
	}
}
