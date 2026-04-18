package com.smartcampus.backend.resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * REST Controller for managing resource endpoints.
 * Provides endpoints for creating, retrieving, updating, and deleting
 * resources.
 * All endpoints support multipart/form-data for file uploads.
 */
@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    /**
     * Retrieves all resources or searches resources based on optional filters.
     *
     * @param type        optional resource type filter
     * @param minCapacity optional minimum capacity filter
     * @return ResponseEntity containing list of resources
     */
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity) {

        // If any filter is provided, perform a search; otherwise return all resources
        if (type != null || minCapacity != null) {
            return ResponseEntity.ok(resourceService.searchResources(type, minCapacity));
        }
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    /**
     * Retrieves a specific resource by its ID.
     *
     * @param id the ID of the resource to retrieve
     * @return ResponseEntity containing the requested resource
     */
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    /**
     * Creates a new resource with multipart form data support for images.
     * Validates required fields and capacity constraints.
     *
     * @param name      required resource name
     * @param type      required resource type
     * @param capacity  required resource capacity (must be non-negative)
     * @param location  required resource location
     * @param status    required resource status
     * @param startTime optional availability start time
     * @param endTime   optional availability end time
     * @param image     optional image file for the resource
     * @return ResponseEntity containing the created resource
     * @throws ResponseStatusException if validation fails
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Resource> createResource(
            @RequestParam("name") String name,
            @RequestParam("type") String type,
            @RequestParam("capacity") int capacity,
            @RequestParam("location") String location,
            @RequestParam("status") String status,
            @RequestParam(value = "startTime", required = false) String startTime,
            @RequestParam(value = "endTime", required = false) String endTime,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {

        // Validate that name is provided and not blank
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        // Validate that capacity is not negative
        if (capacity < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity cannot be negative");
        }

        // Create and return the new resource
        return ResponseEntity
                .ok(resourceService.createResource(name, type, capacity, location, status, startTime, endTime, image));
    }

    /**
     * Updates an existing resource with multipart form data support for images.
     *
     * @param id        the ID of the resource to update
     * @param name      the updated resource name
     * @param type      the updated resource type
     * @param capacity  the updated resource capacity
     * @param location  the updated resource location
     * @param status    the updated resource status
     * @param startTime optional updated availability start time
     * @param endTime   optional updated availability end time
     * @param image     optional new image file for the resource
     * @return ResponseEntity containing the updated resource
     */
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<Resource> updateResource(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("type") String type,
            @RequestParam("capacity") int capacity,
            @RequestParam("location") String location,
            @RequestParam("status") String status,
            @RequestParam(value = "startTime", required = false) String startTime,
            @RequestParam(value = "endTime", required = false) String endTime,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {

        // Update and return the modified resource
        return ResponseEntity.ok(resourceService.updateResourceMultipart(id, name, type, capacity, location, status,
                startTime, endTime, image));
    }

    /**
     * Deletes a resource by its ID.
     *
     * @param id the ID of the resource to delete
     * @return ResponseEntity with no content on successful deletion
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok().build();
    }
}
