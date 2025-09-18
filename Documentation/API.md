# API Documentation

Comprehensive REST API documentation for the AI Tools Management Platform.

**Base URL**: `http://localhost:8201/api`
**Authentication**: Bearer Token (JWT via Laravel Sanctum)
**Content-Type**: `application/json`

## 🔓 Public Endpoints

### System Health
```http
GET /api/status
```
**Description**: Check system health and service status
**Authentication**: None required
**Response**:
```json
{
  "status": "healthy",
  "message": "API is running",
  "timestamp": "2025-09-18T10:00:00.000000Z",
  "version": "1.0.0",
  "environment": "local",
  "services": {
    "database": {
      "status": "connected",
      "name": "mysql"
    },
    "cache": {
      "status": "active",
      "driver": "redis"
    },
    "redis": {
      "status": "connected",
      "host": "redis",
      "port": "6379"
    },
    "authentication": {
      "status": "active",
      "driver": "sanctum"
    }
  },
  "endpoints": {
    "public": ["GET /api/status", "POST /api/login"],
    "protected": ["GET /api/user", "GET /api/tools"]
  }
}
```

### Redis Statistics
```http
GET /api/redis/stats
```
**Description**: Get Redis performance statistics
**Authentication**: None required
**Response**:
```json
{
  "status": "connected",
  "version": "7.0.0",
  "uptime_seconds": 86400,
  "uptime_human": "24:00:00",
  "connected_clients": 5,
  "used_memory_human": "2.5MB",
  "used_memory_peak_human": "3.1MB",
  "total_commands_processed": 12500,
  "instantaneous_ops_per_sec": 15,
  "keyspace_hits": 8500,
  "keyspace_misses": 1200,
  "hit_rate": "87.65%",
  "total_keys": 45,
  "keys_list": ["tools:categories", "user:dashboard:1"],
  "timestamp": "2025-09-18T10:00:00.000000Z"
}
```

### Categories (Public)
```http
GET /api/categories
```
**Description**: Get all active categories
**Authentication**: None required
**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "AI Writing Tools",
      "slug": "ai-writing-tools",
      "description": "Tools for content creation and writing assistance",
      "color": "#3B82F6",
      "icon": "✍️",
      "tools_count": 5
    }
  ]
}
```

### Tags (Public)
```http
GET /api/tags
```
**Description**: Get all active tags
**Authentication**: None required
**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Content Creation",
      "slug": "content-creation",
      "tools_count": 8
    }
  ]
}
```

## 🔐 Authentication

### Login
```http
POST /api/login
```
**Description**: Authenticate user and receive access token
**Authentication**: None required
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "message": "Успешен вход в системата",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "frontend",
    "profile_status": "active",
    "requires_2fa_setup": false,
    "has_2fa_enabled": true
  },
  "token": "1|abcdef123456...",
  "requires_2fa_setup": false
}
```
**Error Responses**:
- `422`: Validation error or invalid credentials

### Logout
```http
POST /api/logout
```
**Description**: Invalidate current access token
**Authentication**: Bearer token required
**Response**:
```json
{
  "message": "Успешен изход от системата"
}
```

## 👤 User Profile

### Get Current User
```http
GET /api/user
```
**Description**: Get authenticated user's profile
**Authentication**: Bearer token required
**Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "frontend",
  "profile_status": "active",
  "email_verified_at": "2025-09-18T10:00:00.000000Z",
  "created_at": "2025-09-18T10:00:00.000000Z",
  "updated_at": "2025-09-18T10:00:00.000000Z"
}
```

### Dashboard
```http
GET /api/dashboard
```
**Description**: Get user dashboard data
**Authentication**: Bearer token required
**Response**:
```json
{
  "greeting": "Добре дошъл, John! Днес е отличен ден за работа с AI инструменти.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "frontend",
    "role_display": "Frontend разработчик"
  },
  "current_time": "2025-09-18T10:00:00+03:00",
  "permissions": ["create_tools", "edit_own_tools", "view_tools"]
}
```

## 🛠️ Tools Management

### List Tools
```http
GET /api/tools
```
**Description**: Get paginated list of tools with filtering
**Authentication**: Bearer token required
**Query Parameters**:
- `search` (string): Search in name and description
- `category_id` (integer): Filter by category
- `tags` (array): Filter by tag IDs
- `role` (string): Filter by recommended role
- `status` (string): Filter by status (owner only)
- `per_page` (integer): Items per page (default: 15)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "ChatGPT",
      "link": "https://chat.openai.com",
      "description": "Advanced AI assistant for various tasks",
      "documentation": "Complete documentation...",
      "usage_instructions": "How to use...",
      "examples": "Example usage...",
      "images": ["image1.jpg", "image2.jpg"],
      "is_active": true,
      "status": "approved",
      "approved_at": "2025-09-18T10:00:00.000000Z",
      "category": {
        "id": 1,
        "name": "AI Writing Tools",
        "color": "#3B82F6",
        "icon": "✍️"
      },
      "creator": {
        "id": 2,
        "name": "Jane Smith",
        "role": "frontend"
      },
      "tags": [
        {
          "id": 1,
          "name": "Content Creation",
          "slug": "content-creation"
        }
      ],
      "recommendedUsers": [],
      "approver": {
        "id": 1,
        "name": "Admin User"
      },
      "created_at": "2025-09-18T10:00:00.000000Z",
      "updated_at": "2025-09-18T10:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "last_page": 3,
  "per_page": 15,
  "total": 42
}
```

### Create Tool
```http
POST /api/tools
```
**Description**: Create a new tool
**Authentication**: Bearer token required
**Required Role**: Any authenticated user
**Request Body**:
```json
{
  "name": "New AI Tool",
  "link": "https://example.com",
  "description": "Tool description",
  "documentation": "Optional documentation",
  "usage_instructions": "How to use this tool",
  "examples": "Usage examples",
  "category_id": 1,
  "images": ["image1.jpg", "image2.jpg"],
  "tags": [1, 2, 3],
  "recommended_roles": ["frontend", "backend"]
}
```
**Response**:
```json
{
  "message": "Инструментът е създаден и изпратен за одобрение",
  "tool": {
    "id": 15,
    "name": "New AI Tool",
    "status": "pending",
    // ... full tool object
  }
}
```

### Get Tool Details
```http
GET /api/tools/{id}
```
**Description**: Get detailed information about a specific tool
**Authentication**: Bearer token required
**Response**: Same structure as tool object in list endpoint

### Update Tool
```http
PUT /api/tools/{id}
```
**Description**: Update an existing tool
**Authentication**: Bearer token required
**Permissions**: Creator or Owner role
**Request Body**: Same as create tool (all fields optional)
**Response**:
```json
{
  "message": "Инструментът е обновен успешно",
  "tool": {
    // ... updated tool object
  }
}
```

### Delete Tool
```http
DELETE /api/tools/{id}
```
**Description**: Delete a tool
**Authentication**: Bearer token required
**Permissions**: Creator or Owner role
**Response**:
```json
{
  "message": "Инструментът е изтрит успешно"
}
```

## 🔒 Two-Factor Authentication

### Get 2FA Status
```http
GET /api/2fa/status
```
**Description**: Get user's current 2FA status
**Authentication**: Bearer token required
**Response**:
```json
{
  "is_enabled": true,
  "enabled_methods": [
    {
      "method": "google_authenticator",
      "name": "Google Authenticator",
      "is_setup_complete": true,
      "last_used_at": "2025-09-18T10:00:00.000000Z",
      "backup_codes_count": 8
    }
  ],
  "available_methods": [
    {
      "method": "google_authenticator",
      "name": "Google Authenticator",
      "description": "Използвайте Google Authenticator приложението за генериране на кодове",
      "icon": "smartphone"
    },
    {
      "method": "email",
      "name": "Имейл код",
      "description": "Получавайте кодове за двуфакторна автентикация на имейла си",
      "icon": "mail"
    }
  ]
}
```

### Setup 2FA Method
```http
POST /api/2fa/setup
```
**Description**: Initialize 2FA setup for a specific method
**Authentication**: Bearer token required
**Request Body**:
```json
{
  "method": "google_authenticator"
}
```
**Response**:
```json
{
  "message": "Настройката на двуфакторната автентикация е започната",
  "data": {
    "secret_key": "ABCDEF123456789",
    "qr_code_url": "otpauth://totp/AI%20Tools:user@example.com?secret=ABCDEF123456789&issuer=AI%20Tools",
    "manual_entry_key": "ABCD EF12 3456 789"
  }
}
```

### Verify and Enable 2FA
```http
POST /api/2fa/verify
```
**Description**: Verify setup code and enable 2FA
**Authentication**: Bearer token required
**Request Body**:
```json
{
  "code": "123456",
  "method": "google_authenticator"
}
```
**Response**:
```json
{
  "message": "Двуфакторната автентикация е активирана успешно",
  "verified": true,
  "enabled": true,
  "profile_activated": true
}
```

### Disable 2FA
```http
POST /api/2fa/disable
```
**Description**: Disable 2FA method
**Authentication**: Bearer token required
**Request Body**:
```json
{
  "method": "google_authenticator"
}
```
**Response**:
```json
{
  "message": "Двуфакторната автентикация е деактивирана"
}
```

### Get QR Code
```http
GET /api/2fa/qr-code
```
**Description**: Get QR code for Google Authenticator
**Authentication**: Bearer token required
**Response**:
```json
{
  "qr_code_url": "otpauth://totp/AI%20Tools:user@example.com?secret=ABCDEF123456789&issuer=AI%20Tools",
  "manual_entry_key": "ABCD EF12 3456 789"
}
```

### Generate Backup Codes
```http
POST /api/2fa/backup-codes
```
**Description**: Generate new backup codes
**Authentication**: Bearer token required
**Request Body**:
```json
{
  "method": "google_authenticator"
}
```
**Response**:
```json
{
  "message": "Нови резервни кодове са генерирани",
  "backup_codes": [
    "12345678",
    "87654321",
    "11223344",
    "44332211",
    "55667788",
    "88776655",
    "99001122",
    "22110099"
  ]
}
```

## 📊 Activity Logs

### Get User's Activity
```http
GET /api/activity-logs/my-logs
```
**Description**: Get current user's activity logs
**Authentication**: Bearer token required
**Query Parameters**:
- `action` (string): Filter by action type
- `per_page` (integer): Items per page (default: 20)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "action": "login",
      "action_text": "Вход в системата",
      "entity_type": null,
      "entity_id": null,
      "description": "Потребителят John Doe (frontend) влезе в системата",
      "level": "info",
      "level_color": "text-blue-600",
      "metadata": {
        "user_role": "frontend",
        "login_time": "2025-09-18 10:00:00"
      },
      "created_at": "2025-09-18T10:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 20,
  "total": 95
}
```

### Get Activity Summary
```http
GET /api/activity-logs/summary
```
**Description**: Get activity summary for dashboard
**Authentication**: Bearer token required
**Query Parameters**:
- `days` (integer): Number of days to include (default: 7, max: 365)

**Response**:
```json
{
  "period_days": 7,
  "summary": {
    "total_activities": 245,
    "by_level": {
      "info": 200,
      "warning": 35,
      "critical": 10
    },
    "by_action": {
      "login": 45,
      "logout": 42,
      "created": 25,
      "updated": 18,
      "deleted": 5
    },
    "top_users": [
      {
        "user_id": 1,
        "user_name": "John Doe",
        "activity_count": 85
      }
    ]
  }
}
```

### Get Entity Activity
```http
GET /api/activity-logs/entity/{entityType}/{entityId}
```
**Description**: Get activity logs for a specific entity
**Authentication**: Bearer token required
**Parameters**:
- `entityType`: Type of entity (Tool, User, Category, etc.)
- `entityId`: ID of the entity

**Response**: Same structure as user activity logs

## 👥 Admin Endpoints (Owner Role Required)

### Tool Approval

#### Get Pending Tools
```http
GET /api/tools-pending
```
**Description**: Get tools waiting for approval
**Authentication**: Bearer token required
**Required Role**: Owner
**Query Parameters**: Same as regular tools list

#### Approve Tool
```http
POST /api/tools/{id}/approve
```
**Description**: Approve a pending tool
**Authentication**: Bearer token required
**Required Role**: Owner
**Response**:
```json
{
  "message": "Инструментът е одобрен успешно",
  "tool": {
    // ... approved tool object
  }
}
```

#### Reject Tool
```http
POST /api/tools/{id}/reject
```
**Description**: Reject a pending tool
**Authentication**: Bearer token required
**Required Role**: Owner
**Request Body**:
```json
{
  "rejection_reason": "Липсва документация"
}
```
**Response**:
```json
{
  "message": "Инструментът е отказан успешно",
  "tool": {
    // ... rejected tool object
  }
}
```

#### Approval Statistics
```http
GET /api/tools/approval/stats
```
**Description**: Get tool approval statistics
**Authentication**: Bearer token required
**Required Role**: Owner
**Response**:
```json
{
  "pending_count": 15,
  "approved_count": 142,
  "rejected_count": 8,
  "total_count": 165,
  "pending_today": 3,
  "approved_today": 7
}
```

### User Management

#### List All Users
```http
GET /api/users
```
**Description**: Get paginated list of all users
**Authentication**: Bearer token required
**Required Role**: Owner
**Query Parameters**:
- `search` (string): Search in name and email
- `role` (string): Filter by role
- `per_page` (integer): Items per page

#### Create User
```http
POST /api/users
```
**Description**: Create a new user
**Authentication**: Bearer token required
**Required Role**: Owner
**Request Body**:
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "frontend"
}
```

#### Update User
```http
PUT /api/users/{id}
```
**Description**: Update user information
**Authentication**: Bearer token required
**Required Role**: Owner
**Request Body**:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "backend",
  "is_active": true
}
```

#### Delete User
```http
DELETE /api/users/{id}
```
**Description**: Delete a user
**Authentication**: Bearer token required
**Required Role**: Owner

#### System Statistics
```http
GET /api/admin/stats
```
**Description**: Get comprehensive system statistics
**Authentication**: Bearer token required
**Required Role**: Owner
**Response**:
```json
{
  "total_users": 25,
  "active_users": 23,
  "total_tools": 142,
  "active_tools": 138,
  "tools_this_month": 15,
  "categories_count": 8,
  "tags_count": 24,
  "pending_tools": 5,
  "critical_activities": 2
}
```

### Activity Logs (Admin)

#### Get All Activity Logs
```http
GET /api/activity-logs
```
**Description**: Get all system activity logs with filtering
**Authentication**: Bearer token required
**Required Role**: Owner
**Query Parameters**:
- `action` (string): Filter by action
- `entity_type` (string): Filter by entity type
- `level` (string): Filter by level (info, warning, critical)
- `user_id` (integer): Filter by user
- `start_date` (date): Start date filter
- `end_date` (date): End date filter
- `per_page` (integer): Items per page

#### Get Critical Activities
```http
GET /api/activity-logs/critical
```
**Description**: Get recent critical activities
**Authentication**: Bearer token required
**Required Role**: Owner
**Query Parameters**:
- `limit` (integer): Number of activities (default: 20, max: 100)

#### Export Activity Logs
```http
POST /api/activity-logs/export
```
**Description**: Export activity logs
**Authentication**: Bearer token required
**Required Role**: Owner
**Request Body**:
```json
{
  "start_date": "2025-09-01",
  "end_date": "2025-09-18",
  "format": "json"
}
```
**Response**:
```json
{
  "format": "json",
  "data": [...],
  "count": 1250,
  "period": {
    "start_date": "2025-09-01",
    "end_date": "2025-09-18"
  }
}
```

## 🚨 Error Responses

### Standard Error Format
```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

### Authentication Errors
```json
{
  "message": "Unauthenticated."
}
```

### Permission Errors
```json
{
  "message": "Нямате право да извършите това действие"
}
```

### Validation Errors
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Имейлът е задължителен"],
    "password": ["Паролата трябва да бъде поне 8 символа"]
  }
}
```

## 🔧 Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **API endpoints**: 60 requests per minute per user
- **Admin endpoints**: 30 requests per minute per user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## 📡 WebSocket Events (Future)

The API is prepared for real-time features via WebSocket connections:

- **Tool approved**: Notify creator when tool is approved
- **Activity updates**: Real-time activity feed updates
- **System notifications**: Maintenance and system messages
- **User presence**: Online/offline status for collaborative features

## 🧪 Testing

### Test with cURL
```bash
# Get system status
curl -X GET http://localhost:8201/api/status

# Login
curl -X POST http://localhost:8201/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"peterstoyanov83@gmail.com","password":"password"}'

# Get tools (with auth)
curl -X GET http://localhost:8201/api/tools \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Postman Collection
A complete Postman collection is available with all endpoints pre-configured for testing.

This documentation covers all available API endpoints with comprehensive examples and details for integration and testing.