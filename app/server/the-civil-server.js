'use strict'
// named the-civil-server.js because web-pack-dev.js needs to IgnorePlugin it, and server.js is used many other times.  Also - IgnorePlugin - contextRegExp not working in combination with resourceRegExp
import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import compression from 'compression'
import SocketAPI from './socket-api'
import setUserCookie from './routes/set-user-cookie'
import serverReactRender from './routes/server-react-render'
import fetchHandlers from './util/fetch-handlers'
import serverEvents from './server-events'
import log4js from 'log4js'
import MongoModels from 'mongo-models'
import mongologger from './util/mongo-logger'
import path from 'path'
import App from '../components/app'

if (!global.logger) {
  log4js.configure({
    appenders: {
      browserMongoAppender: { type: mongologger, source: 'browser' },
      err: { type: 'stderr' },
      nodeMongoAppender: { type: mongologger, source: 'node' },
    },
    categories: {
      browser: { appenders: ['err', 'browserMongoAppender'], level: 'debug' },
      node: { appenders: ['err', 'nodeMongoAppender'], level: 'debug' },
      default: { appenders: ['err'], level: 'debug' },
    },
  })

  // bslogger stands for browser socket logger - not BS logger.
  global.bslogger = log4js.getLogger('browser')
  global.logger = log4js.getLogger('node')
}

class HttpServer {
  constructor() {
    this.routeHandlers = {}
    this.routesDirPaths = [path.resolve(__dirname, '../routes')]
    this.serverEventsDirPaths = [path.resolve(__dirname, '../events')]
    this.socketAPIsDirPaths = [path.resolve(__dirname, '../socket-apis')]
    this.App = App
    this.setUserCookie = setUserCookie.bind(this) // user cookie needs this context so it doesn't have to lookup users in the DB every time
    this.socketAPI = new SocketAPI()
  }

  addRoutesDirectory(dirPath) {
    return new Promise(async (ok, ko) => {
      try {
        await fetchHandlers(dirPath, this.routeHandlers)
        ok()
      } catch (error) {
        logger.error('sever.addRoutesDirectory caught error:', error)
        ko(error)
      }
    })
  }

  processRouteHandlers() {
    for (const [handle, handler] of Object.entries(this.routeHandlers)) {
      try {
        handler.apply(this)
      } catch (error) {
        logger.error('server.processRouteHandlers caught error:', handle, error)
      }
    }
  }

  earlyStart() {
    return new Promise(async (ok, ko) => {
      // heroku is going to delete the MONGODB_URI var on Nov10 - we need something else to use in the mean time
      const MONGODB_URI = process.env.PRIMARYDB_URI || process.env.MONGODB_URI
      if (!MONGODB_URI) ko(new Error('Missing PRIMARYDB_URI or MONGODB_URI'))
      await MongoModels.connect({ uri: MONGODB_URI }, { useUnifiedTopology: true })
      // any models that need to createIndexes will push their init function
      for await (const init of MongoModels.toInit) {
        await init()
      }
      return ok()
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

  notFound() {
    const serverReactRenderApp = serverReactRender.bind(this.App)
    this.app.use((req, res, next) => {
      res.statusCode = 404
      req.notFound = true
      next()
    }, serverReactRenderApp)
  }

  error() {
    const serverReactRenderApp = serverReactRender.bind(this.App)
    this.app.use((error, req, res, next) => {
      logger.error('server caught error', error)
      res.statusCode = 500
      res.locals.error = error
      next()
    }, serverReactRenderApp)
  }

  start() {
    return new Promise(async (ok, ko) => {
      try {
        await this.addRoutesDirectory(this.routesDirPaths)
        await this.socketAPI.addDirectory(this.socketAPIsDirPaths)
        await serverEvents.addDirectory(this.serverEventsDirPaths)
        this.app = express()
        this.app.set('port', +(process.env.PORT || 3012))
        this.app.use(compression())
        this.app.use(helmet({ frameguard: false }))
        this.app.use(helmet.hidePoweredBy({ setTo: 'Powered by Ruby on Rails.' }))
        this.app.use(bodyParser.urlencoded({ extended: true }), bodyParser.json(), bodyParser.text())
        this.app.use(cookieParser())
        this.app.use(
          '/assets/',
          express.static('assets', {
            maxAge: process.env.NODE_ENV === 'production' ? process.env.ASSETS_MAX_AGE || 1 * 24 * 60 * 60 * 1000 : 0,
          })
        ) // max-age in ms - 1 days these things only change through development
        this.app.enable('trust proxy')
        this.processRouteHandlers()
        this.notFound()
        this.error()
        this.server = http.createServer(this.app)
        this.server.timeout = 3 * 60 * 1000
        this.server.listen(process.env.PORT || 3012, async () => {
          logger.info('Server is listening', {
            port: this.app.get('port'),
            env: this.app.get('env'),
          })
          await this.socketAPI.start(this.server)
          console.info('SocketAPI started')
          await serverEvents.start()
          return ok()
        })
      } catch (error) {
        console.error('Server caught error trying to start', error)
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
