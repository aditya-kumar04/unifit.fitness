# UNIFIT - Complete Fitness Platform

A production-ready, enterprise-grade fitness platform with real-time capabilities, advanced analytics, and comprehensive user management.

## **Overview**

UNIFIT is a full-stack fitness application that connects students with mentors, providing workout tracking, nutrition planning, progress monitoring, and real-time communication. Built with modern technologies and production-ready optimizations.

## **Features**

### **Core Functionality**
- **User Authentication**: JWT-based login/register with role-based access control
- **Workout Tracking**: Complete workout plans with progress tracking
- **Nutrition Management**: Food database, meal logging, and calorie tracking
- **Progress Monitoring**: Photo uploads, weight tracking, and analytics
- **Real-time Chat**: Mentor-student communication with typing indicators
- **Booking System**: Schedule sessions with mentors
- **Notifications**: Real-time alerts and achievement notifications

### **Advanced Features**
- **Real-time Communication**: WebSocket-based chat and notifications
- **Advanced Analytics**: Comprehensive dashboards for mentors and admins
- **File Uploads**: Progress photos with categorization and storage
- **Performance Monitoring**: System metrics and user analytics
- **Caching System**: Intelligent caching for optimal performance
- **Production Logging**: Structured logging with file rotation
- **Admin Dashboard**: Manage users, analytics, and platform metrics
- **Socket.IO Integration**: Real-time presence tracking and messaging

## **Technology Stack**

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Winston** - Logging
- **Multer** - File uploads
- **NodeCache** - Caching
- **Helmet** - Security headers

### **Frontend**
- **React 18** - UI framework
- **React Router DOM** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Vite** - Build tool
- **Iconify** - Icon library

## **Project Structure**

```
unifit.fitness/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Navbar.jsx           # Navigation with user dropdown
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx   # Route protection
│   │   ├── contexts/                # React Context for state
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── Calories.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── MentorPanel.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Landing.jsx
│   │   ├── services/                # API and Socket services
│   │   │   ├── api.js               # Axios configuration
│   │   │   └── socket.js            # Socket.IO client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.local
│
├── server/                          # Backend Node.js application
│   ├── routes/                      # API endpoints
│   │   ├── auth.js                  # Authentication routes
│   │   ├── users.js                 # User management
│   │   ├── workouts.js              # Workout endpoints
│   │   ├── nutrition.js             # Nutrition endpoints
│   │   ├── progress.js              # Progress tracking
│   │   ├── progress-enhanced.js     # Advanced analytics
│   │   ├── chats.js                 # Messaging
│   │   ├── notifications.js         # Notifications
│   │   ├── booking.js               # Session booking
│   │   ├── mentor.js                # Mentor features
│   │   ├── analytics.js             # Analytics
│   │   ├── admin.js                 # Admin endpoints
│   │   └── api.js (deprecated)
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js
│   │   ├── Workout.js
│   │   └── Chat.js
│   ├── middleware/                  # Express middleware
│   │   └── auth.js                  # JWT authentication
│   ├── utils/                       # Utility functions
│   │   ├── logger.js                # Winston logging
│   │   ├── socket.js                # Socket.IO setup
│   │   └── cache.js                 # Caching layer
│   ├── scripts/                     # Utility scripts
│   │   ├── createAdmin.js           # Create admin user
│   │   ├── createDemo.js            # Create demo student
│   │   ├── createMentor.js          # Create demo mentor
│   │   ├── setupDemo.js             # Complete demo setup
│   │   └── testLoginAPI.js          # API testing
│   ├── database.js                  # MongoDB connection
│   ├── index.js                     # Server entry point
│   ├── package.json
│   ├── .env
│   └── logs/                        # Application logs

└── Documentation
    ├── README.md                    # This file
    ├── .gitignore
    └── DEMO_SETUP_COMPLETE.md
```

## **Getting Started**

### **Prerequisites**
- Node.js (v14+)
- MongoDB Atlas account (free tier available)
- npm or yarn

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/unifit.fitness.git
   cd unifit.fitness
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables:**

   **Server** - Create `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unifit?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5001
   NODE_ENV=development
   ```

   **Client** - Create `client/.env.local`:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

5. **Create demo users (optional but recommended):**
   ```bash
   cd server
   npm run setup-demo
   ```

### **Running the Application**

**Terminal 1 - Start the server:**
```bash
cd server
npm start
# Server will run on http://localhost:5001
```

**Terminal 2 - Start the client:**
```bash
cd client
npm run dev
# Client will run on http://localhost:5173
```

## **Demo Credentials**

### **Student Account**
- **Email**: demo@unifit.com
- **Password**: demo123
- **Role**: Student

### **Mentor Account**
- **Email**: arjun@unifit.com
- **Password**: mentor123
- **Role**: Mentor

### **Admin Account**
- **Email**: admin@unifit.com
- **Password**: admin123
- **Role**: Admin

## **API Documentation**

### **Authentication**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get authenticated user profile
- `POST /api/auth/logout` - Logout user

### **Workouts**
- `GET /api/workouts/daily` - Get daily workouts
- `PUT /api/workouts/:id/exercises/:index/complete` - Mark exercise complete
- `GET /api/workouts/history` - Get workout history

### **Chat**
- `GET /api/chats` - Get all chats
- `GET /api/chats/:chatId` - Get chat messages
- `POST /api/chats/:chatId/messages` - Send message
- `PUT /api/chats/:chatId/read` - Mark chat as read

### **Progress**
- `GET /api/progress` - Get progress data
- `GET /api/progress/weight` - Get weight history
- `POST /api/progress/weight` - Log weight
- `POST /api/progress/photos` - Upload progress photo

### **Nutrition**
- `GET /api/nutrition/food` - Search food database
- `POST /api/nutrition/log` - Log meal
- `GET /api/nutrition/logs` - Get eating history

### **Admin**
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get platform analytics
- `PUT /api/admin/users/:id` - Update user

## **Features Implemented**

✅ **Authentication & Authorization**
- Role-based access control (Student, Mentor, Admin)
- JWT token-based authentication
- Secure password hashing with bcrypt
- Protected routes

✅ **Real-time Features**
- Socket.IO chat system
- Typing indicators
- Online presence
- Real-time notifications

✅ **Data Management**
- MongoDB Atlas integration
- Mongoose schemas
- Database indexing
- Error handling

✅ **UI/UX**
- Responsive design
- Dark mode aesthetic
- Smooth animations
- Mobile-friendly

✅ **Production Ready**
- Error logging and monitoring
- Security headers (Helmet)
- CORS configuration
- Rate limiting
- Input validation

## **Design Language**

The UI uses a high-contrast dark mode aesthetic:
- **Primary Background:** `#060203` (Deep off-black)
- **Primary Accent:** `#E63946` (Vibrant striking red)
- **Secondary Colors:** Varied low-contrast grays (`#161616`, `#1a1a1a`, `#333`, `#555`)
- **Textures:** Subtle SVG noise filter for film grain effect

## **Development**

### **Build for Production**

**Backend:**
```bash
cd server
npm run build  # If applicable
```

**Frontend:**
```bash
cd client
npm run build
# Output in client/dist/
```

### **Running Tests**
```bash
npm test
```

### **Code Quality**
```bash
npm run lint
```

## **Troubleshooting**

### **Port Already in Use**
```bash
# Kill process on port 5001
lsof -i :5001
kill -9 <PID>

# Or use different port
PORT=5002 npm start
```

### **MongoDB Connection Issues**
- Verify connection string in `.env`
- Check IP whitelist on MongoDB Atlas
- Ensure retryWrites=true in connection string

### **Socket.IO Connection Failed**
- Ensure both servers are running
- Check CORS configuration
- Verify VITE_API_URL is correct

## **Contributing**

1. Create a feature branch
2. Commit changes with clear messages
3. Push to GitHub
4. Create a Pull Request

## **License**

MIT License - See LICENSE file for details

## **Support**

For issues, suggestions, or questions:
- Create an issue on GitHub
- Contact the development team
- Check documentation in `/docs`

---

**Last Updated:** April 8, 2026
**Version:** 3.0.0
**Status:** Production Ready ✅
