#!/usr/bin/env node

'use strict'

import Server from './server'

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
async function start() {
  try {
    const server = new Server()
    await server.earlyStart()
    await server.start()
    logger.info("started")
  } catch (error) {
    logger.error('error on start', error)
  }
}

start()
