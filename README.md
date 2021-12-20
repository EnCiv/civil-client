# **Civil Client**

This is a node server, as a component that can be included in other projects and extended for use by other projects. It is spun out from the [undebate](https://github.com/EnCiv/undebate) project so that it can be used as a common component of many projects.

Demo at https://civil-server.herokuapp.com

The idea is that Civil Server is a component with some basic funcationality that will be useful to a lot of projects.
Some projects may take this and add more features and create a component out of that will be useful to other projects.

To get started with contributing to this project, follow the instructions to install the [civil-server-template](https://github.com/EnCiv/civil-server-template)

And when changes/improvements are made to this project, they can be easilly updated in other projects.

**Copyright 2021 EnCiv, Inc.** This work is licensed under the terms described in [LICENSE.txt](https://github.com/EnCiv/civil-server/blob/master/LICENSE.txt) which is an MIT license with a [Public Good License Condition](https://github.com/EnCiv/undebate#the-need-for-a-public-good-license-condition).

# Features

- **User Join/Login/Logout/Forgot Password** to get you up and running quickly with user logins
- **MongoDB** for extensible user database
- **React Server Sider Rendering** for quick page loads
- **React Progressive Web Applications** for interactive pages with low server load
- **React-Jss** for inline styles
- **Socket.io** for asyncronous, bidirectional API's
- **Server Events** for extensibility communication between api's that generate events, and multiple handlers for them
- **Helmet** for improved security
- **Webpack and nodemon** for interactive development
- **Log4js** for logging to a collection in MongoDB
- **Log4js from the browser** for debugging
- **Loader.io verification** for load testing

# How to use it

_start.js_

```
"use strict";

const path=require('path')
import {civilServer, Iota} from "civil-server"
import iotas from '../iotas.json'
import App from './components/app'

Iota.load(iotas)
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
async function start() {
  try {
    const server = new civilServer()
    server.App=App
    await server.earlyStart()
    server.routesDirPaths.push(path.resolve(__dirname, './routes'))
    server.socketAPIsDirPaths.push(path.resolve(__dirname, './socket-apis'))
    server.serverEventsDirPaths.push(path.resolve(__dirname, './events'))
    await server.start()
    logger.info("started")
  } catch (error) {
    logger.error('error on start', error)
  }
}

start()
```

# App

App is your outer wrapper React App for the whole web site. A minimal version looks like this:

```
import React from 'react'
import { hot } from 'react-hot-loader'
import WebComponents from '../web-components'
import Footer from './footer'
import ErrorBoundary from './error-boundary'

class App extends React.Component {
  render() {
    if (this.props.iota) {
      var { iota, ...newProps } = this.props
      Object.assign(newProps, this.props.iota)
      return (
        <ErrorBoundary>
          <div style={{ position: 'relative' }}>
            <WebComponents key="web-component" webComponent={this.props.iota.webComponent} {...newProps} />
            <Footer key="footer" />
          </div>
        </ErrorBoundary>
      )
    } else
      return (
        <ErrorBoundary>
          <div style={{ position: 'relative' }}>
            <div>Nothing Here</div>
            <Footer />
          </div>
        </ErrorBoundary>
      )
  }
}

export default hot(module)(App)
```

All of a sites pages will be based on WebComponents that are defined other React components as defined in app/web-components.
You will learn more about this as we go, but for each page on the site, you will create an object in Iotas.json that says the path, and the WebComponent like this

```
[
  ...
  {
    "_id": {
      "$oid": "5d56e411e7179a084eefb365"
    },
    "path": "/join",
    "subject": "Join",
    "description": "Join the Civil Server",
    "webComponent": "Join"
  }
  ...
]
```

If a user browses to a path that matches, the webComponent named will be used to render the rest of the page, and the subject and description as passed to the webComponent as props.

# Socket API Directory

Each file in the directory represents an api call. The root of the name of the file (eg socketlogger of socketlogger.js) is the name of the socket.io event that corresponding to the api. The paramaters of the api are determined by the definition of the function.

One api that is predefined in this module is socketlogger.js

```
'use strict'

function socketlogger(loggingEvent) {
  loggingEvent.data.push({ socketId: this.id, userId: this.synuser ? this.synuser.id : 'anonymous' })
  bslogger[loggingEvent.level.levelStr.toLowerCase()](loggingEvent.startTime, ...loggingEvent.data)
}

export default socketlogger
```

To call this API from the browser side you would use

```
window.socket.emit('socketlogger', loggingEvent)
```

an api function can have any number of parameters, it can also have a call-back as it's final parameter.

# Routes Directory

Each file in the directory represents an extension to the express server object- which can be this.app.use(...) this.app.get(...) or this.app.push(...)
An example is the sign-in route that looks like this:

```
import expressRateLimit from 'express-rate-limit'
import sendUserId from '../util/send-user-id'

async function signIn(req, res, next) {
  try {
    const { password, ..._body } = req.body // don't let the password appear in the logs
  ...
  } catch(error){
    logger.error("signIn caught error",error)
  }
}

function route() {
  const apiLimiter = expressRateLimit({
    windowMs: 60 * 1000,
    max: 2,
    message: 'Too many attempts logging in, please try again after 24 hours.',
  })
  this.app.post('/sign/in', apiLimiter, signIn, this.setUserCookie, sendUserId)
}
export default route
```

The default function of the file will be called with this of the express object.

# Events Dirctory

Within the server, components can listen for and generate events. Each file in the events directory represents an event listener, and can define the name of an Event.

To create an event listener create a file in app/events like this:

```
import { serverEvents } from 'civil-server'

function eventListener(p1,p2,...){
 ...
}

serverEvents.on(serverEvents.eNames.EventName, eventListener)

```

In the code that is going to generate the event, do this:

```
import { Iota, serverEvents } from 'civil-server'

serverEvents.eNameAdd('EventName')

serverEvents.emit(serverEvents.eNames.EventName, p1, p2, ...)
```

# Web Components Directory

Each file in [web-components](./app/web-components) represents a React Component. When a url matches in the iota collection path property, the web-component named in the document is looked up in the Web Components directory, and is used to render the data in the document.

# Contributions

Contributions are accepted under the MIT License without additional conditions. Use of the software, however, must abide by the MIT License with the Public Good Condition. This additional condition ensures that in the event the software is sold or licensed to others, the revenue so generated will be used to further the public mission of EnCiv, Inc, a 501(c)(3) nonprofit, rather than to enrich any directors, employees, members, or shareholders. (Nonprofits can not have shareholders)

# Getting started

You will need a github.com account, and a heroku.com account. Heroku is like a server in the cloud that you can push git repo's to, and after you push, heroku will build and run them. It's also great because they give you free accounts that you can use for development.

The install instructions are **[here](./doc/Install.md)**

# To Include Civil Server in an existing project

```
npm install git+https://github.com/EnCiv/civil-server.git#main
```

Make a copy of [start.js](https://github.com/EnCiv/civil-server-template/blob/main/app/start.js) and put it in `app/start.js`

## How to add a new web page to the server

Here is the flow. When a user visits the server with a url, `getIota()` in [get-iota.js](./app/routes/get-iota) will look up the path in the database. If it finds a match, it will look for a webComponent property and then look for a matching component in the [web-components](./app/web-components) directory and render that on the server through [app/server/routes/serverReactRender](./app/server/routes/server-react-render.jsx). All the properties of this webComponent will be passed as props to the corresponding React component.Then the page will be sent to the browser, and then rehydrated there, meaning the webComponent will run again on the browser, starting at [app/client/main-app.js](./app/client/main-app.js) and react will connect all the DOM elements.

### 1) Add a React Component to [./app/web-components](./app/components/web-components)

here is a simple one, ./app/web-components/undebate-iframes.js:

```
'use strict'

import React from 'react'
import injectSheet from 'react-jss'


const styles = {
  title: {
    color: 'black',
    fontSize: '2rem',
    textAlign: 'center',
  },
  frame: { marginTop: '1em', marginBottom: '1em', width: '100vw' },
}

class UndebateIframes extends React.Component {
  render() {
    const { classes } = this.props
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080

    return (
      <div>
        <div>
          <span className={classes['title']}>These are the Undebates</span>
        </div>
        <iframe
          className={classes.frame}
          height={height * 0.9}
          width={width}
          name="race1"
          src="https://cc.enciv.org/san-francisco-district-attorney"
        />
        <iframe
          className={classes.frame}
          height={height * 0.9}
          width={width}
          name="race2"
          src="https://cc.enciv.org/country:us/state:wi/office:city-of-onalaska-mayor/2020-4-7"
        />
      </div>
    )
  }
}
export default injectSheet(styles)(UndebateIframes)
```

### 2) Create a new document in [iotas.json](./iotas.json)

The example is the minimum information required. Any additional properties you add to webComponent will be passed as props to the associated React component.

```
[ ...,
  {
      "_id": {"$oid": "60d25dc95185ab71b8fa44a0"},
      "path": "/iframe-demo",
      "subject": "Iframe demo",
      "description": "a quick prototype of a page showing multiple undebates in separate iframes",
      "webComponent": {
          "webComponent": "UndebateIframes"
      },
  }
]
```

Note: use `app/tools/mongo-id` to create a new, unique mongo id and paste it in.

### 3) Advanced: Component

If your page should pull data out of the database, or calculate something to pass to the web component, then you can add a component to [app/data-components](./app/data-components) and then add a component: {component: YourComponentNane, ...} to the document above.

# useAuth

A react hook that provides state and methods for building user login and join react components. That authorization methods are separated out makeing it easy to build different react components for different UI/UX for user login and signup.

```
import {useAuth} from 'civil-client'
const [state, methods]=useAuth(onChange, userInfo)

```

## onChange

a callback in join, login, or skip will override this parameter

- falsey: do nothing after success
- string: set location.href after success
- function: to call after success with {userId: ObjectId, ...other-user-props} as paremeter.

## userInfo

other user info to pass to the server and database with the login/join/skip operation like firstName, lastName

## state

```js
{
  email: 'string',
  password: 'string'
  confirm: 'string'
  agree: 'bool'
  error: 'string',
  info: 'string',
  success: 'string
}
```

## methods

```js
{
  onChangeEmail(email){},
  onChangePassword(password){},
  onChangeConfirm(confirm){},
  onChangeAgree(agreed){},
  skip(cb){}, // skip the join process and assign a temporary id. But user must agree to the terms.
  login(cb){}, // login - requires email and password
  join(cb){}, // requiers email, password, confirm, agreed
  sendResetPassword(){}, // requires email
}
```

## Example

```js
import React, { useState, useEffect } from 'react'
import { useAuth } from 'civil-client'

export function UserLogin(props) {
  const [userInfo, setUserInfo] = useState(false)
  function onChange(userInfo) {
    setUserInfo(true)
  }
  const [state, methods] = useAuth(onChange, {})
  return (
    <div>
      <input name="email" onChange={e => methods.onChangeEmail(e.value)} />
      <input name="password" type="password" onChange={e => methods.onChangePassword(e.value)} />
      <button onClick={e => methods.login()}>Login</button>
      <div>
        {state.error && <div style={{ color: 'red' }}>{state.error}</div>}
        {state.info && <div>{state.info}</div>}
        {state.success && <div style={{ color: 'green' }}>{state.success}</div>}
      </div>
      <div>userInfo: {JSON.stringify(userInfo)}</div>
    </div>
  )
}
```
