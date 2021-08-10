'use strict'
import { React, useState, useLayoutEffect, useEffect } from 'react'

const Component = props => {
  useEffect(() => {
    window.reactProps = { ...props } // main-app expects this to be set by a script from the server before main.js runs
    window.NoSocket = true
    require('../app/client/main-app')
  })
  return <div>Reload the browser</div>
}
const Name = 'MainApp'

export default {
  title: Name,
  component: Component,
  argTypes: {},
}

const Template = args => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div
        style={{
          width: '48em',
          marginLeft: 'auto',
          marginRight: 'auto',
          textAlign: 'center',
          padding: '1rem',
          backgroundColor: '#fff',
          height: '100vh',
        }}
      >
        <div id="synapp">
          <Component {...args} />
        </div>
      </div>
    </div>
  )
}

export const NothingHere = Template.bind({})
NothingHere.args = {}
export const TheMainClientIsRunning = Template.bind({})
TheMainClientIsRunning.args = { iota: {} }
