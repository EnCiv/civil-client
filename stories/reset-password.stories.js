import { React } from 'react'
import ResetPassword from '../app/components/auth-form/reset-password'

const Component = ResetPassword
const Name = 'ResetPassword'

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

export const Default = Template.bind({})
Default.args = {}
