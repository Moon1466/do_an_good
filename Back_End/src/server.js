const express = require('express')
const path = require('path')
require('dotenv').config()
const app = express()

const configViewEngine = require('./config/viewEngine')
const webRoutes = require('./routes/web');
const { config } = require('dotenv')

const port = process.env.PORT || 3001
const hostname = process.env.HOST_NAME || 'localhost'

console.log(hostname)
// config

configViewEngine(app)

// config route

app.use('/' , webRoutes)

// 

 
app.listen(port, () => {
  console.log(`Example app listening on port ${port} `)
})