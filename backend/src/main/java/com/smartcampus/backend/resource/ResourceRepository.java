package com.smartcampus.backend.resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Resource entity.
 * Extends JpaRepository to provide CRUD operations and custom query methods.
 * Handles data access layer operations for resources.
 */
@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    /**
     * Finds all resources matching the specified type (case-insensitive search).
     *
     * @param type the resource type to search for
     * @return List of resources matching the specified type
     */
    List<Resource> findByTypeIgnoreCase(String type);

    /**
     * Finds all resources with capacity greater than or equal to the specified
     * minimum.
     *
     * @param capacity the minimum capacity threshold
     * @return List of resources with capacity >= the specified value
     */
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
}
