// src/utils/EventManager.js
class EventManager {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(data);
      });
    }
  }

  removeAllListeners(event) {
    if (this.events[event]) {
      delete this.events[event];
    }
  }
}

// Создаем единственный экземпляр
const eventManager = new EventManager();
export default eventManager;