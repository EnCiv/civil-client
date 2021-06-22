// server side
import serverEvents from '../server/server-events'

serverEvents.eNameAdd('EventTest')

export default function eventTest(message) {
  console.info('event test on server', message)
  serverEvents.emit(serverEvents.eNames.EventTest, message)
}
