// app/src/services/wss.js

class WebSocketService {
  constructor() {
    this.wsInstance = null;
    this.connectionListeners = new Set();
    this.reconnectAttempts = 0;
    this.MAX_RECONNECT_ATTEMPTS = 5;
    this.RECONNECT_BASE_DELAY = 1000;
  }

  connect() {
    // If already connected or connecting, return existing instance
    if (
      this.wsInstance &&
      (this.wsInstance.readyState === WebSocket.OPEN ||
        this.wsInstance.readyState === WebSocket.CONNECTING)
    )
      return this.wsInstance;

    // Attempt to create a new WebSocket connection
    try {
      this.wsInstance = new WebSocket(
        import.meta.env.VITE_WS + '/?token=' + localStorage.getItem('token')
      );

      this.wsInstance.onopen = () => {
        if (import.meta.env.DEV)
          console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        this.notifyListeners('connected');
      };

      this.wsInstance.onmessage = (event) => {
        this.notifyListeners('message', event.data);
      };

      this.wsInstance.onclose = (event) => {
        console.log('WebSocket connection closed', event);
        this.reconnect();
      };

      this.wsInstance.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.wsInstance.close();
      };

      return this.wsInstance;
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      return null;
    }
  }

  reconnect() {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.notifyListeners('max_reconnect_attempts');
      return;
    }

    const delay =
      this.RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  addListener(listener) {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  notifyListeners(event, data) {
    this.connectionListeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  send(message) {
    if (this.wsInstance && this.wsInstance.readyState === WebSocket.OPEN)
      this.wsInstance.send(JSON.stringify(message));
    else console.warn('WebSocket not connected. Cannot send message.');
  }

  close() {
    if (this.wsInstance) {
      this.wsInstance.close();
      this.wsInstance = null;
    }
  }
}

export default new WebSocketService();
