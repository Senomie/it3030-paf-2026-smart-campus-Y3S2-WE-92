package com.smartcampus.backend.ticket;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.ticket.dto.AddCommentRequest;
import com.smartcampus.backend.ticket.dto.CreateTicketRequest;
import com.smartcampus.backend.ticket.dto.TicketCommentResponse;
import com.smartcampus.backend.ticket.dto.TicketDetailResponse;
import com.smartcampus.backend.ticket.dto.TicketResponse;
import com.smartcampus.backend.ticket.dto.UpdateTicketStatusRequest;
import com.smartcampus.backend.user.Role;
import com.smartcampus.backend.user.User;
import com.smartcampus.backend.user.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

	private final TicketService ticketService;
	private final UserRepository userRepository;

	@PostMapping
	public TicketResponse create(Authentication auth, @Valid @RequestBody CreateTicketRequest request) {
		Long userId = (Long) auth.getPrincipal();
		return ticketService.create(userId, request);
	}

	@GetMapping("/mine")
	public List<TicketResponse> mine(Authentication auth) {
		Long userId = (Long) auth.getPrincipal();
		return ticketService.listMine(userId);
	}

	@GetMapping("/desk")
	@PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
	public List<TicketResponse> desk() {
		return ticketService.listDesk();
	}

	@GetMapping("/{id}")
	public TicketDetailResponse get(@PathVariable Long id, Authentication auth) {
		Caller c = Caller.from(auth, userRepository);
		return ticketService.getDetail(id, c.userId(), c.role());
	}

	@PatchMapping("/{id}/status")
	public TicketResponse updateStatus(
			@PathVariable Long id,
			Authentication auth,
			@Valid @RequestBody UpdateTicketStatusRequest request) {
		Caller c = Caller.from(auth, userRepository);
		return ticketService.updateStatus(id, c.userId(), c.role(), request);
	}

	@PostMapping("/{id}/comments")
	public TicketCommentResponse addComment(
			@PathVariable Long id,
			Authentication auth,
			@Valid @RequestBody AddCommentRequest request) {
		Caller c = Caller.from(auth, userRepository);
		return ticketService.addComment(id, c.userId(), c.role(), request);
	}

	private record Caller(Long userId, Role role) {
		static Caller from(Authentication auth, UserRepository users) {
			Long id = (Long) auth.getPrincipal();
			User u = users.findById(id).orElseThrow();
			return new Caller(u.getId(), u.getRole());
		}
	}
}
