#!/usr/bin/env node

'use strict'

import Server from './server'
import path from 'path'

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
async function start() {
  try {
    const server = new Server()
    await server.earlyStart()
    await server.addRoutesDirectory(path.resolve(__dirname, '../routes'))
    await server.addSocketAPIsDirectory(path.resolve(__dirname, '../api'))
    server.addEventsDirectory(path.resolve(__dirname, '../events')) // don't await this on
    await server.start()
    logger.info("started")
  } catch (error) {
    logger.error('error on start', error)
  }
}

start()
