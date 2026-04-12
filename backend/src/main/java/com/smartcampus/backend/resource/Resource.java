package com.smartcampus.backend.resource;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * Entity class representing a campus resource (e.g., classroom, lab, meeting
 * room).
 * Stores resource information including name, type, capacity, location, and
 * availability.
 * Supports image storage as binary data.
 */
@Entity
@Table(name = "resources")
public class Resource {

    // Primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Resource name - required field
    @NotBlank(message = "Resource name is required")
    @Column(nullable = false)
    private String name;

    // Resource type (e.g., "classroom", "lab", "meeting_room") - required field
    @NotBlank(message = "Resource type is required")
    @Column(nullable = false)
    private String type;

    // Capacity of the resource - must be >= 0
    @Min(value = 0, message = "Capacity must be at least 0")
    private int capacity;

    // Physical location of the resource - required field
    @NotBlank(message = "Location is required")
    private String location;

    // Availability windows (e.g., "Daily 9:00 to 17:00")
    private String availabilityWindows;

    // Binary image data stored as LONGBLOB in database
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] image;

    // MIME type of the stored image (e.g., "image/jpeg", "image/png")
    private String imageContentType;

    // Resource availability start time (e.g., "09:00")
    private String startTime;

    // Resource availability end time (e.g., "17:00")
    private String endTime;

    // Current status of the resource (e.g., "available", "maintenance",
    // "unavailable")
    @Column(nullable = false)
    private String status;

    /**
     * Default constructor for Resource entity.
     */
    public Resource() {
    }

    /**
     * Constructor to create a Resource with basic information.
     *
     * @param name                the name of the resource
     * @param type                the type of the resource
     * @param capacity            the capacity of the resource
     * @param location            the location of the resource
     * @param availabilityWindows the availability windows string
     * @param status              the status of the resource
     */
    public Resource(String name, String type, int capacity, String location, String availabilityWindows,
            String status) {
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.availabilityWindows = availabilityWindows;
        this.status = status;
    }

    // Getters and Setters

    /**
     * Gets the resource ID.
     * 
     * @return the unique identifier of the resource
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the resource ID.
     * 
     * @param id the unique identifier to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the resource name.
     * 
     * @return the name of the resource
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the resource name.
     * 
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the resource type.
     * 
     * @return the type of the resource
     */
    public String getType() {
        return type;
    }

    /**
     * Sets the resource type.
     * 
     * @param type the type to set
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * Gets the resource capacity.
     * 
     * @return the maximum capacity of the resource
     */
    public int getCapacity() {
        return capacity;
    }

    /**
     * Sets the resource capacity.
     * 
     * @param capacity the capacity to set
     */
    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    /**
     * Gets the resource location.
     * 
     * @return the physical location of the resource
     */
    public String getLocation() {
        return location;
    }

    /**
     * Sets the resource location.
     * 
     * @param location the location to set
     */
    public void setLocation(String location) {
        this.location = location;
    }

    /**
     * Gets the availability windows.
     * 
     * @return the availability windows string
     */
    public String getAvailabilityWindows() {
        return availabilityWindows;
    }

    /**
     * Sets the availability windows.
     * 
     * @param availabilityWindows the availability windows string to set
     */
    public void setAvailabilityWindows(String availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }

    /**
     * Gets the resource status.
     * 
     * @return the current status of the resource
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the resource status.
     * 
     * @param status the status to set
     */
    public void setStatus(String status) {
        this.status = status;
    }

    /**
     * Gets the image data.
     * 
     * @return the byte array containing the image data
     */
    public byte[] getImage() {
        return image;
    }

    /**
     * Sets the image data.
     * 
     * @param image the byte array containing the image data
     */
    public void setImage(byte[] image) {
        this.image = image;
    }

    /**
     * Gets the image content type.
     * 
     * @return the MIME type of the image (e.g., "image/jpeg")
     */
    public String getImageContentType() {
        return imageContentType;
    }

    /**
     * Sets the image content type.
     * 
     * @param imageContentType the MIME type of the image
     */
    public void setImageContentType(String imageContentType) {
        this.imageContentType = imageContentType;
    }

    /**
     * Gets the start time of resource availability.
     * 
     * @return the availability start time
     */
    public String getStartTime() {
        return startTime;
    }

    /**
     * Sets the start time of resource availability.
     * 
     * @param startTime the availability start time to set
     */
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    /**
     * Gets the end time of resource availability.
     * 
     * @return the availability end time
     */
    public String getEndTime() {
        return endTime;
    }

    /**
     * Sets the end time of resource availability.
     * 
     * @param endTime the availability end time to set
     */
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}
