// Storybook is run on an express server, and this middleware fill lets routes be added
// To test the AuthForm component we need to handle the post request and give a response

const express = require('express')

async function signInHandler(req, res) {
  const { email, password } = req.body
  if (email === 'success@email.com') {
    if (password === 'password') {
      res.send({ userId: 'abc123', firstName: 'Jane', lastName: 'Doe' })
    } else {
      res.statusCode = 404
      res.json({ 'user/password error': email })
      return
    }
  } else {
    res.statusCode = 404
    res.json({ 'user/password error': email })
    return
  }
}

async function signUpHandler(req, res) {
  console.info('body', req.body)
  const { email, password } = req.body
  if (email === 'success@email.com') {
    if (password === 'password') {
      res.send({ userId: 'abc123', firstName: 'Jane', lastName: 'Doe' })
    } else {
      res.statusCode = 404
      res.json({ 'user/password error': email })
      return
    }
  } else {
    res.statusCode = 404
    res.json({ 'user/password error': email })
    return
  }
}
const expressMiddleWare = router => {
  router.use(express.json())
  router.use(express.urlencoded({ extended: true }))
  router.post('/sign/in', signInHandler)
  router.post('/sign/up', signUpHandler)
}
module.exports = expressMiddleWare
