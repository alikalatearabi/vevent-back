# 👥 Attendees API Documentation

Complete API documentation for the VEvent attendees and connection request system.

## 📋 Table of Contents

- [Authentication](#-authentication)
- [Attendees Endpoints](#-attendees-endpoints)
- [Connection Requests](#-connection-requests)
- [Helper Endpoints](#-helper-endpoints)
- [Testing Guide](#-testing-guide)
- [Error Responses](#-error-responses)

---

## 🔐 Authentication

### Login
Get JWT token for API authentication.

```bash
curl -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@vevent.com",
    "password": "User@123456"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user-uuid",
    "email": "user@vevent.com",
    "firstName": "User",
    "lastName": "Test"
  }
}
```

### Register New User
Create a new user account.

```bash
curl -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "User123456",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "09123456789",
    "company": "Tech Company",
    "jobTitle": "Developer",
    "toc": true
  }'
```

---

## 👥 Attendees Endpoints

> **Note:** All attendees endpoints require JWT authentication. Include the token in the Authorization header.

### Set JWT Token
```bash
# Replace with your actual token from login response
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 1. Get All Attendees for an Event

**Endpoint:** `GET /api/v1/events/{eventId}/attendees`

```bash
curl -X GET "http://localhost:3001/api/v1/events/EVENT_ID/attendees" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
[
  {
    "id": "attendee-uuid-1",
    "firstName": "Ali",
    "lastName": "Mohammadi",
    "company": "Tehran University",
    "jobTitle": "Research Assistant",
    "phone": "09125678901",
    "avatar": null,
    "role": "VISITOR",
    "checkedInAt": null,
    "privacy": {
      "showPhone": true,
      "showCompany": true,
      "allowConnectionRequests": true
    },
    "user": {
      "email": "ali.mohammadi@university.ac.ir"
    }
  },
  {
    "id": "attendee-uuid-2",
    "firstName": "Sarah",
    "lastName": "Wilson",
    "company": "Digital Marketing Pro",
    "jobTitle": "Marketing Manager",
    "phone": "09122345678",
    "avatar": null,
    "role": "SPEAKER",
    "checkedInAt": "2025-10-12T07:30:00.000Z",
    "privacy": {
      "showPhone": false,
      "showCompany": true,
      "allowConnectionRequests": true
    },
    "user": {
      "email": "sarah.wilson@marketing.com"
    }
  }
]
```

### 2. Get Speakers for an Event

**Endpoint:** `GET /api/v1/events/{eventId}/attendees/speakers`

```bash
curl -X GET "http://localhost:3001/api/v1/events/EVENT_ID/attendees/speakers" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:** Same format as above, but filtered to only include attendees with `"role": "SPEAKER"`

### 3. Get Visitors for an Event

**Endpoint:** `GET /api/v1/events/{eventId}/attendees/visitors`

```bash
curl -X GET "http://localhost:3001/api/v1/events/EVENT_ID/attendees/visitors" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:** Same format as above, but filtered to only include attendees with `"role": "VISITOR"`

### 4. Check-in an Attendee

**Endpoint:** `PATCH /api/v1/attendees/{id}/checkin`

```bash
curl -X PATCH "http://localhost:3001/api/v1/attendees/ATTENDEE_ID/checkin" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "id": "attendee-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "checkedInAt": "2025-10-12T08:15:30.000Z",
  "message": "Attendee checked in successfully"
}
```

---

## 🤝 Connection Requests

### 1. Send a Connection Request

**Endpoint:** `POST /api/v1/connection-requests`

```bash
curl -X POST "http://localhost:3001/api/v1/connection-requests" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "target-user-uuid",
    "eventId": "event-uuid",
    "message": "Hello! I would like to connect with you after your presentation."
  }'
```

**Request Body:**
- `receiverId` (required): UUID of the user you want to connect with
- `eventId` (optional): UUID of the event context
- `message` (optional): Personal message with the request

**Response:**
```json
{
  "id": "connection-request-uuid",
  "senderId": "your-user-uuid",
  "receiverId": "target-user-uuid",
  "eventId": "event-uuid",
  "status": "pending",
  "message": "Hello! I would like to connect with you after your presentation.",
  "createdAt": "2025-10-12T08:20:00.000Z",
  "sender": {
    "firstName": "Your",
    "lastName": "Name",
    "company": "Your Company"
  }
}
```

### 2. Get My Connection Requests

**Endpoint:** `GET /api/v1/connection-requests`

```bash
# Get all connection requests
curl -X GET "http://localhost:3001/api/v1/connection-requests" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get connection requests for specific event
curl -X GET "http://localhost:3001/api/v1/connection-requests?eventId=EVENT_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "sent": [
    {
      "id": "request-uuid-1",
      "receiverId": "target-user-uuid",
      "status": "pending",
      "message": "Hello! I would like to connect.",
      "createdAt": "2025-10-12T08:20:00.000Z",
      "receiver": {
        "firstName": "Target",
        "lastName": "User",
        "company": "Their Company"
      }
    }
  ],
  "received": [
    {
      "id": "request-uuid-2",
      "senderId": "sender-user-uuid",
      "status": "pending",
      "message": "Hi, let's connect!",
      "createdAt": "2025-10-12T09:15:00.000Z",
      "sender": {
        "firstName": "Sender",
        "lastName": "Name",
        "company": "Sender Company"
      }
    }
  ]
}
```

### 3. Accept or Reject Connection Request

**Endpoint:** `PUT /api/v1/connection-requests/{requestId}`

```bash
# Accept a connection request
curl -X PUT "http://localhost:3001/api/v1/connection-requests/REQUEST_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'

# Reject a connection request
curl -X PUT "http://localhost:3001/api/v1/connection-requests/REQUEST_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected"
  }'
```

**Request Body:**
- `status` (required): Either `"accepted"` or `"rejected"`

**Response:**
```json
{
  "id": "request-uuid",
  "status": "accepted",
  "updatedAt": "2025-10-12T10:30:00.000Z",
  "message": "Connection request accepted successfully"
}
```

### 4. Withdraw Connection Request

**Endpoint:** `DELETE /api/v1/connection-requests/{requestId}`

```bash
curl -X DELETE "http://localhost:3001/api/v1/connection-requests/REQUEST_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Connection request withdrawn successfully"
}
```

---

## 🔧 Helper Endpoints

### Get All Events
Find event IDs for testing attendees endpoints.

```bash
curl -X GET "http://localhost:3001/api/v1/events" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Get User Profile
Get your user information including user ID.

```bash
curl -X GET "http://localhost:3001/api/v1/users/me" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Register for an Event
Become an attendee of an event.

```bash
curl -X POST "http://localhost:3001/api/v1/events/EVENT_ID/register" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "VISITOR"
  }'
```

---

## 🧪 Testing Guide

### Step-by-Step Testing

1. **Login and Get Token:**
```bash
curl -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@vevent.com","password":"User@123456"}'
```

2. **Set Token Variable:**
```bash
export JWT_TOKEN="your_actual_jwt_token_here"
```

3. **Get Events List:**
```bash
curl -X GET "http://localhost:3001/api/v1/events" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

4. **Get Attendees for First Event:**
```bash
# Replace EVENT_ID with actual ID from step 3
curl -X GET "http://localhost:3001/api/v1/events/EVENT_ID/attendees" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

5. **Send Connection Request:**
```bash
# Replace RECEIVER_ID with actual user ID from attendees list
curl -X POST "http://localhost:3001/api/v1/connection-requests" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "RECEIVER_ID",
    "eventId": "EVENT_ID",
    "message": "Test connection request"
  }'
```

### Available Test Users

```
📧 admin@vevent.com / 🔑 Admin@123456
📧 user@vevent.com / 🔑 User@123456
📧 exhibitor@vevent.com / 🔑 Exhibitor@123456
```

---

## ❌ Error Responses

### Authentication Errors

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Invalid Credentials:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Validation Errors

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

### Not Found Errors

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Event not found",
  "error": "Not Found"
}
```

### Connection Request Errors

**Duplicate Request:**
```json
{
  "statusCode": 409,
  "message": "Connection request already exists between these users for this event",
  "error": "Conflict"
}
```

**Self-Connection:**
```json
{
  "statusCode": 400,
  "message": "Cannot send connection request to yourself",
  "error": "Bad Request"
}
```

---

## 🚀 Production Usage

### Remote Server Testing

Replace `localhost:3001` with your production server:

```bash
# Production server example
curl -X POST "http://185.149.192.60:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@vevent.com","password":"User@123456"}'
```

### CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`
- `http://0.0.0.0:3000`

### Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

---

## 📱 Frontend Integration Examples

### JavaScript/TypeScript

```javascript
// Login function
async function login(email, password) {
  const response = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('jwt_token', data.accessToken);
    return data;
  } else {
    throw new Error(data.message);
  }
}

// Get attendees function
async function getEventAttendees(eventId) {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch(`http://localhost:3001/api/v1/events/${eventId}/attendees`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}

// Send connection request
async function sendConnectionRequest(receiverId, eventId, message) {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch('http://localhost:3001/api/v1/connection-requests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      receiverId,
      eventId,
      message,
    }),
  });
  
  return await response.json();
}
```

---# 👥 Attendees API Documentation

Complete API documentation for the VEvent attendees and connection request system.

## 📋 Table of Contents

- [Authentication](#-authentication)
- [Attendees Endpoints](#-attendees-endpoints)
- [Connection Requests](#-connection-requests)
- [Helper Endpoints](#-helper-endpoints)
- [Testing Guide](#-testing-guide)
- [Error Responses](#-error-responses)

---

## 🔐 Authentication

### Login
Get JWT token for API authentication.

```bash
curl -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@vevent.com",
    "password": "User@123456"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user-uuid",
    "email": "user@vevent.com",
    "firstName": "User",
    "lastName": "Test"
  }
}
```

### Register New User
Create a new user account.

```bash
curl -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "User123456",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "09123456789",
    "company": "Tech Company",
    "jobTitle": "Developer",
    "toc": true
  }'
```

---

## 👥 Attendees Endpoints

> **Note:** All attendees endpoints require JWT authentication. Include the token in the Authorization header.

### Set JWT Token
```bash
# Replace with your actual token from login response
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 1. Get All Attendees for an Event

**Endpoint:** `GET /api/v1/events/{eventId}/attendees`

```bash
curl -X GET "http://localhost:3001/api/v1/events/EVENT_ID/attendees" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
[
  {
    "id": "attendee-uuid-1",
    "firstName": "Ali",
    "lastName": "Mohammadi",
    "company": "Tehran University",
    "jobTitle": "Research Assistant",
    "phone": "09125678901",
    "avatar": null,
    "role": "VISITOR",
    "checkedInAt": null,
    "privacy": {
      "showPhone": true,
      "showCompany": true,
      "allowConnectionRequests": true
    },
    "user": {
      "email": "ali.mohammadi@university.ac.ir"
    }
  },
  {
    "id": "attendee-uuid-2",
    "firstName": "Sarah",
    "lastName": "Wilson",
    "company": "Digital Marketing Pro",
    "jobTitle": "Marketing Manager",
    "phone": "09122345678",
    "avatar": null,
    "role": "SPEAKER",
    "checkedInAt": "2025-10-12T07:30:00.000Z",
    "privacy": {
      "showPhone": false,
      "showCompany": true,
      "allowConnectionRequests": true
    },
    "user": {
      "email": "sarah.wilson@marketing.com"
    }
  }
]
```

### 2. Get Speakers for an Event

**Endpoint:** `GET /api/v1/events/{eventId}/attendees/speakers`

```bash
curl -X GET "http://localhost:3001/api/v1/events/EVENT_ID/attendees/speakers" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:** Same format as above, but filtered to only include attendees with `"role": "SPEAKER"`

### 3. Get Visitors for an Event

**Endpoint:** `GET /api/v1/events/{eventId}/attendees/visitors`

```bash
curl -X GET "http://localhost:3001/api/v1/events/EVENT_ID/attendees/visitors" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:** Same format as above, but filtered to only include attendees with `"role": "VISITOR"`

### 4. Check-in an Attendee

**Endpoint:** `PATCH /api/v1/attendees/{id}/checkin`

```bash
curl -X PATCH "http://localhost:3001/api/v1/attendees/ATTENDEE_ID/checkin" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "id": "attendee-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "checkedInAt": "2025-10-12T08:15:30.000Z",
  "message": "Attendee checked in successfully"
}
```

---

## 🤝 Connection Requests

### 1. Send a Connection Request

**Endpoint:** `POST /api/v1/connection-requests`

```bash
curl -X POST "http://localhost:3001/api/v1/connection-requests" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "target-user-uuid",
    "eventId": "event-uuid",
    "message": "Hello! I would like to connect with you after your presentation."
  }'
```

**Request Body:**
- `receiverId` (required): UUID of the user you want to connect with
- `eventId` (optional): UUID of the event context
- `message` (optional): Personal message with the request

**Response:**
```json
{
  "id": "connection-request-uuid",
  "senderId": "your-user-uuid",
  "receiverId": "target-user-uuid",
  "eventId": "event-uuid",
  "status": "pending",
  "message": "Hello! I would like to connect with you after your presentation.",
  "createdAt": "2025-10-12T08:20:00.000Z",
  "sender": {
    "firstName": "Your",
    "lastName": "Name",
    "company": "Your Company"
  }
}
```

### 2. Get My Connection Requests

**Endpoint:** `GET /api/v1/connection-requests`

```bash
# Get all connection requests
curl -X GET "http://localhost:3001/api/v1/connection-requests" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get connection requests for specific event
curl -X GET "http://localhost:3001/api/v1/connection-requests?eventId=EVENT_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "sent": [
    {
      "id": "request-uuid-1",
      "receiverId": "target-user-uuid",
      "status": "pending",
      "message": "Hello! I would like to connect.",
      "createdAt": "2025-10-12T08:20:00.000Z",
      "receiver": {
        "firstName": "Target",
        "lastName": "User",
        "company": "Their Company"
      }
    }
  ],
  "received": [
    {
      "id": "request-uuid-2",
      "senderId": "sender-user-uuid",
      "status": "pending",
      "message": "Hi, let's connect!",
      "createdAt": "2025-10-12T09:15:00.000Z",
      "sender": {
        "firstName": "Sender",
        "lastName": "Name",
        "company": "Sender Company"
      }
    }
  ]
}
```

### 3. Accept or Reject Connection Request

**Endpoint:** `PUT /api/v1/connection-requests/{requestId}`

```bash
# Accept a connection request
curl -X PUT "http://localhost:3001/api/v1/connection-requests/REQUEST_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'

# Reject a connection request
curl -X PUT "http://localhost:3001/api/v1/connection-requests/REQUEST_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected"
  }'
```

**Request Body:**
- `status` (required): Either `"accepted"` or `"rejected"`

**Response:**
```json
{
  "id": "request-uuid",
  "status": "accepted",
  "updatedAt": "2025-10-12T10:30:00.000Z",
  "message": "Connection request accepted successfully"
}
```

### 4. Withdraw Connection Request

**Endpoint:** `DELETE /api/v1/connection-requests/{requestId}`

```bash
curl -X DELETE "http://localhost:3001/api/v1/connection-requests/REQUEST_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Connection request withdrawn successfully"
}
```

---

## 🔧 Helper Endpoints

### Get All Events
Find event IDs for testing attendees endpoints.

```bash
curl -X GET "http://localhost:3001/api/v1/events" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Get User Profile
Get your user information including user ID.

```bash
curl -X GET "http://localhost:3001/api/v1/users/me" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Register for an Event
Become an attendee of an event.

```bash
curl -X POST "http://localhost:3001/api/v1/events/EVENT_ID/register" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "VISITOR"
  }'
```

---

## 🧪 Testing Guide

### Step-by-Step Testing

1. **Login and Get Token:**
```bash
curl -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@vevent.com","password":"User@123456"}'
```

2. **Set Token Variable:**
```bash
export JWT_TOKEN="your_actual_jwt_token_here"
```

3. **Get Events List:**
```bash
curl -X GET "http://localhost:3001/api/v1/events" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

4. **Get Attendees for First Event:**
```bash
# Replace EVENT_ID with actual ID from step 3
curl -X GET "http://localhost:3001/api/v1/events/EVENT_ID/attendees" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

5. **Send Connection Request:**
```bash
# Replace RECEIVER_ID with actual user ID from attendees list
curl -X POST "http://localhost:3001/api/v1/connection-requests" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "RECEIVER_ID",
    "eventId": "EVENT_ID",
    "message": "Test connection request"
  }'
```

### Available Test Users

```
📧 admin@vevent.com / 🔑 Admin@123456
📧 user@vevent.com / 🔑 User@123456
📧 exhibitor@vevent.com / 🔑 Exhibitor@123456
```

---

## ❌ Error Responses

### Authentication Errors

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Invalid Credentials:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Validation Errors

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

### Not Found Errors

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Event not found",
  "error": "Not Found"
}
```

### Connection Request Errors

**Duplicate Request:**
```json
{
  "statusCode": 409,
  "message": "Connection request already exists between these users for this event",
  "error": "Conflict"
}
```

**Self-Connection:**
```json
{
  "statusCode": 400,
  "message": "Cannot send connection request to yourself",
  "error": "Bad Request"
}
```

---

## 🚀 Production Usage

### Remote Server Testing

Replace `localhost:3001` with your production server:

```bash
# Production server example
curl -X POST "http://185.149.192.60:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@vevent.com","password":"User@123456"}'
```

### CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`
- `http://0.0.0.0:3000`

### Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

---

## 📱 Frontend Integration Examples

### JavaScript/TypeScript

```javascript
// Login function
async function login(email, password) {
  const response = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('jwt_token', data.accessToken);
    return data;
  } else {
    throw new Error(data.message);
  }
}

// Get attendees function
async function getEventAttendees(eventId) {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch(`http://localhost:3001/api/v1/events/${eventId}/attendees`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}

// Send connection request
async function sendConnectionRequest(receiverId, eventId, message) {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch('http://localhost:3001/api/v1/connection-requests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      receiverId,
      eventId,
      message,
    }),
  });
  
  return await response.json();
}
```

---

## 📞 Support

- **API Server:** `http://localhost:3001`
- **Health Check:** `http://localhost:3001/health`
- **Swagger Documentation:** `http://localhost:3001/api` (if enabled)

For issues or questions, check the server logs or contact the development team.

---

*Last Updated: October 12, 2025*


## 📞 Support

- **API Server:** `http://localhost:3001`
- **Health Check:** `http://localhost:3001/health`
- **Swagger Documentation:** `http://localhost:3001/api` (if enabled)

For issues or questions, check the server logs or contact the development team.

---

*Last Updated: October 12, 2025*

5022 2910 6457 5374 حسین دانش یار