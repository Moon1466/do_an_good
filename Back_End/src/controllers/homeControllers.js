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

module.exports = {
    getHome,
    getProduct,
    getOrder,
    getAccount
}