'use strict'

import serverEvents from '../server/server-events.js'

export default function eventTest(message) {
  console.info('eventTest got message:', message)
}
if (process.env.NODE_ENV === 'development')
  // only register event handlers if their environment variables are set
  serverEvents.on(serverEvents.eNames.EventTest, eventTest)
