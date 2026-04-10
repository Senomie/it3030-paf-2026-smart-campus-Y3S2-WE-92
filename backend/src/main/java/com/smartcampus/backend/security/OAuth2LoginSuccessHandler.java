package com.smartcampus.backend.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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

	private final UserService userService;
	private final JwtService jwtService;

	@Value("${app.frontend.url:http://localhost:5173}")
	private String frontendUrl;

	@Override
	public void onAuthenticationSuccess(
			HttpServletRequest request,
			HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {

		OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
		User user = userService.processOAuthPostLogin(oauth2User);
		String token = jwtService.generateToken(user);
		String target = frontendUrl.replaceAll("/$", "")
				+ "/login/success?token="
				+ URLEncoder.encode(token, StandardCharsets.UTF_8);
		getRedirectStrategy().sendRedirect(request, response, target);
	}
}
