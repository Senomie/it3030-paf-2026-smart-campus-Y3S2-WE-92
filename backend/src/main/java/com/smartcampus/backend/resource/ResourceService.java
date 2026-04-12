package com.smartcampus.backend.resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service class for managing resource operations.
 * Handles business logic for creating, retrieving, updating, and deleting
 * resources.
 * Provides resource search functionality based on type and capacity filters.
 */
@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    /**
     * Retrieves all resources from the database.
     *
     * @return List of all Resource objects
     */
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    /**
     * Retrieves a specific resource by its ID.
     *
     * @param id the ID of the resource to retrieve
     * @return the Resource object with the specified ID
     * @throws RuntimeException if resource is not found
     */
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    /**
     * Creates a new resource with the provided details and optional image.
     *
     * @param name      the name of the resource
     * @param type      the type of the resource (e.g., "classroom", "lab")
     * @param capacity  the maximum capacity of the resource
     * @param location  the physical location of the resource
     * @param status    the current status of the resource (e.g., "available",
     *                  "maintenance")
     * @param startTime the resource availability start time
     * @param endTime   the resource availability end time
     * @param image     optional MultipartFile containing the resource image
     * @return the newly created Resource object
     * @throws RuntimeException if image processing fails
     */
    public Resource createResource(String name, String type, int capacity, String location,
            String status, String startTime, String endTime,
            org.springframework.web.multipart.MultipartFile image) {
        // Initialize new resource object
        Resource r = new Resource();

        // Set basic resource properties
        r.setName(name);
        r.setType(type);
        r.setCapacity(capacity);
        r.setLocation(location);
        r.setStatus(status);
        r.setStartTime(startTime);
        r.setEndTime(endTime);

        // Generate availability windows string from start and end times
        r.setAvailabilityWindows("Daily " + startTime + " to " + endTime);

        // Process and store image if provided
        if (image != null && !image.isEmpty()) {
            try {
                r.setImage(image.getBytes());
                r.setImageContentType(image.getContentType());
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to store image", e);
            }
        }

        // Save and return the new resource
        return resourceRepository.save(r);
    }

    /**
     * Updates an existing resource with new details and optional image.
     *
     * @param id        the ID of the resource to update
     * @param name      the updated name of the resource
     * @param type      the updated type of the resource
     * @param capacity  the updated maximum capacity
     * @param location  the updated location
     * @param status    the updated status
     * @param startTime the updated availability start time
     * @param endTime   the updated availability end time
     * @param image     optional MultipartFile containing the new resource image
     * @return the updated Resource object
     * @throws RuntimeException if resource not found or image processing fails
     */
    public Resource updateResourceMultipart(Long id, String name, String type, int capacity,
            String location, String status, String startTime,
            String endTime, org.springframework.web.multipart.MultipartFile image) {
        // Retrieve existing resource by ID
        Resource existing = getResourceById(id);

        // Update all resource properties
        existing.setName(name);
        existing.setType(type);
        existing.setCapacity(capacity);
        existing.setLocation(location);
        existing.setStatus(status);
        existing.setStartTime(startTime);
        existing.setEndTime(endTime);

        // Update availability windows based on new times
        existing.setAvailabilityWindows("Daily " + startTime + " to " + endTime);

        // Process and update image if a new one is provided
        if (image != null && !image.isEmpty()) {
            try {
                existing.setImage(image.getBytes());
                existing.setImageContentType(image.getContentType());
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to store image", e);
            }
        }

        // Save and return the updated resource
        return resourceRepository.save(existing);
    }

    /**
     * Deletes a resource from the database by its ID.
     *
     * @param id the ID of the resource to delete
     */
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    /**
     * Searches resources based on optional type and minimum capacity filters.
     * If both filters are provided, only type filter is applied.
     *
     * @param type        optional resource type filter (case-insensitive)
     * @param minCapacity optional minimum capacity filter
     * @return List of Resource objects matching the search criteria
     */
    public List<Resource> searchResources(String type, Integer minCapacity) {
        // Filter by type if provided
        if (type != null && !type.isEmpty()) {
            return resourceRepository.findByTypeIgnoreCase(type);
        }
        // Filter by minimum capacity if type is not provided
        else if (minCapacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        }
        // Return all resources if no filters are applied
        return getAllResources();
    }
}
