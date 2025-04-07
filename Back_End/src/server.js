const express = require('express')
const path = require('path')
require('dotenv').config()
const app = express()

const configViewEngine = require('./config/viewEngine')
const webRoutes = require('./routes/web');
const { config } = require('dotenv')
const connection = require('./config/database')

const User = require('./model/Users')

const port = process.env.PORT || 3001
const hostname = process.env.HOST_NAME || 'localhost'

// config

configViewEngine(app)

// config route

app.use('/' , webRoutes);

//  test

 

// Launch app
(async () => {
  try {
    await connection();
    app.listen(port, () => {
      console.log(`Example app listening on port Apple Music `);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
})();