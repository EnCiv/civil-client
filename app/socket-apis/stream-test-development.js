// server side
const { pipeline } = require('stream')

export default function streamTest(stream) {
  console.info('stream test on server', stream)
  let self = this // is an ss(socket)
  pipeline(stream, process.stdout, err => {
    process.stdout.end()
    self._ondisconnect()
    self.sio.disconnect(true)
    err && console.error(err)
  })
}
