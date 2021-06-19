// server side
const { pipeline } = require('stream')
const ss = require('@sap_oss/node-socketio-stream')

var host = process.argv[2] || 'http://localhost:3011'
console.info('target is', host)

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
