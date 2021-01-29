'use strict'
import serverReactRender from '../server/routes/server-react-render'

function resetPassword(req, res, next) {
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
}
export default function route() {
  this.app.get(
    ['/page/reset-password/:token', '/page/reset-password/:token/*'],
    resetPassword,
    serverReactRender.bind(this.App)
  )
}
