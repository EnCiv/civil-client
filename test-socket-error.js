const express = require('express')
const socketio = require('socket.io')
const http = require('http')

const PORT = process.env.PORT || 8000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

const checkLength = bar => {
  console.info('bar', bar)
  if (bar.length > 14) {
    console.info('throwing error')
    throw Error('word is too long!')
  }
  // ...
}

io.on('connection', socket => {
  console.log('new socket connection')

  socket.on('foo', bar => {
    try {
      checkLength(bar)
    } catch (e) {
      console.info('caught error', e)
      socket.emit('oops', e.message)
      return
    }
    console.log('app did not crash!')
  })
})

const client = require('socket.io-client')
const socket = client.connect('http://localhost:8000')
socket.on('connect', () => {
  socket.emit('foo', '123456789012345')
  console.info('emitted')
})
