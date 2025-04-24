const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../model/Products');
const Category = require('../model/Categories'); 


const createProduct = async (req, res) => {
  try {
    const { name, price, stock, supplier, publisher, type, author, description, category } = req.body;
    // Xử lý file ảnh nếu có (req.files)
    const images = []; // Xử lý thêm nếu dùng upload ảnh
    const subImages = [];
    const product = new Product({
      name, price, stock, supplier, publisher, type, author, description, category, images, subImages
    });
    await product.save();
    res.status(201).json({ message: 'Thêm sản phẩm thành công', product });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi thêm sản phẩm', error: err.message });
  }
};

const addProduct = async (req, res) => {
  try {
    // Lấy tên file đã được multer đổi (không dấu, an toàn)
    let images = [];
    let subImages = [];
    if (req.files && req.files['images']) {
      images = req.files['images'].map(file => file.filename);
    }
    if (req.files && req.files['subImages']) {
      subImages = req.files['subImages'].map(file => file.filename);
    }

    // Tạo sản phẩm mới
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock,
      images: images,           // Đúng tên file đã đổi
      subImages: subImages,     // Đúng tên file đã đổi
      supplier: req.body.supplier,
      publisher: req.body.publisher,
      type: req.body.type,
      author: req.body.author,
      category: req.body.category,
      parentCategory: req.body.parentCategory,
      description: req.body.description,
      isSale: req.body.isSale === 'true',
      sale: req.body.sale,
      active: req.body.active === 'true'
    });

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    let query = {};
    
    // Nếu có tham số tìm kiếm
    if (req.query.search) {
      query = {
        name: { 
          $regex: new RegExp(req.query.search, 'i') // Tìm kiếm không phân biệt hoa thường và dấu
        }
      };
    }
    
    const products = await Product.find(query).populate({
      path: 'category',
      populate: {
        path: 'parent'
      }
    });
    
    // Lấy tất cả categories và phân loại
    const allCategories = await Category.find();
    const parentCategories = allCategories.filter(cat => !cat.parent);
    const childCategories = allCategories.filter(cat => cat.parent);
    
    if (req.path === '/product') {
      // Nếu là route /product, render view
      res.render('product', { 
        products, 
        categories: allCategories,
        parentCategories,
        childCategories,
        searchTerm: req.query.search || ''
      });
    } else {
      // Nếu là API route /products, trả về JSON
      res.json({
        success: true,
        data: products
      });
    }
  } catch (error) {
    if (req.path === '/product') {
      res.render('product', { 
        products: [],
        categories: [],
        parentCategories: [],
        childCategories: [],
        searchTerm: req.query.search || '',
        error: 'Có lỗi xảy ra khi tìm kiếm sản phẩm'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách sản phẩm'
      });
    }
  }
};

const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        // Populate cả category và lấy thêm thông tin parent của category
        const product = await Product.findById(productId)
            .populate({
                path: 'category',
                populate: {
                    path: 'parent'
                }
            });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Lấy thêm tất cả categories để client có thể xử lý
        const allCategories = await Category.find();

        res.json({
            success: true,
            data: product,
            categories: allCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin sản phẩm'
        });
    }
};

const updateProductStatus = async (req, res) => {
  try {
      const { id } = req.params;
      const { active } = req.body;

      // Kiểm tra tồn kho trước khi cập nhật
      const product = await Product.findById(id);
      if (!product) {
          return res.status(404).json({
              success: false,
              message: 'Không tìm thấy sản phẩm'
          });
      }

      // Nếu tồn kho = 0, không cho phép active
      if (product.stock === 0 && active === true) {
          return res.status(400).json({
              success: false,
              message: 'Không thể kích hoạt sản phẩm khi hết hàng'
          });
      }

      // Cập nhật trạng thái
      const updatedProduct = await Product.findByIdAndUpdate(
          id,
          { active: active },
          { new: true }
      );

      res.json({
          success: true,
          message: 'Cập nhật trạng thái thành công',
          data: updatedProduct
      });

  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Lỗi server khi cập nhật trạng thái'
      });
  }
}

const deleteProduct =  async (req, res) => {
  try {
      const { id } = req.params;

      // Kiểm tra sản phẩm tồn tại
      const product = await Product.findById(id);
      if (!product) {
          return res.status(404).json({
              success: false,
              message: 'Không tìm thấy sản phẩm'
          });
      }

      // Xóa sản phẩm
      await Product.findByIdAndDelete(id);

      res.json({
          success: true,
          message: 'Xóa sản phẩm thành công'
      });

  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Lỗi server khi xóa sản phẩm'
      });
  }
}

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = { ...req.body };
    
    // Chuyển đổi các trường dữ liệu
    updateData.price = Number(updateData.price);
    updateData.stock = Number(updateData.stock);
    updateData.isSale = updateData.isSale === 'true';
    updateData.active = updateData.active === 'true';
    if (updateData.sale) {
      updateData.sale = Number(updateData.sale);
    }
    
    // Xử lý ảnh chính và ảnh phụ
    if (req.files) {
      // Nếu có ảnh chính mới, cập nhật ảnh chính
      if (req.files['images'] && req.files['images'].length > 0) {
        updateData.images = req.files['images'].map(file => file.filename);
      }
      
      // Nếu có ảnh phụ mới, thêm vào mảng ảnh phụ hiện có
      if (req.files['subImages'] && req.files['subImages'].length > 0) {
        // Lấy sản phẩm hiện tại để có danh sách ảnh phụ
        const currentProduct = await Product.findById(productId);
        const currentSubImages = currentProduct.subImages || [];
        
        // Thêm ảnh mới vào mảng hiện có
        const newSubImages = req.files['subImages'].map(file => file.filename);
        updateData.subImages = [...currentSubImages, ...newSubImages];
      }
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật sản phẩm',
      error: error.message
    });
  }
}

const deleteSubImage = async (req, res) => {
  try {
    const { id, index } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    const indexNumber = parseInt(index);
    if (isNaN(indexNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Index không hợp lệ'
      });
    }

    // Tìm sản phẩm
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Kiểm tra mảng subImages có tồn tại và có phần tử không
    if (!product.subImages || !Array.isArray(product.subImages)) {
      product.subImages = []; // Khởi tạo mảng rỗng nếu chưa có
    }

    // Kiểm tra index hợp lệ
    if (indexNumber < 0 || indexNumber >= product.subImages.length) {
      return res.status(400).json({
        success: false,
        message: 'Index ảnh không hợp lệ'
      });
    }

    // Lấy tên file ảnh cần xóa
    const imageToDelete = product.subImages[indexNumber];

    // Xóa ảnh khỏi mảng subImages
    product.subImages.splice(indexNumber, 1);

    // Lưu thay đổi vào database với validateBeforeSave: false để bỏ qua validation
    await product.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Xóa ảnh thành công',
      deletedImage: imageToDelete
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa ảnh',
      error: error.message
    });
  }
};

module.exports = {
  createProduct, addProduct, getAllProducts, getProductById, updateProductStatus, deleteProduct, updateProduct, deleteSubImage
};