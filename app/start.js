#!/usr/bin/env node

'use strict'

import theCivilServer from './server/the-civil-server'
import Iota from './models/Iota'
import iotas from '../iotas.json'
import App from './components/app'

Iota.load(iotas)

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
async function start() {
  try {
    const server = new theCivilServer()
    server.App = App
    await server.earlyStart()
    await server.start()
    logger.info('started')
  } catch (error) {
    logger.error('error on start', error)
  }
}

start()
