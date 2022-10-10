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

  const NO_EMAIL_ENTERED_ERROR = 'Please enter an email before clicking Forgot Password'
  const FORGOT_PASSWORD_SENT_MESSAGE = 'Message sent! Please check your inbox'

  const setInfo = newInfoMessage => {
    setFormValidationErrors([])
    setInfoMessage(newInfoMessage)
  }

  const setError = newErrorMessage => {
    setInfoMessage('')
    setFormValidationErrors([newErrorMessage])
  }

  const sendForgotPassword = e => {
    e.preventDefault()
    if (!email || email === '') {
      setError(NO_EMAIL_ENTERED_ERROR)
      return
    }
    setInfoMessage('One moment...')
    window.socket.emit('send-password', email, window.location.pathname, response => {
      if (response && response.error) {
        let { error } = response

        if (error === 'User not found') {
          error = 'Email not found'
        }
        setError(error)
      } else {
        setInfo(FORGOT_PASSWORD_SENT_MESSAGE)
      }
    })
  }

  const renderErrors = () => {
    return (
      <div>
        {formValidationErrors
          ? formValidationErrors.length
            ? formValidationErrors.map(error => {
                return <div className={classes.formValidationErrors}>{error}</div>
              })
            : ''
          : ''}
        {loginErrors
          ? loginErrors.length
            ? loginErrors.map(error => {
                return <div className={classes.formValidationErrors}>{error}</div>
              })
            : ''
          : ''}
      </div>
    )
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
      <ForgotPassword sendForgotPassword={sendForgotPassword} />
      {infoMessage && <span>{infoMessage}</span>}
      {renderErrors()}
    </>
  )
}
