// server side

var host = process.argv[2] || 'http://localhost:3011'
console.info('target is', host)

// client side
const client = require('socket.io-client')
const socket = client.connect(host)

socket.on('connect', () => {
  socket.emit('event-test-development', 'This is a test event')
  console.info('message sent')
  socket.disconnect()
})
