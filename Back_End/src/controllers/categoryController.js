// src/controllers/homeControllers.js
const express = require('express')
const router = express.Router();
const Category = require('../model/Categories');

const getCategory = async (req, res) => {
  try {
    // Lấy các category gốc (danh mục cha)
    const categories = await Category.find({ parent: null }).sort('name').lean();

    // Tính số lượng danh mục con cho từng danh mục
    for (const category of categories) {
      const subCategoriesCount = await Category.countDocuments({ parent: category._id });
      category.subCategoriesCount = subCategoriesCount; // Gắn số lượng danh mục con
    }

    // Render view 'category', truyền biến categories
    res.render('category', { categories });
  } catch (err) {
    console.error('Lỗi fetch categories:', err);
    res.status(500).send('Server Error');
  }
};

const newCategory = async (req, res) => {
  try {
    const allCats = await Category.find().sort('fullSlug');
    // Luôn truyền error—khi không có lỗi thì null
    res.render('newCategory', { allCats, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getCategory,
  newCategory,
};