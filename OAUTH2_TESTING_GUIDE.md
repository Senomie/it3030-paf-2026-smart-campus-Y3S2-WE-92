# OAuth 2.0 Testing Guide

## Overview
This guide covers testing of OAuth 2.0 authentication with JWT token validation and role-based authorization for the Smart Campus API.

## Prerequisites
- Google OAuth 2.0 Credentials (client ID, client secret)
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:5173`
- MySQL database configured with Smart Campus schema

## OAuth 2.0 Flow

### Step 1: Initiate Login
**URL**: `http://localhost:8080/oauth2/authorization/google`  
**Method**: GET (Open in browser or redirect from frontend)

**Result**: 
- Redirected to Google login page
- After authentication, user is back-redirected to `/login/success?token=JWT_TOKEN`

### Step 2: Extract JWT Token
After successful Google login:
```
http://localhost:5173/login/success?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Extract the `token` query parameter for API authentication.

### Step 3: Use JWT Token
Include token in all API requests:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Test Cases

### Test 1: OAuth 2.0 Successful Flow
**Objective**: Verify complete OAuth login and JWT token generation

1. Open browser and navigate to: `http://localhost:8080/oauth2/authorization/google`
2. Sign in with your Google account
3. Verify redirect to: `http://localhost:5173/login/success?token=...`
4. Extract token from URL

**Expected Result**: ✅
- User object created/updated in database
- Profile picture stored from Google account
- Valid JWT token returned with user ID and role
- Frontend receives token and redirects to dashboard

**Error Scenarios**:
- Invalid Google credentials → Google login fails
- Missing email in Google account → Error: "Google account has no email attribute"
- Database connection failed → 500 Server Error

---

### Test 2: JWT Token Validation
**Objective**: Verify JWT token is valid and can authenticate API requests

**Request**:
```http
GET /api/notifications/preferences/1 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <JWT_TOKEN>
```

**Expected Result**: ✅ 200 OK
```json
[
  {
    "type": "BOOKING_APPROVED",
    "enabled": true
  },
  {
    "type": "BOOKING_REJECTED",
    "enabled": true
  },
  {
    "type": "TICKET_STATUS",
    "enabled": false
  },
  {
    "type": "TICKET_COMMENT",
    "enabled": true
  }
]
```

**Error Scenarios**:
- Missing Authorization header → Authentication fails
- Invalid token format → Token not parsed correctly
- Expired token → Rejected by JwtService.isTokenValid()
- Token with invalid signature → Rejected by JWT parser

---

### Test 3: Expired Token Rejection
**Objective**: Verify expired tokens are rejected

**Modify application.properties**:
```properties
application.security.jwt.expiration=1000  # 1 second expiration
```

**Steps**:
1. Log in via OAuth2
2. Extract token
3. Wait 2 seconds
4. Send API request with expired token

**Expected Result**: ❌ 401 Unauthorized
- Token validation fails
- User must re-authenticate

---

### Test 4: Invalid Token Format
**Objective**: Verify malformed tokens are rejected

**Request**:
```http
GET /api/notifications/user/1 HTTP/1.1
Authorization: Bearer invalid.token.format
```

**Expected Result**: ❌ 401 Unauthorized
- Token parsing fails in JwtService.extractUserId()
- SecurityContext is not set

---

### Test 5: Missing Authorization Header
**Objective**: Verify unauthenticated requests are rejected

**Request**:
```http
GET /api/notifications/user/1 HTTP/1.1
Host: localhost:8080
```

**Expected Result**: ❌ 401 Unauthorized
- JwtAuthenticationFilter checks for Authorization header
- No header found, filter skips authentication
- API endpoint returns 401

---

## Testing with Postman

### Environment Variables
Create a Postman Environment with:
```json
{
  "name": "Smart Campus OAuth",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:8080"
    },
    {
      "key": "jwt_token",
      "value": ""
    },
    {
      "key": "user_id",
      "value": "1"
    }
  ]
}
```

### OAuth Token Collection
**Pre-request Script**:
```javascript
// This would be set manually after OAuth flow
// Copy token from http://localhost:5173/login/success?token=...
var token = pm.environment.get("jwt_token");
```

---

## Security Checklist

- [x] OAuth2LoginSuccessHandler has error handling with logging
- [x] JwtService validates token expiration
- [x] JwtService handles invalid token format
- [x] JwtAuthenticationFilter logs authentication attempts
- [x] NotificationController validates userId parameter
- [x] AdminUserController checks admin role with @PreAuthorize
- [x] All endpoints return appropriate HTTP status codes
- [x] Logging at DEBUG, INFO, and ERROR levels

---

## Troubleshooting

### "Google account has no email attribute"
**Cause**: Google OAuth2 scope doesn't include email  
**Fix**: Verify `spring.security.oauth2.client.registration.google.scope=profile,email,picture` in application.properties

### "User not found" in logs
**Cause**: JWT token references non-existent user  
**Fix**: Clear database and re-authenticate

### "Invalid token" constantly
**Cause**: JWT secret key mismatch  
**Fix**: Verify `application.security.jwt.secret-key` matches between sessions

### Profile picture not saving
**Cause**: Google OAuth2 doesn't return picture URL  
**Fix**: Verify `picture` is in OAuth2 scopes and user profile is public on Google

---

## Debugging Tips

### View Logs
```bash
# Terminal: tail logs
tail -f backend.log

# Look for authentication flow
grep "Processing OAuth2\|JWT token generated\|Authentication set" backend.log
```

### Database Queries
```sql
-- Check user profile picture
SELECT id, email, name, profile_picture_url, role FROM users;

-- Check role assignments
SELECT email, role FROM users WHERE role != 'USER';
```

### Postman Console
Use Postman's Console (Ctrl+Alt+C) to view request/response headers and raw data:
- Check Authorization header sent
- Verify JWT token format
- See error response bodies

---

## Performance Considerations

- **JWT Token Generation**: ~50-100ms per token
- **Token Validation**: ~10-20ms per request (cached)
- **Database Lookup**: ~5-10ms per user lookup
- **OAuth2 Redirect**: ~500-1000ms (includes Google roundtrip)

For high-traffic scenarios, consider caching user roles in JWT token claims.
