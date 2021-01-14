'use strict'
import fetchHandlers from '../server/util/fetch-handlers'
// TypeComponent will accept a function (.default) or a module (exports), so you don't need to add .default to new entries.
// Also, TypeComponent.attributes() will return module.attributes if it is defined.

import React from 'react'
import Components from './web-components'

class WebComponent extends React.Component {
  static Components = {}
  static addDirectories = (dirPaths) => {
    return new Promise(async (ok, ko) => {
      try {
        const handlers = {}
        await fetchHandlers(dirPaths, handlers, "object")
        for (const [handle, handler] of Object.entries(handlers)) {
          Components[reactCase(handle)] = handler
        }
        ok()
      } catch (error) {
        logger.error('WebComponents.addDirectories caught error', error)
        ko(error)
      }
    })
  }
  static attributes(webComponent) {
    let WebComponent
    if (typeof webComponent === 'object') {
      WebComponent = Components[webComponent.webComponent]
      if (typeof WebComponent === 'object') return WebComponent.attributes
      else return {}
    } else {
      WebComponent = Components[webComponent]
      if (typeof WebComponent === 'object') return WebComponent.attributes
      else return {}
    }
  }
  render() {
    const objOrStr = this.props.webComponent
    var WebComponentClass
    var newProps = {}

    if (typeof objOrStr === 'object') {
      Object.assign(newProps, this.props, objOrStr)
      WebComponentClass = Components[objOrStr.webComponent]
    } else {
      // string
      Object.assign(newProps, this.props)
      WebComponentClass = Components[objOrStr]
    }
    if (typeof WebComponentClass === 'undefined') {
      logger.error('WebComponent not defined:', objOrStr)
      return null
    }
    if (WebComponentClass.default)
      // commonJS module or require
      WebComponentClass = WebComponentClass.default

    delete newProps.webComponent

    return <WebComponentClass {...newProps} />
  }
}

export default WebComponent
