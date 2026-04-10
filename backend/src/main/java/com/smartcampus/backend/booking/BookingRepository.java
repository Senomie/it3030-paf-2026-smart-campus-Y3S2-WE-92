package com.smartcampus.backend.booking;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

	List<Booking> findByUserIdOrderByStartTimeDesc(Long userId);

	List<Booking> findByStatusOrderByStartTimeAsc(BookingStatus status);

	@Query("""
			select count(b) from Booking b
			where b.resourceLabel = :resource
			and b.status in :statuses
			and b.startTime < :end and b.endTime > :start
			""")
	long countOverlapping(@Param("resource") String resource, @Param("start") LocalDateTime start,
			@Param("end") LocalDateTime end, @Param("statuses") List<BookingStatus> statuses);
}
