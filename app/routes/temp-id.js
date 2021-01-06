'use strict'

import User from '../models/user'
import sendUserId from '../server/util/send-user-id'

function tempId(req, res, next) {
  try {
    let { password, ..._body } = req.body // don't let the password show up in the logs
    let { email } = req.body

    logger.info({ tempId: _body })

    User.create(req.body).then(
      user => {
        try {
          req.user = user
          delete user.password
          if (!user.email) {
            req.tempid = password // in temp login, the password is a key that will be stored in the browsers cookie.
          }
          return next()
        } catch (error) {
          next(error)
        }
      },
      error => {
        if (/duplicate key/.test(error.message)) {
          res.statusCode = 401
          res.json({ error: `Email ${email} already in use`, message: error.message })
        } else {
          next(error)
        }
      }
    )
  } catch (error) {
    next(error)
  }
}

export default function route() {
  this.app.all('/tempid', tempId, this.setUserCookie, sendUserId)
}
