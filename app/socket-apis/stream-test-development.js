// server side
const { pipeline } = require('stream')

export default function streamTest(stream) {
  try {
    console.info('stream test on server', stream)
    pipeline(stream, process.stdout, err => err && console.log(err))
  } catch (err) {
    console.info('streamTest caught error', err)
  }
}
