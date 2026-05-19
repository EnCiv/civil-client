const authRoutesMiddleware = require('../stories/mocks/auth-routes-middleware')

module.exports = router => {
  authRoutesMiddleware(router)
}
