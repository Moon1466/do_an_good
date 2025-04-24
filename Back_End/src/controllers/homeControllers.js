const Product = require('../model/Products');
const Category = require('../model/Categories');

const getHome = (req, res) => {
    res.render('index');
}

const getProduct = async (req, res) => {
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
        
        res.render('product', { 
            products, 
            categories: allCategories,
            parentCategories,
            childCategories,
            searchTerm: req.query.search || ''
        });
    } catch (error) {
        res.render('product', { 
            products: [],
            categories: [],
            parentCategories: [],
            childCategories: [],
            searchTerm: req.query.search || '',
            error: 'Có lỗi xảy ra khi tìm kiếm sản phẩm'
        });
    }
}

const getOrder = (req, res) => {
    res.render('order');
}

const getAccount = (req, res) => {
    res.render('account');
}

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
  
      res.render('category', { categories: categoriesWithSubCount });
    } catch (err) {
      console.error('Lỗi fetch categories:', err);
      res.status(500).send('Server Error');
    }
  };
  

module.exports = {
    getHome,
    getProduct,
    getOrder,
    getAccount,
    getCategory
}