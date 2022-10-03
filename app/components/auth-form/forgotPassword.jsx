import React from 'react'

export const ForgotPassword = ({ sendResetPassword }) => {
  return (
    <div>
      <p style={{ marginTop: '2rem' }}>
        {"Forgot / Didn't set your password? "}
        <a href="#" onClick={sendResetPassword}>
          Click here
        </a>
      </p>
    </div>
  )
}
