import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  // Initialize socket connection
  initialize(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(process.env.VITE_API_URL.replace('/api', '') || 'http://localhost:5001', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
    return this.socket;
  }

  // Setup core event listeners
  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
      this.emit('connection_established', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
      this.emit('connection_lost', { connected: false });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket_error', error);
    });

    this.socket.on('connected', (data) => {
      console.log('User authenticated:', data);
      this.emit('user_authenticated', data);
    });
  }

  // Join chat room
  joinChat(chatId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_chat', chatId);
    }
  }

  // Leave chat room
  leaveChat(chatId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_chat', chatId);
    }
  }

  // Send message
  sendMessage(chatId, content, type = 'text') {
    if (this.socket && this.connected) {
      this.socket.emit('send_message', { chatId, content, type });
    }
  }

  // Send typing indicators
  startTyping(chatId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_start', chatId);
    }
  }

  stopTyping(chatId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_stop', chatId);
    }
  }

  // Mentor-specific methods
  monitorClient(clientId) {
    if (this.socket && this.connected) {
      this.socket.emit('monitor_client', clientId);
    }
  }

  stopMonitoringClient(clientId) {
    if (this.socket && this.connected) {
      this.socket.emit('stop_monitoring_client', clientId);
    }
  }

  // Admin methods
  getSystemStats() {
    if (this.socket && this.connected) {
      this.socket.emit('get_system_stats');
    }
  }

  // Event listeners for real-time updates
  onNewMessage(callback) {
    this.addEventListener('new_message', callback);
  }

  onUserTyping(callback) {
    this.addEventListener('user_typing', callback);
  }

  onUserJoinedChat(callback) {
    this.addEventListener('user_joined_chat', callback);
  }

  onUserLeftChat(callback) {
    this.addEventListener('user_left_chat', callback);
  }

  onChatOnlineUsers(callback) {
    this.addEventListener('chat_online_users', callback);
  }

  onUserStatusChange(callback) {
    this.addEventListener('user_status_change', callback);
  }

  onNotification(callback) {
    this.addEventListener('notification', callback);
  }

  onSystemStats(callback) {
    this.addEventListener('system_stats', callback);
  }

  // Generic event listener management
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  removeEventListener(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Custom emit for internal events
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Check connection status
  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
