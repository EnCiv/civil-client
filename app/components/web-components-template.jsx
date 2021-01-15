'use strict';
// everything between the {} below will be replaced by index-handlers
// and make sure there are no nested {} within it
const Components = {}
/**
 * The main source of the following code is in github.com/EnCiv/civil-server/app/components/web-components/index.js
 * do not edit it in any other repo - it will get clobbered by the next build. 
 * 
 */
import React from 'react'
function WebComponents(props) {
    const objOrStr = props.webComponent
    var WebComponentClass
    var newProps = {}

    if (typeof objOrStr === 'object') {
        Object.assign(newProps, props, objOrStr)
        WebComponentClass = Components[objOrStr.webComponent]
    } else {
        // string
        Object.assign(newProps, props)
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

export default WebComponents

