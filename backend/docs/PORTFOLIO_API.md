# CollabBridge Portfolio API Endpoints

## Public Portfolio Endpoints

### Get Public Portfolio
```
GET /api/portfolio/{username}
```
**Description**: Get public portfolio by username  
**Authentication**: None required  
**Response**: User profile with public projects

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "displayName": "John D.",
    "bio": "Creative professional specializing in...",
    "avatar": "https://...",
    "location": "New York, NY",
    "memberSince": "2024-01-01T00:00:00.000Z",
    "projects": [
      {
        "id": "uuid",
        "title": "Project Title",
        "description": "Project description",
        "imageUrl": "https://...",
        "projectUrl": "https://...",
        "tags": ["design", "web"],
        "isFeatured": true,
        "viewCount": 150,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "profile": {
      "categories": ["graphic-design"],
      "skills": ["photoshop", "illustrator"],
      "hourlyRate": 75.00,
      "experience": "5+ years"
    }
  }
}
```

## Dashboard Endpoints (Authenticated)

### Get Dashboard Stats
```
GET /api/portfolio/{username}/dashboard/stats
```
**Description**: Get dashboard statistics for portfolio owner  
**Authentication**: Required (Bearer token)  
**Authorization**: Must own the username

**Example Response**:
```json
{
  "success": true,
  "data": {
    "totalProjects": 12,
    "totalViews": 1250,
    "recentViews": 45,
    "viewsHistory": [
      {
        "viewedAt": "2024-01-01T00:00:00.000Z",
        "viewerIp": "192.168.1.1"
      }
    ]
  }
}
```

### Get Dashboard Projects
```
GET /api/portfolio/{username}/dashboard/projects
```
**Description**: Get all projects (including private ones) for dashboard  
**Authentication**: Required (Bearer token)  
**Authorization**: Must own the username

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Project Title",
      "description": "Project description",
      "imageUrl": "https://...",
      "projectUrl": "https://...",
      "tags": ["design", "web"],
      "isFeatured": true,
      "isPublic": true,
      "viewCount": 150,
      "sortOrder": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Project
```
POST /api/portfolio/{username}/dashboard/projects
```
**Description**: Create a new project  
**Authentication**: Required (Bearer token)  
**Authorization**: Must own the username

**Request Body**:
```json
{
  "title": "New Project",
  "description": "Project description",
  "imageUrl": "https://example.com/image.jpg",
  "projectUrl": "https://example.com/project",
  "tags": ["design", "web"],
  "isPublic": true,
  "isFeatured": false
}
```

### Update Project
```
PUT /api/portfolio/{username}/dashboard/projects/{projectId}
```
**Description**: Update an existing project  
**Authentication**: Required (Bearer token)  
**Authorization**: Must own the username and project

**Request Body**:
```json
{
  "title": "Updated Project Title",
  "description": "Updated description",
  "imageUrl": "https://example.com/new-image.jpg",
  "projectUrl": "https://example.com/updated-project",
  "tags": ["updated", "tags"],
  "isPublic": true,
  "isFeatured": true,
  "sortOrder": 1
}
```

### Delete Project
```
DELETE /api/portfolio/{username}/dashboard/projects/{projectId}
```
**Description**: Delete a project  
**Authentication**: Required (Bearer token)  
**Authorization**: Must own the username and project

**Response**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Update Portfolio Settings
```
PUT /api/portfolio/{username}/dashboard/settings
```
**Description**: Update portfolio settings  
**Authentication**: Required (Bearer token)  
**Authorization**: Must own the username

**Request Body**:
```json
{
  "displayName": "Updated Display Name",
  "bio": "Updated bio description",
  "isPublic": true
}
```

## User Profile Endpoints (Updated)

### Update Username
```
PUT /api/users/username
```
**Description**: Update user's username  
**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "username": "newusername"
}
```

**Validation Rules**:
- Username must be 3-50 characters
- Only alphanumeric characters, underscores, and hyphens allowed
- Must be unique

## URL Structure Summary

- **Public Portfolio**: `https://collabbridge.vercel.app/{username}`
- **Dashboard**: `https://collabbridge.vercel.app/{username}/dashboard`
- **Projects Management**: `https://collabbridge.vercel.app/{username}/dashboard/projects`
- **Settings**: `https://collabbridge.vercel.app/{username}/dashboard/settings`
- **Analytics**: `https://collabbridge.vercel.app/{username}/dashboard/analytics`

## Database Schema Updates

### New Models Added:
1. **projects** - Stores user portfolio projects
2. **portfolio_views** - Tracks portfolio page views for analytics

### Updated Models:
1. **users** - Added `displayName` and `isPublic` fields

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details (development only)"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
