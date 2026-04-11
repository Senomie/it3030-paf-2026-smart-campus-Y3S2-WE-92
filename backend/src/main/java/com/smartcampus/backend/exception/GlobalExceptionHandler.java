package com.smartcampus.backend.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(SecurityException.class)
	public ResponseEntity<Map<String, Object>> forbidden(SecurityException ex) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(Map.of(
					"error", ex.getMessage(),
					"status", HttpStatus.FORBIDDEN.value(),
					"timestamp", System.currentTimeMillis()
				));
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Map<String, Object>> accessDenied(AccessDeniedException ex) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(Map.of(
					"error", "Access denied",
					"status", HttpStatus.FORBIDDEN.value(),
					"timestamp", System.currentTimeMillis()
				));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> badRequest(IllegalArgumentException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(Map.of(
					"error", ex.getMessage(),
					"status", HttpStatus.BAD_REQUEST.value(),
					"timestamp", System.currentTimeMillis()
				));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<Map<String, Object>> conflict(IllegalStateException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(Map.of(
					"error", ex.getMessage(),
					"status", HttpStatus.CONFLICT.value(),
					"timestamp", System.currentTimeMillis()
				));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException ex) {
		String msg = ex.getBindingResult().getFieldErrors().stream()
				.map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
				.findFirst()
				.orElse("Validation failed");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(Map.of(
					"error", msg,
					"status", HttpStatus.BAD_REQUEST.value(),
					"timestamp", System.currentTimeMillis()
				));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> generalException(Exception ex) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of(
					"error", "Internal server error",
					"status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
					"timestamp", System.currentTimeMillis()
				));
	}
}
