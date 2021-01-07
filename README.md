# **Civil Server**

This is a node server, as a component that can be included in other projects and extended for use by other projects.  It is spun out from the [undebate](https://github.com/EnCiv/undebate) project so that it can be used as a common component of many projects.

Demo at https://civil-server.herokuapp.com

The idea is that Civil Server is a component with some basic funcationality that will be useful to a lot of projects.
Some projects may take this and add more features and create a component out of that will be useful to other projects.

And when changes/improvements are made to this project, they can be easilly updated in other projects.

**Copyright 2021 EnCiv, Inc.** This work is licensed under the terms described in [LICENSE.txt](https://github.com/EnCiv/civil-server/blob/master/LICENSE.txt) which is an MIT license with a [Public Good License Condition](https://github.com/EnCiv/undebate#the-need-for-a-public-good-license-condition).

# Features
- **User Join/Login/Logout/Forgot Password** to get you up and running quickly with user logins
- **MongoDB** for extensible user database
- **React Server Sider Rendering** for quick page loads
- **React Progressive Web Applications** for interactive pages with low server load
- **Socket.io** for asyncronous, bidirectional API's
- **Server Events** for extensibility
- **Nodemon** for email notifications
- **Send In Blue** for templated transactional email
- **Helmet** for improved security
- **Webpack and nodemon** for interactive development
- **Log4js** for logging to a collection in MongoDB
- **Log4js from the browser** for debugging
- **Loader.io verification** for load testing

# How to use it

_start.js_
```
'use strict';
import civilServer from "civil-server"

async function start() {
  await server.addSocketAPIsDirectory('./socketAPIs')
  await server.addRoutesDirectory('./router')
  await server.addEventsDirectory('./events')
  await server.addWebComponentsDirectory('./components/web-components')
  await server.start()
}

var server=new civilServer()

start()
```

# Socket API Directory
Each file in the directory represents an api call.  The root of the name of the file (eg socketlogger of socketlogger.js) is the name of the socket.io event that corresponding to the api.  The paramaters of the api are determined by the definition of the function.

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
Within the server, components can generate events, and listen for events. Each file in the events directory represents an event listener, and can define the name of an Event. 

# Web Components Directory
Each file represents a React Component.  When a url matches an iota collection path, the component named in the document is looked for in the Web Components directory, and is used to render the data in the document. 


# Contributions

Contributions are accepted under the MIT License without additional conditions. Use of the software, however, must abide by the MIT License with the Public Good Condition. This additional condition ensures that in the event the software is sold or licensed to others, the revenue so generated will be used to further the public mission of EnCiv, Inc, a 501(c)(3) nonprofit, rather than to enrich any directors, employees, members, or shareholders. (Nonprofits can not have shareholders)

# Getting started

You will need a github.com account, and a heroku.com account. Heroku is like a server in the cloud that you can push git repo's to, and after you push, heroku will build and run them. It's also great because they give you free accounts that you can use for development.

The install instructions are **[here](./doc/Install.md)**

