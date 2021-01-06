#!/usr/bin/env node

'use strict'

import Server from './server'

import log4js from 'log4js'
import MongoModels from 'mongo-models'
import mongologger from './util/mongo-logger'

log4js.configure({
  appenders: {
    browserMongoAppender: { type: mongologger, source: 'browser' },
    err: { type: 'stderr' },
    nodeMongoAppender: { type: mongologger, source: 'node' },
  },
  categories: {
    browser: { appenders: ['err', 'browserMongoAppender'], level: 'debug' },
    node: { appenders: ['err', 'nodeMongoAppender'], level: 'debug' },
    default: { appenders: ['err'], level: 'debug' },
  },
})

if (!global.bslogger) {
  // bslogger stands for browser socket logger - not BS logger.
  global.bslogger = log4js.getLogger('browser')
}

if (!global.logger) {
  global.logger = log4js.getLogger('node')
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

async function start() {
  try {
    // heroku is going to delete the MONGODB_URI var on Nov10 - we need something else to use in the mean time
    const MONGODB_URI = process.env.PRIMARYDB_URI || process.env.MONGODB_URI

    if (!MONGODB_URI) {
      throw new Error('Missing PRIMARYDB_URI or MONGODB_URI')
    }
    await MongoModels.connect({ uri: MONGODB_URI }, {})
    // any models that need to createIndexes will push their init function
    for await (const init of MongoModels.toInit) {
      await init()
    }

    const server = new Server()
    await server.start()

    require('./events/notify-of-new-participant') // no need to assign it to anything

    logger.info("started")
  } catch (error) {
    logger.error('error on start', error)
  }
}

start()
