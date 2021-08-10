'use strict'

import AuthForm from './components/auth-form'
import clientMain from './client/main'
import ErrorBoundary from './components/error-boundary'

// do NOT try to pass browser/client side objects through here (like AuthForm) - when you import them it will also import the server into the browser
export { AuthForm, clientMain, ErrorBoundary }
