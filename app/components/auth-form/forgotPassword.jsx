import React from 'react'

export const ForgotPassword = ({ sendForgotPassword }) => {
  return (
    <div>
      <p style={{ marginTop: '2rem' }}>
        {"Forgot / Didn't set your password? "}
        <a href="#" onClick={sendForgotPassword}>
          Click here
        </a>
      </p>
    </div>
  )
}
