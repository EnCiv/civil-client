// server side
const { pipeline } = require('stream')
const ss = require('@sap_oss/node-socketio-stream')

var host = process.argv[2] || 'http://localhost:3011'
console.info('target is', host)
console.info(
  'When you ^C to terminate this, it will chash webpack if you are connected to http://localhost:3011.\nIf you connect to http://localhost:3102 the server will catch the error and throw a message, but the console output will still be screwed up.'
)
// client side
const client = require('socket.io-client')
const socket = client.connect(host)

socket.on('connect', () => {
  var stream = ss.createStream()
  var _ss = ss(socket)
  _ss._oldEmit = _ss.emit
  _ss.emit = (...args) => (console.info('emit', args), _ss._oldEmit(...args))
  _ss.emit('stream-test-development', stream)
  console.info('stream started')
  pipeline(process.stdin, stream, err => err && console.log(err))
  console.info('pipeline returned')
  _ss.on('error', err => console.info('_ss caught err', err))
})
