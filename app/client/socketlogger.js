'use strict'

// Returns an appender function for the custom logger (see civil-server's logger.js).
// Emits the loggingEvent to the server via window.socket.
export function createSocketloggerAppender() {
  return function socketloggerAppender(loggingEvent) {
    window.socket.emit('socketlogger', loggingEvent)
  }
}

export default { createSocketloggerAppender }
