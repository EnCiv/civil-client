'use strict'

import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import compression from 'compression'
import API from './api'
import setUserCookie from './routes/set-user-cookie'
import serverReactRender from './routes/server-react-render'

class HttpServer {
  constructor(routeHandlers) {
    this.routeHandlers = routeHandlers
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
      this.app.enable('trust proxy')
      this.processRouteHandlers()
      this.notFound()
      this.error()
    } catch (error) {
      logger.error("server constructor error", error)
    }
  }

  processRouteHandlers() {
    for (const [handle, handler] of Object.entries(this.routeHandlers)) {
      try {
        handler.apply(this)
      } catch (error) {
        logger.error("server.processRouteHandlers caught error:", handle, error)
      }
    }
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
