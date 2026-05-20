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

// ---------------------------------------------------------------------------
// log4js compatibility shim — used by the tests in
// civil-server/app/socket-apis/__tests__/socketlogger.js which still wire
// log4js directly to verify the end-to-end pipeline.
// ---------------------------------------------------------------------------
function bconsoleAppender(layout, timezoneOffset) {
  layout =
    layout ||
    function (e, t) {
      var d = e.startTime.toString().split(' ')
      return [d[3] + d[1] + d[2] + ' ' + d[4], e.categoryName, ...e.data]
    }
  return function (loggingEvent) {
    console.log(...layout(loggingEvent, timezoneOffset))
  }
}

function configure(config) {
  var layout
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout)
  }
  return bconsoleAppender(layout, config.timezoneOffset)
}

export { bconsoleAppender as appender, configure }
export default { appender: bconsoleAppender, configure, createBconsoleAppender }
