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

## **Technology Stack**

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Winston** - Logging
- **Multer** - File uploads
- **NodeCache** - Caching

### **Frontend**
- **React** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication

## Getting Started

1. **Install Dependencies:**
   Make sure you have Node installed, then run:

   ```bash
   npm install
   ```

2. **Start the Development Server:**

   ```bash
   npm run dev
   ```

3. **Build for Production:**

   ```bash
   npm run build
   ```

## Design Language

The UI relies heavily on a high-contrast dark mode aesthetic:
- **Primary Background:** `#060203` (Deep off-black)
- **Primary Accent:** `#E63946` (Vibrant striking red)
- **Secondary Colors:** Varied low-contrast grays (`#161616`, `#1a1a1a`, `#333`, `#555`)
- **Textures:** A subtle, low-opacity SVG noise filter (`fractalNoise`) applied broadly to eliminate pure flat blacks, simulating film grain.
