const express = require('express');
const mongoose = require('mongoose');
const routerAPI = express.Router();
const Category = require('../model/Categories');

const { createCategory, getCategories, getCategoriesbySlugPath , getCategoryById, updatedCategory  , deleteCategory} = require('../controllers/apiCategoryController');
// ------------ Category ------------------- //

routerAPI.post('/categories', createCategory); // Sử dụng createCategory từ controller
routerAPI.get('/categories', getCategories); // Lấy tất cả danh mục (có thể filter theo parent)
routerAPI.get('/categories/slug/:slugPath', getCategoriesbySlugPath); // Lấy chi tiết theo slugPath
routerAPI.get('/categories/:id', getCategoryById); // Lấy chi tiết theo id
routerAPI.put('/categories/:id', updatedCategory); // Cập nhật danh mục
routerAPI.delete('/categories/:id', deleteCategory); // Xóa danh mục

module.exports = routerAPI;
