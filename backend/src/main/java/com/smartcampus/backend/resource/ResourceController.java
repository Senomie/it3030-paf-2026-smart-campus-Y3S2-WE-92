package com.smartcampus.backend.resource;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity) {
            
        if (type != null || minCapacity != null) {
            return ResponseEntity.ok(resourceService.searchResources(type, minCapacity));
        }
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

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
        
        if (name == null || name.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        if (capacity < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity cannot be negative");
        
        return ResponseEntity.ok(resourceService.createResource(name, type, capacity, location, status, startTime, endTime, image));
    }

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
        return ResponseEntity.ok(resourceService.updateResourceMultipart(id, name, type, capacity, location, status, startTime, endTime, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok().build();
    }
}

