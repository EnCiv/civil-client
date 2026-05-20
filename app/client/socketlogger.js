'use strict'

// Returns an appender function for the custom logger (see civil-server's logger.js).
// Emits the loggingEvent to the server via window.socket.
export function createSocketloggerAppender() {
  return function socketloggerAppender(loggingEvent) {
    window.socket.emit('socketlogger', loggingEvent)
  }
}

// ---------------------------------------------------------------------------
// log4js compatibility shim — used by tests that still wire log4js directly.
// ---------------------------------------------------------------------------
function socketloggerAppender(layout, timezoneOffset) {
  return function (loggingEvent) {
    window.socket.emit('socketlogger', loggingEvent)
  }
}

function configure(config) {
  var layout
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout)
  }
  return socketloggerAppender(layout, config.timezoneOffset)
}

export { socketloggerAppender as appender, configure }
export default { appender: socketloggerAppender, configure, createSocketloggerAppender }
