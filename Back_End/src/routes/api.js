// routes/categoryRoutes.js
const express = require('express');
const routerAPI = express.Router();
const Category = require('../model/Categories');

// Tạo category mới
routerAPI.post('/categories', async (req, res) => {
  try {
    const { name, parent } = req.body;
    const cat = new Category({ name, parent: parent || null });
    await cat.validate();   // để bắt lỗi trước khi save
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lấy tất cả (có thể filter theo parent để lấy con của 1 node)
routerAPI.get('/categories', async (req, res) => {
  const { parent } = req.query; 
  const filter = parent ? { parent } : { parent: null };
  const list = await Category.find(filter).sort('name');
  res.json(list);
});

// Lấy chi tiết theo fullSlug (đường dẫn lồng cấp)
routerAPI.get('/categories/:slugPath', async (req, res) => {
  try {
    const slugPath = req.params.slugPath;
    const cat = await Category.findOne({ fullSlug: slugPath });
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật name (và tự động cập nhật lại slug/fullSlug)
routerAPI.put('/categories/:id', async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    cat.name = req.body.name || cat.name;
    cat.parent = req.body.parent !== undefined ? req.body.parent : cat.parent;
    await cat.validate();
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Xóa category (chú ý có thể cần xử lý cascade con)
routerAPI.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    res.status(200).json({ message: "Danh mục đã được xóa thành công" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = routerAPI;
