package com.smartcampus.backend.user.dto;

import com.smartcampus.backend.user.Role;

import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(@NotNull Role role) {
}
