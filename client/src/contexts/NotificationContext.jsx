import { createContext, useContext, useReducer, useEffect } from 'react';
import socketService from '../services/socket';

// Notification context state
const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    email: true,
    push: true,
    workoutReminders: true,
    mentorMessages: true,
    achievementAlerts: true,
    weeklyReports: true,
    systemUpdates: false
  },
  onlineUsers: new Set(),
  typingUsers: new Map(), // chatId -> Set of user IDs
  socketConnected: false,
  loading: false,
  error: null
};

// Action types
const NOTIFICATION_ACTIONS = {
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_SOCKET_CONNECTED: 'SET_SOCKET_CONNECTED',
  SET_ONLINE_USERS: 'SET_ONLINE_USERS',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: state.unreadCount + 1
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      const allReadNotifications = state.notifications.map(n => ({ ...n, read: true }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.DELETE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      const wasUnread = state.notifications.find(n => n.id === action.payload)?.read === false;
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
      };

    case NOTIFICATION_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case NOTIFICATION_ACTIONS.SET_SOCKET_CONNECTED:
      return {
        ...state,
        socketConnected: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: new Set(action.payload)
      };

    case NOTIFICATION_ACTIONS.SET_TYPING_USERS:
      return {
        ...state,
        typingUsers: new Map(action.payload)
      };

    case NOTIFICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case NOTIFICATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const socket = socketService.initialize(token);
      
      // Setup socket event listeners
      socket.on('connection_established', () => {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_SOCKET_CONNECTED, payload: true });
      });

      socket.on('connection_lost', () => {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_SOCKET_CONNECTED, payload: false });
      });

      socket.on('notification', (notification) => {
        dispatch({ type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION, payload: notification });
        
        // Show browser notification if permitted
        if (state.settings.push && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      });

      socket.on('user_status_change', (data) => {
        // Update online users list
        const newOnlineUsers = new Set(state.onlineUsers);
        if (data.isOnline) {
          newOnlineUsers.add(data.userId);
        } else {
          newOnlineUsers.delete(data.userId);
        }
        dispatch({ type: NOTIFICATION_ACTIONS.SET_ONLINE_USERS, payload: newOnlineUsers });
      });

      socket.on('user_typing', (data) => {
        const newTypingUsers = new Map(state.typingUsers);
        const chatTypingUsers = newTypingUsers.get(data.chatId) || new Set();
        
        if (data.isTyping) {
          chatTypingUsers.add(data.userId);
        } else {
          chatTypingUsers.delete(data.userId);
        }
        
        newTypingUsers.set(data.chatId, chatTypingUsers);
        dispatch({ type: NOTIFICATION_ACTIONS.SET_TYPING_USERS, payload: newTypingUsers });
      });

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Action creators
  const actions = {
    loadNotifications: async (page = 1) => {
      try {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
        
        const response = await fetch(`/api/notifications?page=${page}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS,
          payload: {
            notifications: data.notifications,
            unreadCount: data.pagination.unreadCount
          }
        });
      } catch (error) {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: 'Failed to load notifications' });
      } finally {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: false });
      }
    },

    markAsRead: async (notificationId) => {
      try {
        await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_AS_READ, payload: notificationId });
      } catch (error) {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: 'Failed to mark as read' });
      }
    },

    markAllAsRead: async () => {
      try {
        await fetch('/api/notifications/read-all', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
      } catch (error) {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: 'Failed to mark all as read' });
      }
    },

    deleteNotification: async (notificationId) => {
      try {
        await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        dispatch({ type: NOTIFICATION_ACTIONS.DELETE_NOTIFICATION, payload: notificationId });
      } catch (error) {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: 'Failed to delete notification' });
      }
    },

    updateSettings: async (newSettings) => {
      try {
        const response = await fetch('/api/notifications/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(newSettings)
        });
        
        const data = await response.json();
        dispatch({
          type: NOTIFICATION_ACTIONS.UPDATE_SETTINGS,
          payload: data.settings
        });
      } catch (error) {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: 'Failed to update settings' });
      }
    },

    clearError: () => {
      dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });
    },

    // Socket methods
    joinChat: (chatId) => {
      socketService.joinChat(chatId);
    },

    leaveChat: (chatId) => {
      socketService.leaveChat(chatId);
    },

    sendMessage: (chatId, content, type = 'text') => {
      socketService.sendMessage(chatId, content, type);
    },

    startTyping: (chatId) => {
      socketService.startTyping(chatId);
    },

    stopTyping: (chatId) => {
      socketService.stopTyping(chatId);
    },

    isUserTyping: (chatId, userId) => {
      const chatTypingUsers = state.typingUsers.get(chatId);
      return chatTypingUsers ? chatTypingUsers.has(userId) : false;
    },

    isUserOnline: (userId) => {
      return state.onlineUsers.has(userId);
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
