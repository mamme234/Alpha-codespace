// WebSocket for real-time collaboration
const WS_URL = window.location.origin.replace('http', 'ws').replace('https', 'wss');

class WebSocketManager {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = {};
  }

  connect(roomId, userId) {
    this.roomId = roomId;
    this.userId = userId;
    
    try {
      this.socket = new WebSocket(`${WS_URL}`);
      
      this.socket.onopen = () => {
        console.log('🔌 WebSocket connected');
        this.reconnectAttempts = 0;
        this.joinRoom(roomId, userId);
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };
      
      this.socket.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.reconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.reconnect();
    }
  }

  joinRoom(roomId, userId) {
    this.send({
      type: 'join:room',
      roomId,
      userId
    });
  }

  leaveRoom(roomId) {
    this.send({
      type: 'leave:room',
      roomId
    });
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, message queued');
      this.queueMessage(data);
    }
  }

  queueMessage(data) {
    if (!this.messageQueue) this.messageQueue = [];
    this.messageQueue.push(data);
    setTimeout(() => this.flushQueue(), 1000);
  }

  flushQueue() {
    if (this.messageQueue && this.socket && this.socket.readyState === WebSocket.OPEN) {
      while (this.messageQueue.length > 0) {
        const data = this.messageQueue.shift();
        this.socket.send(JSON.stringify(data));
      }
    }
  }

  handleMessage(data) {
    const { type, ...payload } = data;
    
    switch (type) {
      case 'user:joined':
        this.trigger('userJoined', payload);
        break;
      case 'user:left':
        this.trigger('userLeft', payload);
        break;
      case 'cursor:updated':
        this.trigger('cursorUpdated', payload);
        break;
      case 'editor:updated':
        this.trigger('editorUpdated', payload);
        break;
      case 'file:updated':
        this.trigger('fileUpdated', payload);
        break;
      case 'chat:message':
        this.trigger('chatMessage', payload);
        break;
      case 'typing:indicator':
        this.trigger('typingIndicator', payload);
        break;
      default:
        console.log('Unknown WebSocket message:', type, payload);
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`WebSocket callback error (${event}):`, error);
        }
      });
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`🔌 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => {
        if (this.roomId && this.userId) {
          this.connect(this.roomId, this.userId);
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Collaboration Methods
  sendCursorUpdate(roomId, position) {
    this.send({
      type: 'cursor:move',
      roomId,
      position
    });
  }

  sendEditorChange(roomId, content) {
    this.send({
      type: 'editor:change',
      roomId,
      content
    });
  }

  sendFileChange(roomId, filePath, content) {
    this.send({
      type: 'file:change',
      roomId,
      filePath,
      content
    });
  }

  sendTyping(roomId, isTyping) {
    this.send({
      type: 'typing',
      roomId,
      isTyping
    });
  }

  sendChatMessage(roomId, message) {
    this.send({
      type: 'chat:message',
      roomId,
      message
    });
  }
}

// Singleton instance
let wsInstance = null;

function getWebSocket() {
  if (!wsInstance) {
    wsInstance = new WebSocketManager();
  }
  return wsInstance;
}

export { WebSocketManager, getWebSocket };
