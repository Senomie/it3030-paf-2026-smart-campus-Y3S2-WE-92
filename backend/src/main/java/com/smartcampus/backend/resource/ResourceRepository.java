package com.smartcampus.backend.resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByTypeIgnoreCase(String type);
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
}
