const express = require('express');
const mongoose = require('mongoose');
const routerAPI = express.Router();
const Category = require('../model/Categories');
const Product = require('../model/Products');
const Account = require('../model/Accounts');
const multer = require('multer');
const upload = require('../config/multer');
 
const { createCategory, getCategories, getCategoriesbySlugPath , getCategoryById, updatedCategory  , deleteCategory} = require('../controllers/apiCategoryController');
const { addProduct , getAllProducts, getProductById, updateProductStatus, deleteProduct, updateProduct, deleteSubImage } = require('../controllers/apiProductController');
const { createAccount, getAllAccounts, getAccountById, updateAccount, deleteAccount } = require('../controllers/apiAccountController');

// ------------ Category ------------------- //

routerAPI.post('/categories', createCategory); // Sử dụng createCategory từ controller
routerAPI.get('/categories', getCategories); // Lấy tất cả danh mục (có thể filter theo parent)
routerAPI.get('/categories/slug/:slugPath', getCategoriesbySlugPath); // Lấy chi tiết theo slugPath
routerAPI.get('/categories/:id', getCategoryById); // Lấy chi tiết theo id
routerAPI.put('/categories/:id', updatedCategory); // Cập nhật danh mục
routerAPI.delete('/categories/:id', deleteCategory); // Xóa danh mục

// ------------ Product ------------------- //

// Route thêm sản phẩm
routerAPI.post('/add', upload.fields([
  { name: 'images', maxCount: 1 },
  { name: 'subImages', maxCount: 10 }
]), addProduct);

// Route lấy tất cả sản phẩm và tìm kiếm
routerAPI.get('/products', getAllProducts);
routerAPI.get('/product', getAllProducts); // Thêm route mới cho trang product với tìm kiếm

// Route lấy thông tin sản phẩm
routerAPI.get('/products/:id', getProductById);

// Route cập nhật trạng thái sản phẩm
routerAPI.put('/products/:id/status', updateProductStatus);

// Route cập nhật sản phẩm
routerAPI.put('/products/:id', upload.fields([
  { name: 'images', maxCount: 1 },
  { name: 'subImages', maxCount: 10 }
]), updateProduct);

// Route xóa sản phẩm
routerAPI.delete('/products/:id', deleteProduct);

// Route xóa ảnh phụ của sản phẩm - đặt trước route get product để tránh xung đột
routerAPI.delete('/products/:id/subimage/:index', deleteSubImage);

// ------------ Account ------------------- //
routerAPI.get('/accounts', getAllAccounts); // Lấy danh sách tài khoản
routerAPI.get('/accounts/:id', getAccountById); // Lấy chi tiết tài khoản
routerAPI.post('/account/create', upload.single('avatar'), createAccount); // Tạo tài khoản mới
routerAPI.put('/accounts/:id', upload.single('avatar'), updateAccount); // Cập nhật tài khoản
routerAPI.delete('/accounts/:id', deleteAccount); // Xóa tài khoản

module.exports = routerAPI;
