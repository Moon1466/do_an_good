// src/controllers/homeControllers.js
const express = require('express')
const router = express.Router();
const Category = require('../model/Categories');

const getCategory = async (req, res) => {
  try {
    // Lấy danh sách danh mục cha
    const categories = await Category.find({ parent: null }).lean();

    // Đếm số lượng danh mục con cho từng danh mục cha
    const categoriesWithSubCount = await Promise.all(
      categories.map(async (cat) => {
        const subCategoriesCount = await Category.countDocuments({ parent: cat._id });
        return { ...cat, subCategoriesCount };
      })
    );

    console.log("Categories with subcategories count:", categoriesWithSubCount); // Log để kiểm tra

    res.render('category', { categories: categoriesWithSubCount });
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

const showCategory = async (req, res) => {
    try {
      const slugPath = req.params.slugPath;
  
      // Tìm danh mục hiện tại
      const cat = await Category.findOne({ fullSlug: slugPath });
      if (!cat) {
        return res.status(404).send('Category not found');
      }
  
      // Tìm các danh mục con
      const subCategories = await Category.find({ parent: cat._id }).sort('name');
  
      // Render giao diện với danh mục hiện tại và danh mục con
      res.render('categoryDetail', { category: cat, subCategories });
    } catch (err) {
      console.error('Error fetching category:', err);
      res.status(500).send('Internal Server Error');
    }
  }

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ parent: null }).lean();

    const categoriesWithSubCount = await Promise.all(
      categories.map(async (cat) => {
        const subCategoriesCount = await Category.countDocuments({ parent: cat._id });
        return { ...cat, subCategoriesCount };
      })
    );

    res.status(200).json(categoriesWithSubCount);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getCategory,
  newCategory,
  showCategory,
  getCategories
};