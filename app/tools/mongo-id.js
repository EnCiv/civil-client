#!/usr/bin/env node
'use strict'

var ObjectID = require('mongodb').ObjectID

console.log((new ObjectID()).toHexString())
