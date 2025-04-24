const express = require('express')
const path = require('path')
require('dotenv').config()
const app = express()

const configViewEngine = require('./config/viewEngine')
const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api')
const connection = require('./config/database')
 

const port = process.env.PORT || 3001
const hostname = process.env.HOST_NAME || 'localhost'

// Middleware để parse JSON và dữ liệu từ form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('src/public')); // Đảm bảo đường dẫn đúng tới thư mục chứa ảnh, css, js

// Cấu hình view engine
configViewEngine(app)

// Cấu hình route
app.use('/', webRoutes);
app.use('/api', apiRoutes);
 
// Kết nối cơ sở dữ liệu và khởi chạy server
(async () => {
  try {
    await connection();
    app.listen(port, () => {
    });
  } catch (error) {
  }
})();