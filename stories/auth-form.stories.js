import { React, useState } from 'react'
import AuthForm from '../app/components/auth-form'

const Component = AuthForm
const Name = 'AuthForm'

export default {
  title: Name,
  component: Component,
  argTypes: {},
}

global.logger = {
  error: (...args) => console.error(...args),
  info: (...args) => console.info(...args),
}

const Template = args => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ width: '100%', textAlign: 'center' }}>
        success@email.com, password will work. Anything else won't. See .storybook/middleware.js
      </div>
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
        <Component {...args} />
      </div>
    </div>
  )
}

export const Normal = Template.bind({})
Normal.args = {}
