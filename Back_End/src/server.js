const express = require('express')
const { hostname } = require('os')
const path = require('path')
const app = express()
const port = process.env || 3000
const hostname = "localhost"

// USE TE

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// 

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.listen(port, hostname,  () => {
  console.log(`Example app listening on port ${port}`)
})