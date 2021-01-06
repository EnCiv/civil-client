'use strict'

import fs from 'fs'
import http from 'http'
import { EventEmitter } from 'events'

import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import expressRateLimit from 'express-rate-limit'

import printIt from './util/express-pretty'

import signInRoute from './routes/sign-in'
import signUpRoute from './routes/sign-up'
import tempIdRoute from './routes/temp-id'
import signOutRoute from './routes/sign-out'
import setUserCookie from './routes/set-user-cookie'
import serverReactRender from './routes/server-react-render'

import User from '../models/user'
import Iota from '../models/iota'
import helmet from 'helmet'
import compression from 'compression'

import API from './api'
import Sniffr from 'sniffr'
import Device from 'device'
import { DataComponent } from '../components/data-components'

function isHostOnLan(hostname) {
  // so we can access the server from the LAN while in development - but not in production like http://192.168.1.6:3011
  if (process.env.NODE_ENV !== 'development') return false
  let parts = hostname.split('.')
  if (parts.length !== 4) return false
  if (parts[0] === '192' && parts[1] === '168') return true
  return false
}

class HttpServer {
  constructor() {
    this.setUserCookie = setUserCookie.bind(this) // user cookie needs this context so it doesn't have to lookup users in the DB every time
    try {
      this.app = express()
      this.app.set('port', +(process.env.PORT || 3012))
      this.app.use(compression())
      this.app.use(helmet({ frameguard: false }))
      this.app.use(helmet.hidePoweredBy({ setTo: 'Powered by Ruby on Rails.' }))
      this.app.use(bodyParser.urlencoded({ extended: true }), bodyParser.json(), bodyParser.text())
      this.app.use(cookieParser())
      this.app.use('/assets/',
        express.static('assets', {
          maxAge: process.env.NODE_ENV === 'production' ? process.env.ASSETS_MAX_AGE || 1 * 24 * 60 * 60 * 1000 : 0,
        })
      ) // max-age in ms - 1 days these things only change through development

      this.signers()

      this.router()

      this.notFound()

      this.error()

      //this.start()
    } catch (error) {
      logger.error("server constructor error", error)
    }
  }

  getBrowserConfig() {
    this.app.use((req, res, next) => {
      var sniffr = new Sniffr()
      sniffr.sniff(req.headers['user-agent'])
      var device = Device(req.headers['user-agent'])
      const browserConfig = {
        os: sniffr.os,
        browser: sniffr.browser,
        type: device.type,
        model: device.model,
        referrer: req.headers['referrer'], //  Get referrer for referrer
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress, // Get IP - allow for proxy
      }
      if (req.reactProps) req.reactProps.browserConfig = browserConfig
      else req.reactProps = { browserConfig }
      logger.info(req.method, req.originalUrl, req.headers['user-agent'], {
        browserConfig: JSON.stringify(req.reactProps.browserConfig),
      })
      next()
    })
  }

  signers() {
    function sendUserId(req, res) {
      res.send({
        in: true,
        id: req.user._id,
      })
    }

    const apiLimiter = expressRateLimit({
      windowMs: 60 * 1000,
      max: 2,
      message: 'Too many attempts logging in, please try again after 24 hours.',
    })
    //will need trust proxy for production
    this.app.set('trust proxy', 'loopback')

    signInRoute.apply(this)

    //this.app.post('/sign/in', apiLimiter, signInRoute, this.setUserCookie, sendUserId)

    this.app.all('/sign/up', signUpRoute, this.setUserCookie, sendUserId)

    this.app.all('/tempid', tempIdRoute, this.setUserCookie, sendUserId)

    this.app.all('/sign/out', signOutRoute)
  }

  router() {
    /*if ( process.env.NODE_ENV !== 'production' ) */ this.timeout()
    this.getBrowserConfig()
    // Loader.io on Heroku requires the server to respond to their token request in order to validate
    if (process.env.LOADERIO_TOKEN)
      this.app.get('/' + process.env.LOADERIO_TOKEN + '/', (req, res) => {
        res.type('text/plain')
        res.send(process.env.LOADERIO_TOKEN)
      })
    this.app.get('/robots.txt', (req, res) => {
      res.type('text/plain')
      res.send('User-agent: *\nAllow: /')
    })
    this.httpToHttps()
    this.resetPassword() // before /page/:page
    this.getLandingPage()
    this.getMarkDown()

    this.app.get('/page/:page', serverReactRender)

    this.app.get('/error', (req, res, next) => {
      next(new Error('Test error > next with error'))
    })

    this.app.get('/error/synchronous', (req, res, next) => {
      throw new Error('Test error > synchronous error')
    })

    this.app.get('/error/asynchronous', (req, res, next) => {
      process.nextTick(() => {
        throw new Error('Test error > asynchronous error')
      })
    })
    this.getIota()
  }

  httpToHttps() {
    this.app.enable('trust proxy')
    this.app.use((req, res, next) => {
      let hostName = req.hostname
      if (hostName === 'localhost') return next()
      if (isHostOnLan(hostName)) return next() //so we can access from the LAN
      if (!req.secure || req.protocol !== 'https') {
        console.info('server.httpToHttps redirecting to ', req.secure, 'https://' + req.hostname + req.url)
        res.redirect('https://' + req.hostname + req.url)
      } else next() /* Continue to other routes if we're not redirecting */
    })
  }

  // a minute after a request has been received, check and see if the response has been sent.
  timeout() {
    this.app.use((req, res, next) => {
      setTimeout(() => {
        if (!res.headersSent) {
          logger.error('timeout headersSent:', res.headersSent, 'originalUrl', req.originalUrl, 'ip', req.ip)
          next(new Error('Test error > timeout headers not sent'))
        }
      }, 1000 * 29)
      next()
    })
  }

  getLandingPage() {
    this.app.get('/', (req, res, next) => {
      try {
        res.redirect('https://EnCiv.org')
      } catch (error) {
        this.emit('error', error)
      }
    })
  }

  getIota() {
    this.app.get(
      '/*',
      this.setUserCookie,
      async (req, res, next) => {
        try {
          let path = req.params[0]
          if (path.startsWith('country:us') && path[path.length - 1] === '!') path = path.substring(0, path.length - 1) // 2020Feb17: The Ballotpedia emails had a ! at the end of the link. This is a correction for that.  This should be removed after Nov 2020 elections - if not before
          const iota = await Iota.findOne({ path: '/' + path }).catch(err => {
            console.error('getIota.findOne caught error', err, 'skipping')
            next()
          })
          if (!iota || iota === 'null') return next('route')
          if (req.reactProps) req.reactProps.iota = iota
          else req.reactProps = { iota }
          if (iota.component) {
            const dataComponent = DataComponent.fetch(iota.component)
            await dataComponent.fetch(iota)
            // the fetch'ed operation must operate on the Object passed
            next()
          } else {
            next()
          }
          // be careful - the await inside the if(iota.component) will fall through - so don't put the next() outside the else
        } catch (err) {
          console.error('Server getIota caught error:', err)
          next(err)
        }
      },
      (req, res, next) => {
        if (process.env.NODE_ENV === 'production')
          res.set('Cache-Control', `public, max-age=${process.env.IOTA_MAX_AGE || 60 * 60}`)
        next()
      }, // age in seconds - only an hour because candidates may be added, or rerecord
      serverReactRender
    )
  }

  getMarkDown() {
    this.app.get('/doc/:mddoc', (req, res, next) => {
      fs.createReadStream(req.params.mddoc)
        .on('error', next)
        .on('data', function (data) {
          if (!this.data) {
            this.data = ''
          }
          this.data += data.toString()
        })
        .on('end', function () {
          res.header({ 'Content-Type': 'text/markdown; charset=UTF-8' })
          res.send(this.data)
        })
    })
  }

  resetPassword() {
    this.app.get(
      ['/page/reset-password/:token', '/page/reset-password/:token/*'],
      (req, res, next) => {
        try {
          if (req.params.token) {
            User.findOne({ activation_token: req.params.token }).then(
              user => {
                if (user && user._id) {
                  req.user = user.toJSON()
                  req.cookies.synuser = { id: req.user._id, email: req.user.email } // passing the activation key also
                  req.activation_key = user.activation_key
                  this.setUserCookie(req, res, next)
                } else next()
              },
              error => {
                console.info('resetPassord found error', error)
                next(error)
              }
            )
          }
        } catch (error) {
          next(error)
        }
      },
      serverReactRender
    )
  }

  notFound() {
    this.app.use((req, res, next) => {
      res.statusCode = 404
      req.notFound = true
      next()
    }, serverReactRender)
  }

  error() {
    this.app.use((error, req, res, next) => {
      logger.error('server caught error', error)
      res.statusCode = 500
      res.locals.error = error
      next()
    }, serverReactRender)
  }

  start() {
    return new Promise(async (ok, ko) => {
      try {
        this.server = http.createServer(this.app)
        this.server.timeout = 3 * 60 * 1000
        this.server.listen(process.env.PORT || 3012, async () => {
          logger.info('Server is listening', {
            port: this.app.get('port'),
            env: this.app.get('env'),
          })
          this.socketAPI = new API(this)
          await this.socketAPI.start()
          console.info("SocketAPI started")
          return ok()
        })
      } catch (error) {
        console.error("Server caught error trying to start", error)
      }
    })
  }

  stop() {
    return new Promise((ok, ko) => {
      this.socketAPI.disconnect().then(() => {
        this.server.close(ok)
      }, ko)
    })
  }
}

export default HttpServer
