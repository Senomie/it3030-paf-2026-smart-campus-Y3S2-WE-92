package com.smartcampus.backend.ticket;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.backend.notification.NotificationService;
import com.smartcampus.backend.ticket.dto.AddCommentRequest;
import com.smartcampus.backend.ticket.dto.CreateTicketRequest;
import com.smartcampus.backend.ticket.dto.TicketCommentResponse;
import com.smartcampus.backend.ticket.dto.TicketDetailResponse;
import com.smartcampus.backend.ticket.dto.TicketResponse;
import com.smartcampus.backend.ticket.dto.UpdateTicketStatusRequest;
import com.smartcampus.backend.user.Role;
import com.smartcampus.backend.user.User;
import com.smartcampus.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {


