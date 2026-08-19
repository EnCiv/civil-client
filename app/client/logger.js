'use strict'
// Thin custom logger for browser and server use.
// Supports configurable log levels via process.env.LOGGER_LEVEL.
//
// Usage:
//   import { createLogger } from 'civil-client/app/client/logger'
//   // or within civil-client:
//   import { createLogger } from './logger'
//
//   window.logger = createLogger([bconsoleAppender, socketloggerAppender])
//   window.logger.info('something happened', { detail: 123 })
//
// Log Level Hierarchy (lowest to highest):
//   trace < debug < info < warn < error
//
// If LOGGER_LEVEL is set to 'warn', only warn and error produce output.
// If LOGGER_LEVEL is 'trace' or not set, all levels are enabled (default).
//
// Note: In browser builds, use Webpack DefinePlugin or Vite's define to inject
// process.env.LOGGER_LEVEL at build time.

const LEVELS = ['trace', 'debug', 'info', 'warn', 'error']

// Get configured log level from environment.
function getConfiguredLevel() {
  if (typeof process !== 'undefined' && process.env && process.env.LOGGER_LEVEL) {
    return process.env.LOGGER_LEVEL.toLowerCase()
  }
  return 'trace' // Default: all levels enabled
}

export function createLogger(appenders = []) {
  const configuredLevel = getConfiguredLevel()
  const minLevelIndex = LEVELS.indexOf(configuredLevel)
  
  // If configured level is invalid, default to trace (all enabled)
  const effectiveMinLevel = minLevelIndex >= 0 ? minLevelIndex : 0

  const logger = {}
  for (let i = 0; i < LEVELS.length; i++) {
    const level = LEVELS[i]
    
    if (i < effectiveMinLevel) {
      // This level is below the threshold — create a noop function
      logger[level] = function () {}
    } else {
      // This level is enabled — create the full logging function
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
  }
  return logger
}

export default createLogger
