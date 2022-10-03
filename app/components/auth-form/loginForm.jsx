import React from 'react'
import isEmail from 'is-email'
import cx from 'classnames'

import { FormInput } from './formInput'
import { AuthBtn } from './authBtn'
import { ForgotPassword } from './forgotPassword'

export const LoginForm = ({
  handleChange,
  formValues,
  handleOnBlur,
  handleLogin,
  isDisabled,
  classes,
  formValidationErrors,
  infoMessage,
  validationMessages,
  setInfoMessage,
  setFormValidationErrors,
  setHasAgreed,
  hasAgreed,
  loginErrors,
}) => {
  const { email, password } = formValues
  const { emailBlurMsg, passwordBlurMsg } = validationMessages
  const handleEmailBlur = email && !isEmail(email)

  const sendResetPassword = e => {
    e.preventDefault()
    setInfoMessage('One moment...')
    window.socket.emit('send-password', email, window.location.pathname, response => {
      if (response.error) {
        let { error } = response

        if (error === 'User not found') {
          error = 'Email not found'
        }
        setFormValidationErrors(error)
      } else {
        setInfoMessage('Message sent! Please check your inbox')
      }
    })
  }

  return (
    <>
      <FormInput
        labelName="EMAIL ADDRESS"
        handleChange={handleChange}
        name="email"
        value={email}
        handleBlur={() => handleOnBlur(emailBlurMsg, handleEmailBlur)}
        placeHolder="email@address.com"
      />
      <FormInput labelName="PASSWORD" name="password" value={password} handleChange={handleChange} type="password" />
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <AuthBtn
          classes={cx(classes.formBtn, isDisabled ? classes.disable : classes.activeBtn)}
          handleClick={handleLogin}
          btnName="Login"
        />
      </div>
      <ForgotPassword sendResetPassword={sendResetPassword} />
      {infoMessage && <span>{infoMessage}</span>}
      {loginErrors && <div className={classes.formValidationErrors}>{loginErrors}</div>}
    </>
  )
}
