package com.smartcampus.backend.admin;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.user.User;
import com.smartcampus.backend.user.UserRepository;
import com.smartcampus.backend.user.UserService;
import com.smartcampus.backend.user.dto.UpdateRoleRequest;
import com.smartcampus.backend.user.dto.UserResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserController.class);

    private final UserService userService;
    private final UserRepository userRepository;


    /**
     * GET /api/admin/users - List all users
     *
     * @return List of all users in the system
     */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        try {
            logger.debug("Fetching all users");
            List<User> users = userRepository.findAll();
            List<UserResponse> responses = users.stream()
                    .map(UserResponse::from)
                    .toList();
            logger.debug("Retrieved {} users", responses.size());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            logger.error("Error fetching all users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * PUT /api/admin/users/{id}/role - Update user role
     *
     * @param id The user ID
     * @param request Request with new role
     * @return Updated user response
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
        try {
            if (id == null || id <= 0) {
                logger.warn("Invalid user id for role update: {}", id);
                return ResponseEntity.badRequest().build();
            }
            logger.debug("Updating role for user: {} to: {}", id, request.role());
            UserResponse response = UserResponse.from(userService.updateRole(id, request.role()));
            logger.info("User role updated successfully - user: {}, new role: {}", id, request.role());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("User not found for role update: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error updating user role: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * PATCH /api/admin/users/{id}/role - Update user role (semantic alternative to PUT)
     *
     * @param id The user ID
     * @param request Request with new role
     * @return Updated user response
     */
    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> patchUpdateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
        try {
            if (id == null || id <= 0) {
                logger.warn("Invalid user id for role patch: {}", id);
                return ResponseEntity.badRequest().build();
            }
            logger.debug("Patching role for user: {} to: {}", id, request.role());
            UserResponse response = UserResponse.from(userService.updateRole(id, request.role()));
            logger.info("User role patched successfully - user: {}, new role: {}", id, request.role());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("User not found for role patch: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error patching user role: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}