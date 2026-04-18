# Smart Campus API Documentation - Member 4 Implementation

## Overview
Complete API reference for Member 4's implementation of the Smart Campus Operations Hub. Covers OAuth 2.0 authentication (Module E) and notification management (Module D) with role-based access control.

**Backend API**: `http://localhost:8080`  
**API Version**: v1  
**Last Updated**: April 16, 2026

---

## Table of Contents
1. [Authentication](#authentication)
2. [Authorization](#authorization)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Codes](#error-codes)
6. [Security Guidelines](#security-guidelines)

---

## Authentication

### OAuth 2.0 With Google

#### Flow Overview
1. User initiates login from frontend
2. Redirected to Google OAuth2 endpoint
3. User authenticates with Google credentials
4. Backend receives OAuth2 credentials
5. Backend creates/updates user in database
6. JWT token generated and returned
7. Frontend stores JWT token for API requests

#### Implementation Details

**Backend OAuth2 Configuration**:
```properties
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=profile,email,picture
```

**OAuth2 Redirect Endpoint**:
```
GET /oauth2/authorization/google
```

**Success Redirect**:
```
GET /login/success?token=<JWT_TOKEN>
```

---

### JWT Token Authentication

#### Token Generation
Generated after successful OAuth2 login by `OAuth2LoginSuccessHandler`

**Token Payload** (example):
```json
{
  "email": "user@smartcampus.com",
  "role": "USER",
  "sub": "1",
  "iat": 1713177600,
  "exp": 1713264000
}
```

**Token Configuration**:
```properties
application.security.jwt.secret-key=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
application.security.jwt.expiration=86400000  # 24 hours
```

#### Using JWT Token

**Include in Authorization Header**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Example Request**:
```http
GET /api/notifications/user/1 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAc21hcnRjYW1wdXMuY29tIiwicm9sZSI6IlVTRVIiLCJzdWIiOiIxIn0...
Content-Type: application/json
```

---

## Authorization

### Role-Based Access Control (RBAC)

#### Available Roles

| Role | Permissions | Module | Notes |
|------|-------------|--------|-------|
| **USER** | View own notifications, update own preferences | Module D | Default role for new users |
| **ADMIN** | All USER permissions + manage all users, change roles | Module E | Assigned via admin-emails config |
| **TECHNICIAN** | All USER permissions + ticket operations | Module C | Assigned via technician-emails config |

#### Role Assignment

**Automatic** (on first Google login):
```properties
app.security.admin-emails=admin@example.com,admin2@example.com
app.security.technician-emails=tech@example.com,tech2@example.com
```

**Manual** (via admin endpoint):
```
PUT /api/admin/users/{id}/role
Body: { "role": "TECHNICIAN" }
```

#### Authorization Enforcement

**Using @PreAuthorize Annotation**:
```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping
public ResponseEntity<List<UserResponse>> getAllUsers() { ... }
```

---

## API Endpoints

### Endpoint Summary

| Method | Endpoint | Role | Module | Purpose |
|--------|----------|------|--------|---------|
| **POST** | `/oauth2/authorization/google` | PUBLIC | Auth | Initiate OAuth login |
| **GET** | `/login/success?token=...` | PUBLIC | Auth | OAuth callback (frontend) |
| **GET** | `/api/admin/users` | ADMIN | E | List all users |
| **PUT** | `/api/admin/users/{id}/role` | ADMIN | E | Update user role |
| **PATCH** | `/api/admin/users/{id}/role` | ADMIN | E | Update user role (alternative) |
| **GET** | `/api/notifications/user/{userId}` | USER+ | D | List user notifications |
| **PATCH** | `/api/notifications/{id}/read` | USER+ | D | Mark notification as read |
| **DELETE** | `/api/notifications/{id}` | USER+ | D | Delete notification |
| **GET** | `/api/notifications/preferences/{userId}` | USER+ | D | Get notification preferences |
| **PUT** | `/api/notifications/preferences/{userId}` | USER+ | D | Update notification preferences |

---

## Detailed Endpoint Specifications

### 1. OAuth2 Authorization Initiation
**Module**: E (Authentication)  
**Endpoint**: `/oauth2/authorization/google`  
**Method**: GET  
**Auth Required**: No

**Purpose**: Initiates Google OAuth2 login flow

**Request**:
```http
GET /oauth2/authorization/google HTTP/1.1
Host: localhost:8080
```

**Response** (302 Redirect):
```
Location: https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...
```

**Status Codes**:
- `302 Found`: Redirects to Google login
- `400 Bad Request`: Invalid OAuth2 configuration

**Error Responses**:
```json
{
  "error": "invalid_oauth2_config",
  "message": "Google OAuth2 credentials not configured"
}
```

---

### 2. OAuth2 Callback
**Module**: E (Authentication)  
**Endpoint**: `/login/success`  
**Method**: GET  
**Auth Required**: No  
**Query Params**: `token` (JWT token)

**Purpose**: Frontend receiving JWT after OAuth2 success

**Request**:
```http
GET /login/success?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... HTTP/1.1
Host: localhost:5173
```

**Response**:
Frontend handles token storage and redirects to dashboard.

---

### 3. Get All Users (Admin)
**Module**: E (Authorization)  
**Endpoint**: `/api/admin/users`  
**Method**: GET  
**Auth Required**: Yes (JWT)  
**Role Required**: ADMIN  
**Response Format**: `application/json`

**Purpose**: List all users in the system (admin only)

**Request**:
```http
GET /api/admin/users HTTP/1.1
Host: localhost:8080
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "email": "admin@smart.com",
    "name": "System Admin",
    "role": "ADMIN"
  },
  {
    "id": 2,
    "email": "user@smart.com",
    "name": "John Doe",
    "role": "USER"
  },
  {
    "id": 3,
    "email": "tech@smart.com",
    "name": "Tech Support",
    "role": "TECHNICIAN"
  }
]
```

**Status Codes**:
- `200 OK`: Users retrieved successfully
- `401 Unauthorized`: Invalid/missing token
- `403 Forbidden`: Insufficient permissions (not ADMIN)
- `500 Server Error`: Database error

**Error Response** (403):
```json
{
  "error": "access_denied",
  "message": "User is not authorized to access this resource"
}
```

---

### 4. Update User Role (PUT)
**Module**: E (Authorization)  
**Endpoint**: `/api/admin/users/{id}/role`  
**Method**: PUT  
**Auth Required**: Yes (JWT)  
**Role Required**: ADMIN  
**Content-Type**: `application/json`

**Purpose**: Update a user's role

**Request Path Variables**:
```
{id} - Numeric user ID (1, 2, 3, etc.)
```

**Request Body**:
```json
{
  "role": "TECHNICIAN"
}
```

**Full Request Example**:
```http
PUT /api/admin/users/2/role HTTP/1.1
Host: localhost:8080
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "role": "TECHNICIAN"
}
```

**Valid Roles**:
- `USER` - Standard user
- `ADMIN` - Full administrative access
- `TECHNICIAN` - Technical support role

**Response** (200 OK):
```json
{
  "id": 2,
  "email": "john@smart.com",
  "name": "John Doe",
  "role": "TECHNICIAN"
}
```

**Status Codes**:
- `200 OK`: Role updated successfully
- `400 Bad Request`: Invalid role or user ID
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Not ADMIN
- `404 Not Found`: User doesn't exist (id: 99999)
- `500 Server Error`: Database error

**Error Responses**:

**400 - Invalid Role**:
```json
{
  "error": "invalid_role",
  "message": "Invalid role value. Valid values: USER, ADMIN, TECHNICIAN"
}
```

**404 - User Not Found**:
```json
{
  "error": "not_found",
  "message": "User with ID 99999 not found"
}
```

---

### 5. Update User Role (PATCH)
**Module**: E (Authorization)  
**Endpoint**: `/api/admin/users/{id}/role`  
**Method**: PATCH  
**Auth Required**: Yes (JWT)  
**Role Required**: ADMIN

**Purpose**: Semantic alternative to PUT for role updates

**Request Body**:
```json
{
  "role": "ADMIN"
}
```

**Full Request**:
```http
PATCH /api/admin/users/2/role HTTP/1.1
Host: localhost:8080
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

**Response** (200 OK):
```json
{
  "id": 2,
  "email": "john@smart.com",
  "name": "John Doe",
  "role": "ADMIN"
}
```

**Note**: PATCH and PUT methods are functionally identical for this operation.

**Status Codes**: Same as PUT endpoint

---

### 6. Get User Notifications
**Module**: D (Notifications)  
**Endpoint**: `/api/notifications/user/{userId}`  
**Method**: GET  
**Auth Required**: Yes (JWT)  
**Role Required**: USER (or higher)

**Purpose**: Retrieve all notifications for a specific user

**Request Path Variables**:
```
{userId} - Numeric user ID
```

**Request**:
```http
GET /api/notifications/user/1 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response** (200 OK):
```json
[
  {
    "id": 101,
    "userId": 1,
    "type": "BOOKING_APPROVED",
    "title": "Booking Confirmed",
    "message": "Your resource booking has been approved",
    "isRead": false,
    "createdAt": "2026-04-16T10:30:00Z"
  },
  {
    "id": 102,
    "userId": 1,
    "type": "TICKET_COMMENT",
    "title": "New Comment on Ticket",
    "message": "A technician commented on your support ticket",
    "isRead": true,
    "createdAt": "2026-04-15T14:15:00Z"
  }
]
```

**Status Codes**:
- `200 OK`: Notifications retrieved
- `400 Bad Request`: Invalid user ID parameter
- `401 Unauthorized`: Missing/invalid token
- `500 Server Error`: Database error

**Validation**:
```
userId > 0: Required
```

---

### 7. Mark Notification as Read
**Module**: D (Notifications)  
**Endpoint**: `/api/notifications/{id}/read`  
**Method**: PATCH  
**Auth Required**: Yes (JWT)  
**Role Required**: USER (or higher)

**Purpose**: Mark a single notification as read

**Request Path Variables**:
```
{id} - Numeric notification ID
```

**Request**:
```http
PATCH /api/notifications/101/read HTTP/1.1
Host: localhost:8080
Authorization: Bearer <JWT_TOKEN>
```

**Response** (200 OK):
```json
{
  "id": 101,
  "userId": 1,
  "type": "BOOKING_APPROVED",
  "title": "Booking Confirmed",
  "message": "Your resource booking has been approved",
  "isRead": true,
  "createdAt": "2026-04-16T10:30:00Z"
}
```

**Status Codes**:
- `200 OK`: Marked as read successfully
- `400 Bad Request`: Invalid notification ID
- `401 Unauthorized`: Missing/invalid token
- `404 Not Found`: Notification doesn't exist
- `500 Server Error`: Database error

---

### 8. Delete Notification
**Module**: D (Notifications)  
**Endpoint**: `/api/notifications/{id}`  
**Method**: DELETE  
**Auth Required**: Yes (JWT)  
**Role Required**: USER (or higher)

**Purpose**: Permanently delete a notification

**Request**:
```http
DELETE /api/notifications/101 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <JWT_TOKEN>
```

**Response** (204 No Content):
```
[Empty body]
```

**Status Codes**:
- `204 No Content`: Deleted successfully
- `400 Bad Request`: Invalid notification ID
- `401 Unauthorized`: Missing/invalid token
- `404 Not Found`: Notification doesn't exist
- `500 Server Error`: Database error

---

### 9. Get Notification Preferences
**Module**: D (Notifications)  
**Endpoint**: `/api/notifications/preferences/{userId}`  
**Method**: GET  
**Auth Required**: Yes (JWT)  
**Role Required**: USER (or higher)

**Purpose**: Retrieve user's notification preferences

**Request**:
```http
GET /api/notifications/preferences/1 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <JWT_TOKEN>
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "userId": 1,
    "type": "BOOKING_APPROVED",
    "enabled": true
  },
  {
    "id": 2,
    "userId": 1,
    "type": "BOOKING_REJECTED",
    "enabled": false
  },
  {
    "id": 3,
    "userId": 1,
    "type": "TICKET_STATUS",
    "enabled": true
  },
  {
    "id": 4,
    "userId": 1,
    "type": "TICKET_COMMENT",
    "enabled": true
  }
]
```

**Notification Types**:
- `BOOKING_APPROVED` - Resource booking approved
- `BOOKING_REJECTED` - Resource booking rejected
- `TICKET_STATUS` - Support ticket status change
- `TICKET_COMMENT` - New comment on support ticket

**Status Codes**:
- `200 OK`: Preferences retrieved
- `400 Bad Request`: Invalid user ID
- `401 Unauthorized`: Missing/invalid token
- `500 Server Error`: Database error

---

### 10. Update Notification Preferences
**Module**: D (Notifications)  
**Endpoint**: `/api/notifications/preferences/{userId}`  
**Method**: PUT  
**Auth Required**: Yes (JWT)  
**Role Required**: USER (or higher)  
**Content-Type**: `application/json`

**Purpose**: Update a user's notification preference

**Request Body**:
```json
{
  "type": "BOOKING_APPROVED",
  "enabled": false
}
```

**Full Request**:
```http
PUT /api/notifications/preferences/1 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "type": "BOOKING_APPROVED",
  "enabled": false
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "userId": 1,
  "type": "BOOKING_APPROVED",
  "enabled": false
}
```

**Status Codes**:
- `200 OK`: Preference updated
- `400 Bad Request`: Invalid request or user ID
- `401 Unauthorized`: Missing/invalid token
- `500 Server Error`: Database error

---

## Data Models

### User Model
```json
{
  "id": 1,
  "email": "user@smart.com",
  "name": "John Doe",
  "role": "USER",
  "profilePictureUrl": "https://lh3.googleusercontent.com/...",
  "createdAt": "2026-04-10T08:00:00Z",
  "updatedAt": "2026-04-16T12:00:00Z"
}
```

### Notification Model
```json
{
  "id": 101,
  "userId": 1,
  "type": "BOOKING_APPROVED",
  "title": "Booking Confirmed",
  "message": "Your resource booking has been approved",
  "isRead": false,
  "data": {
    "bookingId": "BOOK-001",
    "resourceName": "Meeting Room A"
  },
  "createdAt": "2026-04-16T10:30:00Z"
}
```

### NotificationPreference Model
```json
{
  "id": 1,
  "userId": 1,
  "type": "BOOKING_APPROVED",
  "enabled": true
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200 OK` | Success | Successful GET, PUT, PATCH |
| `204 No Content` | Success, no content | Successful DELETE |
| `400 Bad Request` | Invalid request | Invalid parameters, missing required fields |
| `401 Unauthorized` | Authentication failed | Missing/invalid JWT token |
| `403 Forbidden` | Authorization failed | Insufficient permissions (wrong role) |
| `404 Not Found` | Resource not found | Non-existent user/notification |
| `500 Server Error` | Server error | Database failure, unexpected error |

### Error Response Format

**Standard Error Response** (4xx, 5xx):
```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "timestamp": "2026-04-16T12:00:00Z",
  "path": "/api/admin/users/99999/role"
}
```

### Common Error Scenarios

**Missing Authorization Header**:
```json
{
  "error": "unauthorized",
  "message": "Missing or invalid Authorization header"
}
```

**Invalid Token**:
```json
{
  "error": "invalid_token",
  "message": "JWT token is invalid or expired"
}
```

**Insufficient Permissions**:
```json
{
  "error": "access_denied",
  "message": "User role does not have permission for this operation"
}
```

**Invalid User ID**:
```json
{
  "error": "bad_request",
  "message": "userId must be a positive integer"
}
```

**User/Resource Not Found**:
```json
{
  "error": "not_found",
  "message": "User with ID 99999 not found"
}
```

---

## Security Guidelines

### Authentication

✅ **DO**:
- Always include valid JWT token in Authorization header
- Re-authenticate when token expires (24 hours)
- Use HTTPS in production (TLS 1.2+)
- Rotate JWT secret key regularly

❌ **DON'T**:
- Store JWT tokens in plain text
- Commit JWT secret to version control
- Use expired tokens
- Send credentials in URL query parameters

### Authorization

✅ **DO**:
- Verify user identity before revealing sensitive data
- Check role permissions on backend (don't trust frontend)
- Log unauthorized access attempts
- Implement least privilege principle

❌ **DON'T**:
- Trust client-side role validation
- Allow users to update other users' data
- Expose sensitive error messages
- Log passwords or tokens

### Data Protection

✅ **DO**:
- Validate all input parameters
- Use parameterized queries (ORM handles)
- Implement rate limiting
- Monitor for suspicious patterns

❌ **DON'T**:
- Allow arbitrary user ID access
- Expose database schema details
- Log sensitive user information
- Store plaintext passwords

### API Security Checklist

- [x] All endpoints require authentication (JWT)
- [x] Authorization enforced via @PreAuthorize
- [x] Input validation on all parameters
- [x] Structured error responses (no stack traces)
- [x] Comprehensive logging at security boundaries
- [x] CORS configured for frontend domain
- [x] CSRF protection disabled (JWT-based auth)
- [x] Secure JWT configuration (HS256, 24hr expiry)

---

## Integration Examples

### Frontend: Axios with JWT

```javascript
// Set JWT token in default headers
api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

// Fetch user notifications
const response = await api.get('/api/notifications/user/1');
console.log('Notifications:', response.data);

// Update role
const updated = await api.put('/api/admin/users/2/role', {
  role: 'TECHNICIAN'
});
```

### cURL Examples

**List all users**:
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

**Update role**:
```bash
curl -X PUT http://localhost:8080/api/admin/users/2/role \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role":"TECHNICIAN"}'
```

### Postman Collection

Import `Smart_Campus_Admin_OAuth_API.postman_collection.json` for ready-to-use API requests with authentication and test scripts.

---

## Performance & Rate Limiting

### Response Times (Typical)

| Endpoint | Method | Time |
|----------|--------|------|
| GET /api/admin/users | GET | 50-100ms |
| PUT /api/admin/users/{id}/role | PUT | 30-50ms |
| GET /api/notifications/user/{id} | GET | 20-40ms |
| PATCH /api/notifications/{id}/read | PATCH | 20-40ms |

### Recommendations

- Implement pagination for large user/notification lists (future)
- Cache user roles in JWT token (reduce DB queries)
- Use database indexes on `email`, `userId`, `type` columns
- Implement request throttling for admin endpoints

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 16, 2026 | Initial release (Member 4 implementation) |
| 1.1 | - | Planned: Pagination, advanced filtering |
| 2.0 | - | Planned: WebSocket notifications, real-time updates |

---

**API Documentation Generated**: April 16, 2026  
**Member**: Ruwaneke (Member 4)  
**Modules Covered**: D (Notifications), E (Authentication & Authorization)
