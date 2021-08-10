'use strict'

import AuthForm from './components/auth-form/index.jsx'
import clientMain from './client/main.js'

// do NOT try to pass browser/client side objects through here (like AuthForm) - when you import them it will also import the server into the browser
export { AuthForm, clientMain }
