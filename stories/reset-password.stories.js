// https://github.com/EnCiv/civil-server/issues/65

import React, { useEffect } from 'react'
import ResetPassword from '../app/components/auth-form/reset-password'

const Component = ResetPassword
const Name = 'ResetPassword'

export default {
  title: Name,
  component: Component,
  argTypes: {},
}

const Template = args => {
  useEffect(() => {
    window.socket = {
      emit: (handle, token, resetKey, newPassword, cb) => {
        if (handle !== 'reset-password') console.error('emit expected reset-password, got:', handle)
        else setTimeout(() => cb(args.error), 1000)
      },
    }
  }, [args.error])
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

export const Default = Template.bind({})
Default.args = {}

export const InvalidResetKey = Template.bind({})
InvalidResetKey.args = { error: 'resetPassword - user not found' }

export const ExpiredResetKey = Template.bind({})
ExpiredResetKey.args = { error: 'token expired' }

export const UnknownError = Template.bind({})
UnknownError.args = { error: 'resetPassword - some unexpected error' }
