import { React, useEffect, useState } from 'react'
import useAuth, { authenticateSocketIo } from '../app/components/use-auth'

const Component = useAuth
const Name = 'useAuth'

export default {
  title: Name,
  component: Component,
  argTypes: {},
}

const AuthForm = props => {
  function onChange(userInfo) {
    setAuthenticated(userInfo)
  }
  const [state, methods] = useAuth(onChange, {})
  const [authenticated, setAuthenticated] = useState(false)
  useEffect(() => {
    window.socket = {
      emit: (handle, email, href, cb) => {
        if (handle !== 'send-password') console.error('emit expected send-password, got:', handle)
        if (email === 'success@email.com') setTimeout(() => cb({ error: '' }), 1000)
        else setTimeout(() => cb({ error: 'User not found' }), 1000)
      },
      // when user authenticates socket io needs to close and then connect to authenticate the user
      // so we simulate that here
      onHandlers: {},
      on: (handle, handler) => {
        window.socket.onHandlers[handle] = handler
      },
      close: () => {
        if (window.socket.onHandlers.connect) setTimeout(window.socket.onHandlers.connect, 1000)
        else console.error('No connect handler registered')
      },
      removeListener: () => {},
    }
  }, [])
  return (
    <div>
      <div>An ugly component to test useAuth with.</div>
      <div>success@email.com is the only email that will work here.</div>
      <div>"password" is the password for it.</div>
      <div>
        <label>email</label>
        <input name="email" onChange={e => methods.onChangeEmail(e.target.value)} />
      </div>
      <div>
        <label>password</label>
        <input name="password" type="password" onChange={e => methods.onChangePassword(e.target.value)} />
      </div>
      <div>
        <label>confirm password</label>
        <input name="confirm" type="password" onChange={e => methods.onChangeConfirm(e.target.value)} />
      </div>
      <div>
        <span>
          I agree to the{' '}
          <a style={{ color: 'inherit' }} href="https://enciv.org/terms" target="blank">
            terms of service and cookies
          </a>{' '}
          <input type="checkbox" name="agreed" onClick={e => methods.onChangeAgree(e.target.checked)} />
        </span>
      </div>
      <div>
        <button onClick={e => methods.signup()}>SignUp</button> <button onClick={e => methods.login()}>Login</button>{' '}
        <button onClick={e => methods.skip()}>Skip</button>{' '}
        <button onClick={e => methods.sendResetPassword()}>Send Reset Password</button>
      </div>
      <div>
        error: <span style={{ color: 'red' }}>{state.error}</span>
      </div>
      <div>info: {state.info}</div>
      <div>
        success: <span style={{ color: 'green' }}>{state.success}</span>
      </div>
      <div>onChange-userInfo: {JSON.stringify(authenticated)}</div>
    </div>
  )
}
const Template = args => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div
        style={{
          width: '48em',
          marginLeft: 'auto',
          marginRight: 'auto',
          textAlign: 'left',
          padding: '1rem',
          backgroundColor: 'white',
          height: '100vh',
        }}
      >
        <AuthForm {...args} key="component" />
      </div>
    </div>
  )
}

export const AllInOne = Template.bind({})
AllInOne.args = {}
