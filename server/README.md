# UNIFIT Backend Server

Complete RESTful API backend for the UNIFIT fitness platform with admin dashboard functionality.

## 🚀 Features

- **User Management**: Complete user CRUD operations with role-based access control
- **Authentication**: JWT-based authentication with secure password hashing
- **Admin Dashboard**: Full admin control over users, chats, and platform data
- **Chat System**: Real-time messaging with admin monitoring and moderation
- **Workout Tracking**: Comprehensive workout logging and progress tracking
- **Database Integration**: MongoDB with Mongoose ODM and optimized indexes
- **Security**: Rate limiting, CORS, input validation, and security headers
- **Monitoring**: User activity tracking, ban system, and admin notes

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unifit-main/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up MongoDB**
   - Local: Install MongoDB and start the service
   - Cloud: Use MongoDB Atlas or similar service

5. **Create admin user**
   ```bash
   node scripts/createAdmin.js
   ```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unifit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🚀 Quick Start

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5001` (or your configured PORT).

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| POST | `/api/auth/create-admin` | Create admin user | No |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | Get all users with filtering | Admin |
| GET | `/api/admin/users/:id` | Get specific user details | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |
| POST | `/api/admin/users/:id/ban` | Ban user | Admin |
| POST | `/api/admin/users/:id/unban` | Unban user | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| GET | `/api/admin/users/stats` | Get user statistics | Admin |
| GET | `/api/admin/chats` | Get all chats | Admin |
| GET | `/api/admin/chats/:id` | Get chat details | Admin |
| POST | `/api/admin/chats/:id/notes` | Add admin note | Admin |
| POST | `/api/admin/chats/:id/flag` | Flag chat | Admin |
| PUT | `/api/admin/chats/:id/monitor` | Toggle monitoring | Admin |
| GET | `/api/admin/workouts` | Get all workouts | Admin |
| GET | `/api/admin/workouts/stats` | Get workout statistics | Admin |
| GET | `/api/admin/stats` | Get system statistics | Admin |

### Chat Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/chats` | Get user's chats | Yes |
| GET | `/api/chats/:id` | Get specific chat | Yes |
| POST | `/api/chats` | Create new chat | Yes |
| POST | `/api/chats/:id/messages` | Send message | Yes |
| PUT | `/api/chats/:id/read` | Mark messages as read | Yes |
| PUT | `/api/chats/:id/messages/:msgId` | Edit message | Yes |
| DELETE | `/api/chats/:id/messages/:msgId` | Delete message | Yes |
| POST | `/api/chats/:id/leave` | Leave chat | Yes |
| POST | `/api/chats/:id/participants` | Add participant | Mentor/Admin |

### Utility Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Server health check | No |

## 🏗️ Project Structure

```
server/
├── models/                 # Database models
│   ├── User.js           # User schema and methods
│   ├── Chat.js           # Chat and message schema
│   └── Workout.js        # Workout schema
├── routes/               # API route handlers
│   ├── auth.js           # Authentication routes
│   ├── admin.js          # Admin management routes
│   └── chats.js          # Chat system routes
├── middleware/           # Custom middleware
│   └── auth.js           # Authentication & authorization
├── scripts/              # Utility scripts
│   └── createAdmin.js    # Create admin user script
├── database.js           # Database connection and setup
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🔐 Security Features

- **Authentication**: JWT tokens with configurable expiration
- **Authorization**: Role-based access control (student/mentor/admin)
- **Password Security**: bcryptjs hashing with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: express-validator for request sanitization
- **Security Headers**: Helmet.js for HTTP security headers
- **CORS Protection**: Configurable cross-origin resource sharing
- **Ban System**: User suspension with expiration dates

## 👥 User Roles

### Student
- View and update own profile
- Participate in mentorship chats
- Log workouts and track progress
- Access exercise library

### Mentor
- All student permissions
- Manage student chats
- Create workout plans
- View student progress

### Admin
- Full system control
- Manage all users
- Monitor and moderate chats
- Access system statistics
- Ban/unban users
- Delete user data

## 📊 Database Models

### User Model
- Authentication credentials
- Profile information
- Subscription details
- Progress tracking
- Activity monitoring
- Ban status

### Chat Model
- Participant management
- Message history
- Admin monitoring
- Metadata tracking
- Flags and notes

### Workout Model
- Exercise tracking
- Performance metrics
- Mentor assignments
- Completion status
- User feedback

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
1. Set production environment variables
2. Install production dependencies
3. Start MongoDB service
4. Run the application:
   ```bash
   npm start
   ```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 API Usage Examples

### Login as Admin
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@unifit.com",
    "password": "admin123"
  }'
```

### Get All Users (Admin)
```bash
curl -X GET http://localhost:5001/api/admin/users \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Create New Chat
```bash
curl -X POST http://localhost:5001/api/chats \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mentorship",
    "title": "Fitness Guidance",
    "participants": [{"user": "mentor-id"}]
  }'
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 5001
   lsof -ti:5001 | xargs kill -9
   ```

2. **Database Connection Failed**
   - Check MongoDB URI in `.env` file
   - Verify network connectivity
   - Confirm database credentials

3. **Authentication Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper role permissions

4. **Environment Variables Not Loading**
   - Ensure `.env` file exists
   - Check file permissions
   - Restart server after changes

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check server logs for error details
4. Create an issue in the repository

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ for the UNIFIT fitness platform**
