package com.smartcampus.backend.ticket;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public TicketResponse create(Long reporterId, CreateTicketRequest req) {
        Ticket t = Ticket.builder()
                .reporterId(reporterId)
                .assigneeId(req.assigneeId())
                .title(req.title().trim())
                .description(req.description().trim())
                .status(TicketStatus.OPEN)
                .createdAt(LocalDateTime.now()) // ⭐ NEW: Start the clock!
                .build();
        return TicketResponse.from(ticketRepository.save(t));
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> listMine(Long reporterId) {
        return ticketRepository.findByReporterIdOrderByIdDesc(reporterId).stream()
                .map(TicketResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> listDesk() {
        return ticketRepository.findByStatusNotOrderByIdDesc(TicketStatus.CLOSED).stream()
                .map(TicketResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketDetailResponse getDetail(Long ticketId, Long userId, Role role) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        assertTicketAccess(t, userId, role);
        List<TicketCommentResponse> comments = ticketCommentRepository
                .findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(TicketCommentResponse::from)
                .toList();
        return TicketDetailResponse.builder()
                .ticket(TicketResponse.from(t))
                .comments(comments)
                .build();
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId, Long actorId, Role role, UpdateTicketStatusRequest req) {
        if (role != Role.ADMIN && role != Role.TECHNICIAN) {
            throw new SecurityException("Only staff can update ticket status");
        }
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        if (t.getStatus() == TicketStatus.CLOSED) {
            throw new IllegalStateException("Ticket is already closed");
        }
        TicketStatus newStatus = req.status();
        t.setStatus(newStatus);
        
        // ⭐ NEW: Stamp Resolution Time!
        if (newStatus == TicketStatus.RESOLVED && t.getResolvedAt() == null) {
            t.setResolvedAt(LocalDateTime.now());
        }
        
        ticketRepository.save(t);
        notifyStatusChange(t, actorId, formatStatus(newStatus));
        return TicketResponse.from(t);
    }
    
    @Transactional
    public TicketResponse assignTicket(Long ticketId, Long assigneeId, Long actorId, Role role) {
        try {
            if (role != Role.ADMIN && role != Role.TECHNICIAN) {
                throw new SecurityException("Only staff can assign tickets. Your role is: " + role);
            }
            
            Ticket t = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
                    
            User assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new IllegalArgumentException("Assignee not found in database"));
            
            t.setAssigneeId(assignee.getId());
            t.setStatus(TicketStatus.IN_PROGRESS); 
            
            // ⭐ NEW: Stamp First Response Time! (Only if it's the very first time being claimed)
            if (t.getFirstRespondedAt() == null) {
                t.setFirstRespondedAt(LocalDateTime.now());
            }
            
            ticketRepository.save(t);
            
            notifyStatusChange(t, actorId, "Assigned to Technician");
            
            System.out.println("✅ Ticket successfully assigned and saved to database!");
            return TicketResponse.from(t);
            
        } catch (Exception e) {
            System.err.println("\n=============================================");
            System.err.println("💥 DATABASE SAVE FAILED (ASSIGN) 💥");
            System.err.println("Error Message: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=============================================\n");
            throw e;
        }
    }

    @Transactional
    public TicketCommentResponse addComment(Long ticketId, Long authorId, Role role, AddCommentRequest req) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        assertTicketAccess(t, authorId, role);
        TicketComment c = TicketComment.builder()
                .ticketId(ticketId)
                .authorId(authorId)
                .body(req.body().trim())
                .build();
        TicketComment saved = ticketCommentRepository.save(c);
        notifyNewComment(t, authorId);
        return TicketCommentResponse.from(saved);
    }

    @Transactional
    public void addAttachment(Long ticketId, Long userId, Role role, MultipartFile file) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        assertTicketAccess(t, userId, role);

        try {
            System.out.println("📸 Attempting to save file: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");
            
            String sql = "INSERT INTO ticket_attachment (ticket_id, file_name, content_type, data) VALUES (?, ?, ?, ?)";
            jdbcTemplate.update(sql, ticketId, file.getOriginalFilename(), file.getContentType(), file.getBytes());
            
            System.out.println("✅ File saved successfully to database!");
            
        } catch (Exception e) {
            System.err.println("\n=============================================");
            System.err.println("💥 DATABASE UPLOAD FAILED: MYSQL BUG 💥");
            System.err.println("Error Message: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=============================================\n");
            throw new RuntimeException("Failed to process file data", e);
        }
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getAttachments(Long ticketId, Long userId, Role role) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        assertTicketAccess(t, userId, role);

        String sql = "SELECT id, file_name, content_type, data FROM ticket_attachment WHERE ticket_id = ?";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            java.util.Map<String, Object> attachment = new java.util.HashMap<>();
            attachment.put("id", rs.getLong("id"));
            attachment.put("fileName", rs.getString("file_name"));
            attachment.put("contentType", rs.getString("content_type"));
            attachment.put("data", rs.getBytes("data")); 
            return attachment;
        }, ticketId);
    }

    @Transactional
    public void deleteTicket(Long ticketId, Long userId, Role role) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        if (role != Role.ADMIN && role != Role.TECHNICIAN) {
            throw new SecurityException("Only staff can delete tickets.");
        }

        String deleteAttachmentsSql = "DELETE FROM ticket_attachment WHERE ticket_id = ?";
        jdbcTemplate.update(deleteAttachmentsSql, ticketId);

        ticketRepository.delete(t);
        System.out.println("🗑️ Ticket #" + ticketId + " has been completely deleted.");
    }

    private void assertTicketAccess(Ticket t, Long userId, Role role) {
        boolean staff = role == Role.ADMIN || role == Role.TECHNICIAN;
        boolean reporter = userId.equals(t.getReporterId());
        boolean assignee = t.getAssigneeId() != null && userId.equals(t.getAssigneeId());
        if (!(staff || reporter || assignee)) {
            throw new SecurityException("Forbidden");
        }
    }

    private void notifyStatusChange(Ticket t, Long actorId, String statusLabel) {
        if (!t.getReporterId().equals(actorId)) {
            userRepository.findById(t.getReporterId()).ifPresent(u -> notificationService
                    .notifyTicketStatus(u, t.getId(), t.getTitle(), statusLabel));
        }
        if (t.getAssigneeId() != null && !t.getAssigneeId().equals(actorId)) {
            userRepository.findById(t.getAssigneeId()).ifPresent(u -> notificationService
                    .notifyTicketStatus(u, t.getId(), t.getTitle(), statusLabel));
        }
    }

    private void notifyNewComment(Ticket t, Long authorId) {
        User author = userRepository.findById(authorId).orElseThrow();
        if (!t.getReporterId().equals(authorId)) {
            userRepository.findById(t.getReporterId()).ifPresent(u -> notificationService
                    .notifyTicketComment(u, t.getId(), t.getTitle(), author.getName()));
        }
        if (t.getAssigneeId() != null && !t.getAssigneeId().equals(authorId)) {
            userRepository.findById(t.getAssigneeId()).ifPresent(u -> notificationService
                    .notifyTicketComment(u, t.getId(), t.getTitle(), author.getName()));
        }
    }

    private static String formatStatus(TicketStatus s) {
        return s.name().replace('_', ' ').toLowerCase();
    }
}