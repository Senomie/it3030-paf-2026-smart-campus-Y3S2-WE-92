package com.smartcampus.backend.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.smartcampus.backend.user.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

	@Value("${application.security.jwt.secret-key}")
	private String secretKey;

	@Value("${application.security.jwt.expiration}")
	private long expirationMs;

	public String generateToken(User user) {
		try {
			Map<String, Object> claims = new HashMap<>();
			claims.put("email", user.getEmail());
			claims.put("role", user.getRole().name());
			Date now = new Date();
			Date exp = new Date(now.getTime() + expirationMs);
			String token = Jwts.builder()
					.setClaims(claims)
					.setSubject(String.valueOf(user.getId()))
					.setIssuedAt(now)
					.setExpiration(exp)
					.signWith(signingKey(), SignatureAlgorithm.HS256)
					.compact();
			logger.debug("JWT token generated for user: {}", user.getId());
			return token;
		} catch (Exception e) {
			logger.error("Error generating JWT token for user: {}", user.getId(), e);
			throw new RuntimeException("Token generation failed", e);
		}
	}

	public boolean isTokenValid(String token) {
		try {
			Claims claims = parseClaims(token);
			boolean isValid = claims.getExpiration().after(new Date());
			if (!isValid) {
				logger.warn("Token validation failed: token expired");
			}
			return isValid;
		} catch (JwtException e) {
			logger.warn("JWT validation error: {}", e.getMessage());
			return false;
		} catch (Exception e) {
			logger.error("Unexpected error during token validation", e);
			return false;
		}
	}

	public Long extractUserId(String token) {
		try {
			String sub = parseClaims(token).getSubject();
			Long userId = Long.valueOf(sub);
			logger.debug("User ID extracted from token: {}", userId);
			return userId;
		} catch (NumberFormatException e) {
			logger.error("Invalid user ID format in token", e);
			throw new IllegalArgumentException("Invalid token subject", e);
		} catch (Exception e) {
			logger.error("Error extracting user ID from token", e);
			throw new RuntimeException("Token parsing failed", e);
		}
	}

	private Claims parseClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(signingKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
	}

	private SecretKey signingKey() {
		byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
		return Keys.hmacShaKeyFor(keyBytes);
	}
}
