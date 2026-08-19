/**
 * @jest-environment node
 */
'use strict'

import { describe, test, expect, beforeEach } from '@jest/globals'
import { createLogger } from '../logger'

describe('createLogger', () => {
  let capturedEvents

  beforeEach(() => {
    capturedEvents = []
    delete process.env.LOGGER_LEVEL
  })

  function captureAppender(event) {
    capturedEvents.push(event)
  }

  test('all levels enabled when LOGGER_LEVEL not set', () => {
    const logger = createLogger([captureAppender])
    
    logger.trace('trace message')
    logger.debug('debug message')
    logger.info('info message')
    logger.warn('warn message')
    logger.error('error message')
    
    expect(capturedEvents).toHaveLength(5)
    expect(capturedEvents[0].level).toBe('trace')
    expect(capturedEvents[1].level).toBe('debug')
    expect(capturedEvents[2].level).toBe('info')
    expect(capturedEvents[3].level).toBe('warn')
    expect(capturedEvents[4].level).toBe('error')
  })

  test('all levels enabled when LOGGER_LEVEL=trace', () => {
    process.env.LOGGER_LEVEL = 'trace'
    const logger = createLogger([captureAppender])
    
    logger.trace('trace message')
    logger.debug('debug message')
    logger.info('info message')
    logger.warn('warn message')
    logger.error('error message')
    
    expect(capturedEvents).toHaveLength(5)
  })

  test('only warn and error when LOGGER_LEVEL=warn', () => {
    process.env.LOGGER_LEVEL = 'warn'
    const logger = createLogger([captureAppender])
    
    logger.trace('trace message')
    logger.debug('debug message')
    logger.info('info message')
    logger.warn('warn message')
    logger.error('error message')
    
    expect(capturedEvents).toHaveLength(2)
    expect(capturedEvents[0].level).toBe('warn')
    expect(capturedEvents[0].data[0]).toBe('warn message')
    expect(capturedEvents[1].level).toBe('error')
    expect(capturedEvents[1].data[0]).toBe('error message')
  })

  test('only error when LOGGER_LEVEL=error', () => {
    process.env.LOGGER_LEVEL = 'error'
    const logger = createLogger([captureAppender])
    
    logger.trace('trace message')
    logger.debug('debug message')
    logger.info('info message')
    logger.warn('warn message')
    logger.error('error message')
    
    expect(capturedEvents).toHaveLength(1)
    expect(capturedEvents[0].level).toBe('error')
  })

  test('debug and higher when LOGGER_LEVEL=debug', () => {
    process.env.LOGGER_LEVEL = 'debug'
    const logger = createLogger([captureAppender])
    
    logger.trace('trace message')
    logger.debug('debug message')
    logger.info('info message')
    logger.warn('warn message')
    logger.error('error message')
    
    expect(capturedEvents).toHaveLength(4)
    expect(capturedEvents[0].level).toBe('debug')
    expect(capturedEvents[1].level).toBe('info')
    expect(capturedEvents[2].level).toBe('warn')
    expect(capturedEvents[3].level).toBe('error')
  })

  test('info and higher when LOGGER_LEVEL=info', () => {
    process.env.LOGGER_LEVEL = 'info'
    const logger = createLogger([captureAppender])
    
    logger.trace('trace message')
    logger.debug('debug message')
    logger.info('info message')
    logger.warn('warn message')
    logger.error('error message')
    
    expect(capturedEvents).toHaveLength(3)
    expect(capturedEvents[0].level).toBe('info')
    expect(capturedEvents[1].level).toBe('warn')
    expect(capturedEvents[2].level).toBe('error')
  })

  test('all levels enabled for invalid LOGGER_LEVEL', () => {
    process.env.LOGGER_LEVEL = 'invalid'
    const logger = createLogger([captureAppender])
    
    logger.trace('trace message')
    logger.debug('debug message')
    logger.info('info message')
    logger.warn('warn message')
    logger.error('error message')
    
    expect(capturedEvents).toHaveLength(5)
  })

  test('handles Date as first argument', () => {
    process.env.LOGGER_LEVEL = 'info'
    const logger = createLogger([captureAppender])
    const testDate = new Date('2026-01-01T00:00:00Z')
    
    logger.info(testDate, 'message with custom date')
    
    expect(capturedEvents).toHaveLength(1)
    expect(capturedEvents[0].startTime).toBe(testDate)
    expect(capturedEvents[0].data[0]).toBe('message with custom date')
  })

  test('case insensitive LOGGER_LEVEL', () => {
    process.env.LOGGER_LEVEL = 'WARN'
    const logger = createLogger([captureAppender])
    
    logger.info('info message')
    logger.warn('warn message')
    
    expect(capturedEvents).toHaveLength(1)
    expect(capturedEvents[0].level).toBe('warn')
  })
})
