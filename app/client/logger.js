'use strict'
// Thin custom logger for browser use — mirrors civil-server's app/server/util/logger.js.
// Kept in civil-client so the client bundle doesn't need to import from civil-server.
//
// Usage:
//   import { createLogger } from './logger'
//   window.logger = createLogger([bconsoleAppender, socketloggerAppender])
//   window.logger.info('something happened', { detail: 123 })

const LEVELS = ['trace', 'debug', 'info', 'warn', 'error']

export function createLogger(appenders = []) {
  const logger = {}
  for (const level of LEVELS) {
    logger[level] = function (...args) {
      // Allow an optional Date as the first argument to override startTime.
      let startTime
      let data
      if (args[0] instanceof Date) {
        startTime = args[0]
        data = args.slice(1)
      } else {
        startTime = new Date()
        data = args
      }
      const event = { level, startTime, data }
      for (const appender of appenders) {
        try {
          appender(event)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('logger appender threw:', e)
        }
      }
    }
  }
  return logger
}

export default createLogger
