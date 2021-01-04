'use strict'

import React from 'react'
import injectSheet from 'react-jss'

import AuthForm from '../auth-form'

const styles = {
  join: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)',
    'button&': {
      'margin-left': '1em',
      'padding-top': '0.5em',
      'padding-bottom': '0.5em',
      '&:disabled': {
        'text-decoration': 'none',
        background: 'lightgray',
      },
    },
    'a&': {
      'margin-right': '0.25em',
    },
    'i&': {
      'margin-right': 0,
    },
  },
}

class Join extends React.Component {
  state = { info: 'empty' }

  onUserLogin(info) {
    logger.info('onUserLogin', info)
    this.setState({ info })
  }

  render() {
    return (
      <div style={{ width: '100vw', height: '100vh', textAlign: 'center', verticalAlign: 'middle' }}>
        <AuthForm className={this.props.classes['join']} onChange={this.onUserLogin.bind(this)} />
        <div>info: {JSON.stringify(this.state.info)}</div>
      </div>
    )
  }
}

export default injectSheet(styles)(Join)
