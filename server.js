#!/usr/bin/env node
'use strict'
const express = require('express')
const rateLimit = require('express-rate-limit')
const app = express()
const authenticate = require('./src/authenticate')
const params = require('./src/params')
const proxy = require('./src/proxy')

const PORT = process.env.PORT || 8080

app.enable('trust proxy')

// Rate Limiting Configuration: Limit to 100 requests per 15 minutes (adjust as needed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

// Apply the rate limiter to all requests
app.use(limiter)

app.get('/', authenticate, params, proxy)
app.get('/favicon.ico', (req, res) => res.status(204).end())
app.listen(PORT, () => console.log(`Listening on ${PORT}`))
