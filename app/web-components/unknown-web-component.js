'use strict'

import React from 'react'

export default function UnknownWebComponent(props) {
  return (
    <div style={{ width: '100vw', height: '100vh', textAlign: 'center', verticalAlign: 'middle' }}>
      <div style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', fontSize: '2em' }}>
        UnknownWebComponent
      </div>
      <div>{JSON.stringify({ props })}</div>
    </div>
  )
}
