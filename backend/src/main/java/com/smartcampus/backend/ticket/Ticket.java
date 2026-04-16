package com.smartcampus.backend.ticket;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "reporter_id", nullable = false)
	private Long reporterId;

	@Column(name = "assignee_id")
	private Long assigneeId;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false, length = 4000)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TicketStatus status;
}
