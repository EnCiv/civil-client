'use strict';

function signOut(req, res, next) {
  res.clearCookie('synuser')
  res.statusCode = 301
  res.redirect('/')
}

export default function route() {
  this.app.all('/sign/out', signOut)
}
