'use strict'

import React, { useEffect, useState } from 'react'
import { createUseStyles } from 'react-jss'
import { FormInput } from './formInput'
import { AuthBtn } from './authBtn'
import cx from 'classnames'

function ResetPassword({ activationToken, returnTo }) {
  const classes = useStyles()
  const [infoMessage, setInfoMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [resetKey, setResetKey] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [token, setToken] = useState(activationToken)
  const PASSWORD_MISMATCH_ERROR = "Passwords don't match"

  useEffect(() => {
    setToken(activationToken)
  }, [activationToken])

  const sendResetPassword = e => {
    e.preventDefault()
    setFormError('')
    if (newPassword !== confirmPassword) {
      setInfoMessage('')
      setFormError(PASSWORD_MISMATCH_ERROR)
      return
    }
    setInfoMessage('One moment...')
    window.socket.emit('reset-password', token, resetKey, newPassword, result => {
      if (result) {
        setInfoMessage('')
        setFormError('Error resetting password, please try again or contact support')
        console.error('Error resetting password: ', result)
        return
      }
      setInfoMessage('')
      setFormError('')
      // todo is the timeout really necessary?
      setTimeout(() => (location.href = returnTo || '/join'), 800)
    })
  }

  const updateResetKeyValue = e => {
    setResetKey(e.target.value)
  }

  const updateNewPasswordValue = e => {
    setNewPassword(e.target.value)
  }

  const updateConfirmPasswordValue = e => {
    setConfirmPassword(e.target.value)
    if (newPassword !== e.target.value) {
      setFormError(PASSWORD_MISMATCH_ERROR)
    } else {
      setFormError('')
    }
  }

  const isResetButtonActive = () => {
    return resetKey !== '' && newPassword !== '' && confirmPassword !== '' && newPassword === confirmPassword
  }

  return (
    <div className={classes.formWrapper}>
      <div className={classes.header}>Reset Password</div>
      <form onSubmit={sendResetPassword}>
        <FormInput
          labelName={'RESET KEY FROM EMAIL'}
          handleChange={updateResetKeyValue}
          name={'resetKey'}
          value={resetKey}
        />
        <FormInput
          labelName={'NEW PASSWORD'}
          handleChange={updateNewPasswordValue}
          name={'newPassword'}
          type={'password'}
          value={newPassword}
        />
        <FormInput
          labelName={'CONFIRM PASSWORD'}
          handleChange={updateConfirmPasswordValue}
          name={'confirmPassword'}
          type={'password'}
          value={confirmPassword}
        />
        <div className={classes.buttonWrapper}>
          <AuthBtn
            classes={cx(classes.formBtn, isResetButtonActive() ? classes.activeBtn : classes.disable)}
            handleClick={sendResetPassword}
            btnName={'Reset'}
          />
        </div>
        {infoMessage && <span>{infoMessage}</span>}
        {formError && <div className={classes.formValidationErrors}>{formError}</div>}
      </form>
    </div>
  )
}

const useStyles = createUseStyles({
  formWrapper: {
    border: '0.5px solid black',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    width: '30rem',
    maxWidth: '30rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    minHeight: '42rem',
    fontSize: 'inherit',
    '& form': {},
    '& label': {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '3rem',
      fontSize: 'inherit',
    },
  },
  header: {
    color: '#18397D',
    fontSize: '2rem',
    fontWeight: '900',
  },
  buttonWrapper: {
    marginTop: '2rem',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  formBtn: {
    width: '9rem',
    height: '3rem',
    fontSize: '1.5rem',
    fontWeight: '600',
  },
  disable: {
    backgroundColor: '#D3D3D3',
  },
  activeBtn: {
    backgroundColor: '#E5A650',
    cursor: 'pointer',
    color: 'white',
  },
  formValidationErrors: {
    color: 'red',
    width: '100%',
  },
})

export default ResetPassword
