const express = require('express')
const path = require('path')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3001
const hostname = process.env.HOST_NAME || 'localhost'

console.log(hostname)
// config TE

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// config static file
app.use(express.static(path.join(__dirname, 'public')))

// 

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port} `)
})