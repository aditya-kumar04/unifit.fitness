# UNIFIT Admin API Guide

Complete admin backend system for managing users, chats, and platform progress.

## 🚀 Quick Start

1. **Start MongoDB** (local or cloud)
2. **Create environment file**:
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Create admin user**:
   ```bash
   node scripts/createAdmin.js
   ```

4. **Start server**:
   ```bash
   npm run dev
   ```

## 🔐 Authentication

### Login as Admin
```bash
POST /api/auth/login
{
  "email": "admin@unifit.com",
  "password": "admin123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@unifit.com",
    "role": "admin"
  }
}
```

**Add token to headers for all admin requests:**
```
Authorization: Bearer <your-token>
```

## 👥 User Management

### Get All Users
```bash
GET /api/admin/users?page=1&limit=20&role=student&search=john
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `role` - Filter by role (student, mentor, admin)
- `status` - Filter by subscription status
- `search` - Search by username, email, or name
- `isBanned` - Filter banned users (true/false)
- `isOnline` - Filter online users (true/false)

### Get User Statistics
```bash
GET /api/admin/users/stats
```

Response:
```json
{
  "totalStudents": 1250,
  "totalMentors": 45,
  "totalAdmins": 3,
  "bannedUsers": 12,
  "onlineUsers": 89,
  "freeSubscriptions": 1100,
  "mentoredSubscriptions": 150,
  "activeLastWeek": 450
}
```

### Get Specific User
```bash
GET /api/admin/users/:userId
```

Includes user details, recent workouts, and chat history.

### Update User
```bash
PUT /api/admin/users/:userId
{
  "username": "newusername",
  "email": "newemail@example.com",
  "role": "mentor",
  "subscription": {
    "plan": "mentored",
    "status": "active"
  }
}
```

### Ban User
```bash
POST /api/admin/users/:userId/ban
{
  "reason": "Violation of community guidelines",
  "duration": 7  // days (optional)
}
```

### Unban User
```bash
POST /api/admin/users/:userId/unban
```

### Delete User
```bash
DELETE /api/admin/users/:userId
```

⚠️ **This permanently deletes the user and all their data!**

## 💬 Chat Management

### Get All Chats
```bash
GET /api/admin/chats?page=1&limit=20&type=mentorship&status=active
```

**Query Parameters:**
- `type` - Chat type (mentorship, support, group, admin_student)
- `status` - Chat status (active, archived, closed, suspended)
- `priority` - Chat priority (low, medium, high, urgent)
- `isMonitored` - Filter monitored chats

### Get Chat Details
```bash
GET /api/admin/chats/:chatId
```

Includes all messages and participant details.

### Add Admin Note
```bash
POST /api/admin/chats/:chatId/notes
{
  "content": "User seems satisfied with mentor guidance"
}
```

### Flag Chat for Monitoring
```bash
POST /api/admin/chats/:chatId/flag
{
  "type": "warning",
  "reason": "Inappropriate language detected"
}
```

**Flag Types:**
- `warning` - General warning
- `violation` - Policy violation
- `praise` - Positive behavior
- `review` - Needs review

### Toggle Chat Monitoring
```bash
PUT /api/admin/chats/:chatId/monitor
{
  "isMonitored": true,
  "monitoringReason": "User complaint investigation"
}
```

## 🏋️ Workout Management

### Get All Workouts
```bash
GET /api/admin/workouts?page=1&limit=20&type=strength&status=completed
```

**Query Parameters:**
- `type` - Workout type (strength, cardio, flexibility, sports, custom)
- `status` - Workout status (scheduled, in_progress, completed, skipped, cancelled)
- `difficulty` - Difficulty level (easy, moderate, hard, very_hard)
- `user` - Filter by user ID
- `mentor` - Filter by mentor ID

### Get Workout Statistics
```bash
GET /api/admin/workouts/stats
```

Response:
```json
{
  "totalWorkouts": 5420,
  "completedWorkouts": 4890,
  "scheduledWorkouts": 530,
  "skippedWorkouts": 120,
  "workoutsByType": [
    { "_id": "strength", "count": 2340 },
    { "_id": "cardio", "count": 1890 }
  ],
  "workoutsByDifficulty": [
    { "_id": "moderate", "count": 3120 },
    { "_id": "hard", "count": 1450 }
  ]
}
```

## 📊 System Statistics

### Get Comprehensive Stats
```bash
GET /api/admin/stats
```

Response:
```json
{
  "users": {
    "total": 1298,
    "active": 450,
    "newThisMonth": 89
  },
  "chats": {
    "total": 2340,
    "active": 890
  },
  "workouts": {
    "total": 5420,
    "completed": 4890,
    "newThisMonth": 340
  }
}
```

## 🔒 Security Features

### Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to all `/api/` endpoints

### Authentication
- JWT tokens with configurable expiration
- Role-based access control
- Automatic ban checking

### Data Protection
- Password hashing with bcryptjs
- Input validation and sanitization
- Security headers with Helmet.js

## 🛠️ Advanced Features

### User Progress Tracking
- Workout completion statistics
- Streak tracking
- Personal records
- Weight and measurements

### Chat Monitoring
- Real-time message tracking
- Admin notes and flags
- Response time metrics
- Satisfaction ratings

### Subscription Management
- Free and mentored plans
- Mentor-student matching
- Subscription lifecycle tracking

## 📱 API Response Format

**Success Response:**
```json
{
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": { ... }
}
```

## 🚨 Important Notes

1. **Database Required**: MongoDB must be running
2. **Environment Variables**: Set up `.env` file before starting
3. **Admin Password**: Change default admin password immediately
4. **Rate Limits**: Be aware of API rate limiting
5. **Data Deletion**: User deletion is permanent

## 🔄 Next Steps

1. Set up MongoDB database
2. Configure environment variables
3. Create admin user
4. Test API endpoints
5. Build admin dashboard frontend
6. Implement real-time notifications
7. Add audit logging
8. Set up backup procedures
