'use strict;'

/* creates an Event Emitter that can be imported across the project to be accessed by all components

serverEvents.eNames is a list of names of events that can be emitted and subscribed to.

Modules the will generate events must use serverEvents.eNameAdd(eName) to add their ename here

Code the listens for events will generate an error if the event name is not present when they register
*/
var serverEvents = new (require('events').EventEmitter)()
serverEvents.eNames = {}
serverEvents.eNameAdd = (eName) => {
  if (serverEvents.eNames[eName])
    logger.warn("SevrverEvents.eName already present:", eName)
  serverEvents.eNames[eName] = eName
}
serverEvents._on = serverEvents.on
serverEvents.on = (eName, ...args) => {
  if (!serverEvents.eNames[eName]) {
    logger.error("serverEvents.on trying to register for an event name that was never added", eName)
  }
  return serverEvents._on(eName, ...args)
}
serverEvents.handlers = {}
serverEvents.dirPaths = []
serverEvents.addDirectory = (dirPath) => serverEvents.dirPaths.push(dirPath) // save directores now, add later so that all possible eNames can be registered from their sources (like the APIs)
serverEvents.start = () => {
  return new Promise(async (ok, ko) => {
    try {
      for await (const dirPath of serverEvents.directories) {
        await fetchHandlers(dirPath, serverEvents.handlers)
      }
      return ok()
    }
    catch (error) {
      logger.error("serverEvents.addDirectory caught error:", error)
      ko(error)
    }
  })
}

module.exports = serverEvents