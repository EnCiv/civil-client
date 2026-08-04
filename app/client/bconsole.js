'use strict'

// Returns an appender function for the custom logger (see civil-server's logger.js).
// Formats the event and calls console.log, preserving objects so the browser
// devtools can expand them interactively.
export function createBconsoleAppender() {
  return function bconsoleAppender(loggingEvent) {
    const d = loggingEvent.startTime.toString().split(' ')
    const timestamp = d[3] + d[1] + d[2] + ' ' + d[4]
    console.log(timestamp, ...loggingEvent.data)
  }
}

export default { createBconsoleAppender }
