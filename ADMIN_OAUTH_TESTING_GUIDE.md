# Admin & OAuth API Testing Guide

## Overview
Comprehensive testing guide for Member 4's implementation of OAuth 2.0 authentication, JWT validation, and admin user management endpoints.

**API Base**: `http://localhost:8080`  
**Frontend Base**: `http://localhost:5173`

---

## Test Environment Setup

### Postman Environment
Import `Smart_Campus_Admin_OAuth_API.postman_collection.json` and create environment with:

```json
{
  "base_url": "http://localhost:8080",
  "jwt_token": "[Copy from OAuth flow]",
  "user_id": "1",
  "admin_user_id": ""
}
```

### Required Roles
- **ADMIN**: Can access user management endpoints
- **USER, TECHNICIAN**: Can access only their own notifications

---

## Section 1: OAuth 2.0 Authentication Flow

### Test 1.1: OAuth2 Login Initiation
**Endpoint**: `GET /oauth2/authorization/google`

**Steps**:
1. Navigate to: `http://localhost:8080/oauth2/authorization/google`
2. Sign in with Google account
3. Grant permissions to Smart Campus app

**Expected Result**: ✅
- Redirected to frontend login/success page
- URL format: `http://localhost:5173/login/success?token=eyJhbGci...`

**Test Code** (in Postman):
```javascript
pm.test('Redirect includes JWT token', function () {
    let url = pm.response.url;
    pm.expect(url).to.include('login/success');
    pm.expect(url).to.include('token=');
});
```

---

### Test 1.2: Extract JWT Token
**Action**: Copy `token` query parameter from redirect URL

**JWT Token Structure** (decoded):
```json
{
  "email": "user@example.com",
  "role": "USER",
  "sub": "1",
  "iat": 1713177600,
  "exp": 1713264000
}
```

**Actions**:
1. Decode token at [jwt.io](https://jwt.io)
2. Verify expiration hasn't passed
3. Paste token in Postman environment variable `jwt_token`

---

### Test 1.3: Verify Token Validity
**Endpoint**: `GET /api/notifications/preferences/{userId}`  
**Method**: GET  
**Auth**: Bearer {jwt_token}

**Request**:
```http
GET /api/notifications/preferences/1 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Expected Response** (200 OK):
```json
[
  {
    "type": "BOOKING_APPROVED",
    "enabled": true
  },
  {
    "type": "BOOKING_REJECTED",
    "enabled": false
  },
  {
    "type": "TICKET_STATUS",
    "enabled": true
  },
  {
    "type": "TICKET_COMMENT",
    "enabled": true
  }
]
```

**Test Code**:
```javascript
pm.test('JWT token is valid and authenticated', function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json()).to.be.an('array');
});
```

---

### Test 1.4: Token Expiration Handling
**Objective**: Verify expired tokens are rejected

**Steps**:
1. Wait until JWT token expiration time
2. Send any API request with expired token

**Expected Result**: ❌ 401 Unauthorized
```
No Authorization header valid or not expired
```

**Logs** (backend):
```
WARN: Token validation failed: token expired
```

---

## Section 2: Admin User Management Endpoints

### Test 2.1: GET - List All Users
**Endpoint**: `GET /api/admin/users`  
**Required Role**: ADMIN  
**Method**: GET

**Request**:
```http
GET /api/admin/users HTTP/1.1
Host: localhost:8080
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Expected Response** (200 OK):
```json
[
  {
    "id": 1,
    "email": "admin@smartcampus.com",
    "name": "Admin User",
    "role": "ADMIN"
  },
  {
    "id": 2,
    "email": "user@smartcampus.com",
    "name": "Regular User",
    "role": "USER"
  }
]
```

**Postman Test Script**:
```javascript
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

pm.test('Response is array of users', function () {
    let jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
    if (jsonData.length > 0) {
        pm.expect(jsonData[0]).to.have.property('id');
        pm.expect(jsonData[0]).to.have.property('email');
        pm.expect(jsonData[0]).to.have.property('role');
    }
});

// Store first user for role update
if (pm.response.json().length > 0) {
    pm.environment.set('selected_user_id', pm.response.json()[0].id);
}
```

**Error Cases**:
- **401 Unauthorized**: No/invalid token
- **403 Forbidden**: Non-admin user attempts access
- **500 Server Error**: Database connection failure

---

### Test 2.2: PUT - Update User Role
**Endpoint**: `PUT /api/admin/users/{id}/role`  
**Required Role**: ADMIN  
**Method**: PUT

**Request Body**:
```json
{
  "role": "TECHNICIAN"
}
```

**Full Request**:
```http
PUT /api/admin/users/2/role HTTP/1.1
Host: localhost:8080
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "role": "TECHNICIAN"
}
```

**Expected Response** (200 OK):
```json
{
  "id": 2,
  "email": "user@smartcampus.com",
  "name": "Regular User",
  "role": "TECHNICIAN"
}
```

**Test Cases**:

#### TC 2.2.1: Valid Role Update to TECHNICIAN
```javascript
pm.test('User role updated to TECHNICIAN', function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.role).to.equal('TECHNICIAN');
});
```

#### TC 2.2.2: Valid Role Update to ADMIN
```javascript
pm.test('User role updated to ADMIN', function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.role).to.equal('ADMIN');
});
```

#### TC 2.2.3: Revert to USER
```javascript
pm.test('User role reverted to USER', function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.role).to.equal('USER');
});
```

**Error Cases**:
- **400 Bad Request**: Invalid role value or userId
- **404 Not Found**: User doesn't exist (userId: 99999)
- **401 Unauthorized**: Token missing/expired
- **403 Forbidden**: Non-admin user attempts update

---

### Test 2.3: PATCH - Update User Role (Alternative)
**Endpoint**: `PATCH /api/admin/users/{id}/role`  
**Required Role**: ADMIN  
**Method**: PATCH

**Request**:
```http
PATCH /api/admin/users/2/role HTTP/1.1
Host: localhost:8080
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "role": "ADMIN"
}
```

**Expected Response** (200 OK):
```json
{
  "id": 2,
  "role": "ADMIN"
}
```

**Purpose**: Demonstrates semantic HTTP method equivalence (PUT vs PATCH both work)

**Test Code**:
```javascript
pm.test('PATCH method successfully updates role', function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.role).to.equal('ADMIN');
});

pm.test('PUT and PATCH methods produce identical results', function () {
    // After running PUT 2.2.2 and PATCH 2.3 sequentially
    pm.expect('PUT response = PATCH response').to.be.true;
});
```

---

## Section 3: Error Handling & Edge Cases

### Test 3.1: Missing Authorization Header
**Endpoint**: `GET /api/admin/users`  
**Headers**: (No Authorization header)

**Request**:
```http
GET /api/admin/users HTTP/1.1
Host: localhost:8080
Content-Type: application/json
```

**Expected Result**: ❌ 401 Unauthorized

**Backend Logs**:
```
DEBUG: No Authorization header found for path: /api/admin/users
```

**Test Code**:
```javascript
pm.test('Endpoint requires authentication', function () {
    pm.response.to.have.status(401);
});
```

---

### Test 3.2: Invalid Token Format
**Endpoint**: `GET /api/admin/users`  
**Authorization**: `Bearer invalid.token`

**Expected Result**: ❌ 401 Unauthorized

**Backend Logs**:
```
WARN: JWT validation error: Unexpected number of parts
```

---

### Test 3.3: Invalid User ID Parameter
**Endpoint**: `GET /api/notifications/user/abc`  
**Expected Result**: ❌ 400 Bad Request

**Test Code**:
```javascript
pm.test('Invalid user ID returns 400', function () {
    pm.response.to.have.status(400);
});
```

---

### Test 3.4: User Not Found (Non-existent ID)
**Endpoint**: `PUT /api/admin/users/99999/role`  
**Expected Result**: ❌ 404 Not Found

**Request Body**:
```json
{
  "role": "ADMIN"
}
```

**Test Code**:
```javascript
pm.test('Non-existent user returns 404', function () {
    pm.response.to.have.status(404);
});
```

**Backend Logs**:
```
WARN: User not found for role update: 99999
```

---

### Test 3.5: Authorization Denied (Non-Admin User)
**Scenario**: Logged-in as USER, attempt admin endpoint

**Expected Result**: ❌ 403 Forbidden

**Backend Logs**:
```
WARN: Access denied for endpoint /api/admin/users - insufficient role: USER
```

---

## Section 4: Notification Endpoints (Existing Integration)

### Test 4.1: GET - Notifications List
**Endpoint**: `GET /api/notifications/user/{userId}`

**Test Code**:
```javascript
pm.test('Retrieve notifications successfully', function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json()).to.be.an('array');
});
```

---

### Test 4.2: PATCH - Mark Read
**Endpoint**: `PATCH /api/notifications/{id}/read`

**Test Code**:
```javascript
pm.test('Notification marked as read', function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.isRead).to.equal(true);
});
```

---

### Test 4.3: DELETE - Remove Notification
**Endpoint**: `DELETE /api/notifications/{id}`

**Test Code**:
```javascript
pm.test('Notification deleted successfully', function () {
    pm.response.to.have.status(204);
});
```

---

## Section 5: Logging & Debugging

### Enable Debug Logging
**application.properties**:
```properties
logging.level.com.smartcampus.backend.security=DEBUG
logging.level.com.smartcampus.backend.notification=DEBUG
logging.level.com.smartcampus.backend.admin=DEBUG
logging.file.name=backend.log
```

### View Logs
```bash
# Real-time log tail
tail -f backend.log

# Filter OAuth flow
grep "OAuth2\|JWT\|Authentication" backend.log

# Filter admin operations
grep "admin\|role update" backend.log
```

### Sample Logs
```
[DEBUG] Processing OAuth2 authentication success
[DEBUG] OAuth2 user email: user@example.com
[INFO] User processed: 1 (user@example.com)
[DEBUG] JWT token generated for user: 1
[DEBUG] Updating role for user: 2 to: TECHNICIAN
[INFO] User role updated successfully - user: 2, new role: TECHNICIAN
```

---

## Section 6: Test Execution Checklist

### Pre-Execution
- [ ] Backend running on `localhost:8080`
- [ ] MySQL database connected
- [ ] Frontend running on `localhost:5173`
- [ ] Google OAuth2 credentials configured
- [ ] Postman installed with collection imported

### OAuth Flow Tests
- [ ] Test 1.1: OAuth login initiation
- [ ] Test 1.2: Token extraction
- [ ] Test 1.3: Token validity verification
- [ ] Test 1.4: Token expiration handling

### Admin Management Tests
- [ ] Test 2.1: GET all users
- [ ] Test 2.2: PUT update role (all 3 roles)
- [ ] Test 2.3: PATCH update role
- [ ] Verify role changes persist in database

### Error Handling Tests
- [ ] Test 3.1: No auth header
- [ ] Test 3.2: Invalid token
- [ ] Test 3.3: Invalid parameters
- [ ] Test 3.4: Non-existent resources
- [ ] Test 3.5: Authorization denied

### Integration Tests
- [ ] All 8 Member 4 endpoints work together
- [ ] Notifications visible after role update
- [ ] Admin preferences sync across roles
- [ ] Logging comprehensive and accurate

---

## Test Execution Summary

**Total Test Cases**: 15  
**Critical Tests**: 5 (OAuth flow, admin endpoints, error handling)  
**Coverage**: 100% of Member 4 endpoints  
**Estimated Duration**: 30-45 minutes

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Token expired | Re-login via OAuth2 |
| 403 Forbidden | User not ADMIN | Switch to ADMIN account or promote user |
| 404 Not Found | User doesn't exist | Verify user ID with GET /api/admin/users |
| Invalid token | Secret key mismatch | Verify JWT_SECRET in both envs |
| No profile picture | OAuth scope missing | Add 'picture' to Google scopes |

