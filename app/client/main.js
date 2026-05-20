'use strict'

import 'core-js/stable'
import 'regenerator-runtime/runtime'

import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import bconsole from './bconsole'
import socketlogger from './socketlogger'
import { createLogger } from './logger'
import IdleTracker from 'idle-tracker'

export default function clientMain(App, props) {
  if (typeof window !== 'undefined') {
    // only do this stuff if running on the browser.  On the server don't do it
    if (
      !(
        // don't do sockets in these cases
        (
          window.NoSocket ||
          location.hostname.startsWith('cc2020') || // host is the CDN
          location.hostname.startsWith('undebate-stage1') || // host is stage-1 for testing
          (reactProps &&
            reactProps.iota &&
            reactProps.iota.webComponent &&
            reactProps.iota.webComponent.participants &&
            !reactProps.iota.webComponent.participants.human &&
            window.env === 'production')
        ) // production this is a viewer and not a recorder
      )
    ) {
      // do not use socket.io if connecting through the CDN. socket.io will not connect and it will get an error
      window.socket = io()
      window.addEventListener('unload', e => {
        // Cancel the event
        //e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        e.returnValue = ''
        window.socket.disconnect(true) // disconnect the socket so we don't see fewer connection timeouts on the server
      })
      // close the socket after inactivity so the development server can shut down
      const idleTracker = new IdleTracker({
        timeout: 5 * 60 * 1000,
        onIdleCallback: payload => {
          if (payload.idle) {
            console.info('disconnecting socket on idle')
            socket.disconnect(true)
          } else {
            socket.open()
            console.info('opening socket')
          }
        },
      })
      idleTracker.start()
    } else {
      window.NoSocket = true
      window.socket = {
        emit: (...args) => {
          console.error('emit was called with', ...args)
        },
        on: (...args) => {},
        NoSocket: true,
      }
    }
    if (typeof process === 'undefined') global.process = {}
    if (!process.env) process.env = {}
    if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development'

    const bconsoleAppender = bconsole.createBconsoleAppender()
    if (window.socket.NoSocket) {
      window.logger = createLogger([bconsoleAppender])
    } else {
      if (typeof __webpack_public_path__ !== 'undefined') {
        // if using webpack, this will be set on the browser. Don't set it on the server
        __webpack_public_path__ = 'http://localhost:3011/assets/webpack/'
      }
      const socketAppender = socketlogger.createSocketloggerAppender()
      window.logger = createLogger([bconsoleAppender, socketAppender])
    }

    logger.info('client main running on browser', window.location.pathname, reactProps.browserConfig)

    if (!window.language) {
      // a button may change the language later
      window.language = navigator.language.slice(0, 2)
    }
  }
  function render(App, props) {
    try {
      window.reactContainer = document.getElementById('synapp')
      if (!window.Synapp) window.Synapp = {}
      window.Synapp.fontSize = parseFloat(
        window.getComputedStyle(window.reactContainer, null).getPropertyValue('font-size')
      )
      if (!window._reactRoot) window._reactRoot = createRoot(window.reactContainer)
      window._reactRoot.render(React.createElement(App, props)) //createElement instead of <App {...props} /> because it doesn't build when installed as a package in another repo
    } catch (error) {
      document.getElementsByTagName('body')[0].style.backgroundColor = 'red'
      logger.error('render Error', error)
    }
  }
  window.socket.on('welcome', user => {
    render(App, Object.assign({}, reactProps, { user }))
  })

  try {
    if (!(window.reactContainer = document.getElementById('synapp'))) logger.error('synapp id not found')

    if (!window.Synapp) window.Synapp = {}
    window.Synapp.fontSize = parseFloat(
      window.getComputedStyle(window.reactContainer, null).getPropertyValue('font-size')
    )
    window._reactRoot = hydrateRoot(window.reactContainer, React.createElement(App, reactProps)) //createElement instead of <App {...props} /> because it doesn't build when installed as a package in another repo
  } catch (error) {
    document.getElementsByTagName('body')[0].style.backgroundColor = 'red'
    logger.info('hydrate Error', error)
  }
}
