'use strict'
// Storybook middleware for mocking civil-client auth routes.
// Import this in your repo's .storybook/middleware.js and extend it:
//
//   const authRoutesMiddleware = require('civil-client/stories/mocks/auth-routes-middleware')
//   module.exports = router => {
//     authRoutesMiddleware(router)
//     router.post('/my/route', myHandler)
//   }
//
// Auth flow summary:
//   signup/login: POST /sign/up or /sign/in  { email, password }
//     success: email === 'success@email.com' && password === 'password'  → 200 { userId, firstName, lastName }
//   skip (temp id): POST /tempid  { email?, password }
//     success: any email OR no email → 200 { userId, email }

function authRoutesMiddleware(router) {
  // Use router.use (not router.post) to intercept before any other POST handler,
  // and check res.headersSent throughout to guard against double-response errors.
  router.use(async (req, res, next) => {
    if (req.method !== 'POST') return next()

    const path = req.path || req.url?.split('?')[0]
    const mockPaths = ['/sign/in', '/sign/up', '/tempid']
    if (!mockPaths.includes(path)) return next()

    if (res.headersSent) {
      console.warn('authRoutesMiddleware: headers already sent for', path)
      return
    }

    let body = {}
    try {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const raw = Buffer.concat(chunks).toString('utf8')
      body = raw ? JSON.parse(raw) : {}
    } catch (e) {
      console.error('authRoutesMiddleware: body read error', e.message)
    }

    if (res.headersSent) {
      console.warn('authRoutesMiddleware: headers sent during body read for', path)
      return
    }

    try {
      const { email, password } = body

      const send = (statusCode, data) => {
        res.statusCode = statusCode
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
      }

      if (path === '/sign/in' || path === '/sign/up') {
        if (email === 'success@email.com' && password === 'password') {
          return send(200, { userId: 'abc123', firstName: 'Jane', lastName: 'Doe' })
        }
        return send(404, { error: 'email/password error' })
      }

      if (path === '/tempid') {
        if (email === 'success@email.com' || !email) {
          return send(200, { userId: 'abc123', email })
        }
        return send(404, { error: 'email/password error' })
      }
    } catch (e) {
      console.error('authRoutesMiddleware: handler error for', path, e.message)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: e.message }))
      }
    }
  })
}

module.exports = authRoutesMiddleware
