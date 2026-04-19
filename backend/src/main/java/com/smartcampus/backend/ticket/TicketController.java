package com.smartcampus.backend.ticket;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
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


