# Smart Campus Notifications API - Testing Guide

**Author:** Member 4 (Module D - Notifications & Module E - Authentication)  
**Date:** April 14, 2026  
**Status:** Complete Implementation

---

## 📋 Table of Contents
1. [API Overview](#api-overview)
2. [Setup Instructions](#setup-instructions)
3. [Endpoint Testing](#endpoint-testing)
4. [Security & Authorization](#security--authorization)
5. [Error Handling](#error-handling)
6. [Testing Checklist](#testing-checklist)

---

## API Overview

### Base URL
- **Local Development:** `http://localhost:8080/api`
- **Production:** `<deployed_url>/api`

### Authentication
All endpoints require **JWT Bearer Token** (obtained from OAuth 2.0 Google login).

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

### Implemented Endpoints Summary

| # | Method | Endpoint | Purpose | Roles |
|---|--------|----------|---------|-------|
| 1 | GET | `/notifications/user/{userId}` | List all notifications | USER, ADMIN, TECHNICIAN |
| 2 | PATCH | `/notifications/{id}/read` | Mark notification as read | USER, ADMIN, TECHNICIAN |
| 3 | DELETE | `/notifications/{id}` | Delete notification | USER, ADMIN, TECHNICIAN |
| 4 | GET | `/notifications/preferences/{userId}` | Get preferences | USER, ADMIN, TECHNICIAN |
| 5 | PUT | `/notifications/preferences/{userId}` | Update preferences | USER, ADMIN, TECHNICIAN |

---

## Setup Instructions

### 1. Import Postman Collection
1. Open Postman
2. Click **Import** → **Choose Files**
3. Select: `docs/Smart_Campus_Notifications_API.postman_collection.json`
4. Collection will appear under **Collections** tab

### 2. Configure Variables
Update the following variables in Postman (top-right **Variables** section):

```json
{
  "base_url": "http://localhost:8080/api",
  "jwt_token": "your_jwt_token_from_oauth_login",
  "user_id": "1",
  "notification_id": "101"
}
```

### 3. Obtain JWT Token
1. Start the backend: `mvn spring-boot:run`
2. Start the frontend: `npm run dev`
3. Navigate to `http://localhost:5173/login`
4. Click "Continue with Google"
5. Open **Developer Console** (F12) → **Application** → **Local Storage**
6. Find `jwt_token` and copy its value
7. Paste in Postman Variables

---

## Endpoint Testing

### 1️⃣ GET - List User Notifications

**Request:**
```
GET {{base_url}}/notifications/user/{{user_id}}
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ **Success (200):** User fetches their own notifications
- ✅ **Forbidden (403):** User tries to fetch another user's notifications (non-admin)
- ✅ **Not Found (404):** Invalid userId

**Expected Response (200):**
```json
[
  {
    "id": 101,
    "type": "BOOKING_APPROVED",
    "title": "Booking approved",
    "message": "Your booking for \"Lecture Hall A\" was approved.",
    "read": false,
    "createdAt": "2026-04-14T10:30:00Z",
    "relatedBookingId": 5,
    "relatedTicketId": null
  }
]
```

---

### 2️⃣ PATCH - Mark Notification as Read

**Request:**
```
PATCH {{base_url}}/notifications/{{notification_id}}/read
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ **Success (200):** Mark own notification as read
- ✅ **Forbidden (403):** Try to mark another user's notification (non-admin)
- ✅ **Not Found (404):** Invalid notification ID

**Expected Response (200):**
```json
{
  "id": 101,
  "type": "BOOKING_APPROVED",
  "title": "Booking approved",
  "message": "Your booking for \"Lecture Hall A\" was approved.",
  "read": true,
  "createdAt": "2026-04-14T10:30:00Z",
  "relatedBookingId": 5,
  "relatedTicketId": null
}
```

---

### 3️⃣ DELETE - Remove Notification

**Request:**
```
DELETE {{base_url}}/notifications/{{notification_id}}
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ **Success (204):** Delete own notification
- ✅ **Forbidden (403):** Try to delete another user's notification (non-admin)
- ✅ **Not Found (404):** Invalid notification ID

**Expected Response:** 204 No Content (empty body)

---

### 4️⃣ GET - Notification Preferences

**Request:**
```
GET {{base_url}}/notifications/preferences/{{user_id}}
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ **Success (200):** Get own preferences
- ✅ **Forbidden (403):** Try to fetch another user's preferences (non-admin)
- ✅ **Empty array:** User with no custom preferences

**Expected Response (200):**
```json
[
  {
    "id": 1,
    "type": "BOOKING_APPROVED",
    "enabled": true
  },
  {
    "id": 2,
    "type": "BOOKING_REJECTED",
    "enabled": true
  },
  {
    "id": 3,
    "type": "TICKET_STATUS",
    "enabled": true
  },
  {
    "id": 4,
    "type": "TICKET_COMMENT",
    "enabled": false
  }
]
```

---

### 5️⃣ PUT - Update Notification Preference

**Request:**
```
PUT {{base_url}}/notifications/preferences/{{user_id}}
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "type": "BOOKING_APPROVED",
  "enabled": false
}
```

**Test Cases:**
- ✅ **Success (200):** Update own preference
- ✅ **Forbidden (403):** Try to update another user's preference (non-admin)
- ✅ **Bad Request (400):** Missing required fields (type or enabled)
- ✅ **Idempotent:** Update same preference twice should work

**Request Body Validation:**
```
type: "BOOKING_APPROVED" | "BOOKING_REJECTED" | "TICKET_STATUS" | "TICKET_COMMENT" (required)
enabled: true | false (required)
```

**Expected Response (200):**
```json
{
  "id": 1,
  "type": "BOOKING_APPROVED",
  "enabled": false
}
```

---

## Security & Authorization

### Role-Based Access Control

All endpoints are protected with `@PreAuthorize` annotations:

```java
@PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
```

### Ownership Rules

| Operation | Rule |
|-----------|------|
| GET notifications | User can only view own; ADMIN sees all |
| PATCH/DELETE notification | User can only modify own; ADMIN can modify any |
| GET preferences | User can only view own; ADMIN sees all |
| PUT preferences | User can only update own; ADMIN can update any |

### Error Responses

**401 Unauthorized** - Missing or invalid JWT token
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**403 Forbidden** - Insufficient permissions
```json
{
  "error": "Forbidden",
  "message": "Cannot read another user's notifications"
}
```

**400 Bad Request** - Invalid input
```json
{
  "error": "Bad Request",
  "message": "Type is required"
}
```

**404 Not Found** - Resource doesn't exist
```json
{
  "error": "Not Found",
  "message": "Notification not found"
}
```

---

## Error Handling

### Input Validation
- `type`: Must be one of the 4 NotificationType enum values
- `enabled`: Must be a boolean (true/false)
- `userId` / `id`: Must be positive integers

### Exception Handling
```java
// In NotificationService
if (!principalUserId.equals(requestedUserId) && principalRole != Role.ADMIN) {
    throw new SecurityException("Cannot read another user's notifications");
}

notificationRepository.findById(notificationId)
    .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
```

### Response Status Codes

| Code | Scenario |
|------|----------|
| 200 OK | Successful GET/PATCH/PUT |
| 204 No Content | Successful DELETE |
| 400 Bad Request | Validation error |
| 401 Unauthorized | Missing/invalid authentication |
| 403 Forbidden | Insufficient permissions |
| 404 Not Found | Resource not found |
| 500 Internal Server Error | Server error |

---

## Testing Checklist

### ✅ Functional Testing

- [ ] **Test 1:** GET notifications - returns list sorted by creation date (newest first)
- [ ] **Test 2:** PATCH mark as read - notification.read changes from false to true
- [ ] **Test 3:** DELETE notification - notification is removed from database
- [ ] **Test 4:** GET preferences - returns all 4 notification types
- [ ] **Test 5:** PUT preference - updates enabled flag correctly

### ✅ Security Testing

- [ ] **Test 6:** Unauthenticated request - returns 401 Unauthorized
- [ ] **Test 7:** Invalid JWT token - returns 401 Unauthorized
- [ ] **Test 8:** User tries GET another user's notifications - returns 403 Forbidden
- [ ] **Test 9:** User tries PATCH another user's notification - returns 403 Forbidden
- [ ] **Test 10:** ADMIN can modify other users' notifications - returns 200 OK

### ✅ Validation Testing

- [ ] **Test 11:** PUT preference without "type" field - returns 400 Bad Request
- [ ] **Test 12:** PUT preference without "enabled" field - returns 400 Bad Request
- [ ] **Test 13:** Invalid notification ID - returns 404 Not Found
- [ ] **Test 14:** Invalid user ID - returns 404 or empty array

### ✅ Database Testing

- [ ] **Test 15:** Notification persists after creation
- [ ] **Test 16:** NotificationPreference persists after update
- [ ] **Test 17:** Deleted notification is removed from database
- [ ] **Test 18:** Multiple users have isolated notifications

### ✅ Integration Testing

- [ ] **Test 19:** Booking approval triggers notification creation
- [ ] **Test 20:** Booking rejection sends notification with reason
- [ ] **Test 21:** Ticket status update sends notification
- [ ] **Test 22:** Ticket comment creates notification

---

## HTTP Methods Summary (Member 4)

As per assignment requirements: **Each member must implement at least 4 REST API endpoints using different HTTP methods**

| # | Method | Endpoint | Count |
|---|--------|----------|-------|
| ✅ | GET | `/notifications/user/{userId}` | 1 |
| ✅ | PATCH | `/notifications/{id}/read` | 1 |
| ✅ | DELETE | `/notifications/{id}` | 1 |
| ✅ | GET | `/notifications/preferences/{userId}` | 2 |
| ✅ | PUT | `/notifications/preferences/{userId}` | 1 |
| | | **Total Different Methods** | **4 methods** ✅ |

**Methods Used:**
- ✅ GET (2 endpoints)
- ✅ PATCH (1 endpoint)
- ✅ DELETE (1 endpoint)
- ✅ PUT (1 endpoint)

---

## Deployment Notes

### Environment Variables Required
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Database Setup
Notifications and preferences are automatically created by Hibernate DDL (application.properties: `ddl-auto=update`)

### CORS Configuration
Endpoints allow requests from frontend at `http://localhost:5173` (configurable via `app.frontend.url`)

---

## References

- **Assignment:** IT3030 - PAF Assignment 2026
- **Module:** Module D (Notifications) & Module E (Authentication & Authorization)
- **Implemented By:** Member 4
- **Commit:** Includes security annotations and full documentation
- **Database:** MySQL (smart_campus database)

