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
        else setTimeout(() => cb(args.response), 1000)
      },
    }
  }, [args.response])
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
Default.args = { response: { success: true } }

// the messages below are owned by the server (civil-server app/lib/reset-password-messages.js); copied here to mock its responses
export const InvalidResetKey = Template.bind({})
InvalidResetKey.args = {
  response: {
    success: false,
    code: 'INVALID_RESET_KEY',
    message: 'This reset key is not valid. Please check your email and try again.',
  },
}

export const ExpiredResetKey = Template.bind({})
ExpiredResetKey.args = {
  response: {
    success: false,
    code: 'RESET_KEY_EXPIRED',
    message: 'This reset key has expired. Please request a new password reset email.',
  },
}

export const UnknownError = Template.bind({})
UnknownError.args = {
  response: {
    success: false,
    code: 'GENERIC_RESET_ERROR',
    message: 'An unknown error occurred while resetting your password. Please try again or contact support.',
  },
}
