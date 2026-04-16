package com.smartcampus.backend.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.smartcampus.backend.user.User;
import com.smartcampus.backend.user.UserService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

	private final UserService userService;
	private final JwtService jwtService;

	@Value("${app.frontend.url:http://localhost:5173}")
	private String frontendUrl;

	@Override
	public void onAuthenticationSuccess(
			HttpServletRequest request,
			HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {

		try {
			logger.info("Processing OAuth2 authentication success");
			
			OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
			String email = oauth2User.getAttribute("email");
			logger.debug("OAuth2 user email: {}", email);
			
			User user = userService.processOAuthPostLogin(oauth2User);
			logger.info("User processed: {} ({})", user.getId(), user.getEmail());
			
			String token = jwtService.generateToken(user);
			logger.debug("JWT token generated for user: {}", user.getId());
			
			String target = frontendUrl.replaceAll("/$", "")
					+ "/login/success?token="
					+ URLEncoder.encode(token, StandardCharsets.UTF_8);
			
			logger.debug("Redirecting to: {}", target);
			getRedirectStrategy().sendRedirect(request, response, target);
			
		} catch (Exception e) {
			logger.error("OAuth2 authentication success handler failed", e);
			handleAuthenticationError(response, e);
		}
	}

	private void handleAuthenticationError(HttpServletResponse response, Exception e) throws IOException {
		logger.error("Authentication error: {}", e.getMessage());
		response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed: " + e.getMessage());
	}
}
