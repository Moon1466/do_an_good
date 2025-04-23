const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const Category = require('../model/Categories'); // Đảm bảo đường dẫn đúng

const createCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;

    // Kiểm tra nếu parent không hợp lệ
    if (parent && !mongoose.Types.ObjectId.isValid(parent)) {
      return res.status(400).json({ message: "Parent ID không hợp lệ" });
    }

    const cat = new Category({ name, parent: parent || null });
    await cat.validate(); // Kiểm tra lỗi trước khi lưu
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(400).json({ error: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean(); // Lấy danh sách danh mục
    const subCategories = await Category.find({ parent: { $exists: true } }).lean(); // Lấy danh mục con

    res.render("category", { categories, subCategories }); // Truyền cả categories và subCategories vào view
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).send("Internal Server Error");
  }
};

const getCategoriesbySlugPath = async (req, res, next) => {
  const { slugPath } = req.params;

  if (!slugPath) {
    return res.status(400).json({ error: 'SlugPath is required' });
  }

  try {
    // Nếu slugPath là ObjectId hợp lệ, tìm theo ID
    if (mongoose.Types.ObjectId.isValid(slugPath)) {
      const category = await Category.findById(slugPath).populate('parent').lean();
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.json(category);
    }

    // Nếu slugPath không phải ObjectId, tìm theo fullSlug
    const category = await Category.findOne({ fullSlug: slugPath });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const getCategoryById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID không hợp lệ" });
  }

  try {
    const category = await Category.findById(id).populate('parent').lean();
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    const subCategories = await Category.find({ parent: id }).lean();
   

    category.subCategories = subCategories || [];
    res.status(200).json(category);
  } catch (err) {
    console.error("Error fetching category details:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updatedCategory = async (req, res) => {
  const { id } = req.params;
  const { name, parent } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Lấy thông tin cũ
    const oldCategory = await Category.findById(id);
    if (!oldCategory) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    // Tính lại slug nếu đổi tên
    let slug = oldCategory.slug;
    if (name && name !== oldCategory.name) {
      slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    }

    // Xác định parent mới (nếu đổi), hoặc giữ nguyên parent cũ
    let parentId = typeof parent !== "undefined" ? parent : oldCategory.parent;

    // Tính lại fullSlug
    let fullSlug = slug;
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (parentCategory) {
        fullSlug = `${parentCategory.fullSlug}/${slug}`;
      }
    }

    // Cập nhật danh mục
    const updatedData = { name, slug, fullSlug, parent: parentId || null };
    const category = await Category.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    // Nếu đổi tên hoặc đổi cha, cập nhật fullSlug cho các danh mục con
    if ((name && name !== oldCategory.name) || (typeof parent !== "undefined" && parent !== String(oldCategory.parent))) {
      const subCategories = await Category.find({ parent: id });
      for (const subCategory of subCategories) {
        const newFullSlug = `${fullSlug}/${subCategory.slug}`;
        await Category.findByIdAndUpdate(subCategory._id, { fullSlug: newFullSlug });
      }
    }

    res.status(200).json(category);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

 
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("ID không hợp lệ:", id);
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Tìm và xóa tất cả danh mục con liên quan
    const subCategories = await Category.find({ parent: id }).lean();
 
    if (subCategories.length > 0) {
      const subCategoryIds = subCategories.map((subCat) => subCat._id);
      await Category.deleteMany({ _id: { $in: subCategoryIds } });
     }

    // Xóa danh mục cha
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      console.error("Danh mục không tồn tại:", id);
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

     res.status(200).json({ message: "Danh mục và các danh mục con đã được xóa thành công" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createCategory , getCategories , getCategoriesbySlugPath , getCategoryById , updatedCategory , deleteCategory
};