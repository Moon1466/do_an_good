const Product = require('../model/Products');
const Category = require('../model/Categories');
const Order = require('../model/Orders');
const User = require('../model/Accounts');
const Settings = require('../model/Settings');

const getHome = async (req, res) => {
    try {
        // Lấy tổng doanh thu
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'Đã giao hàng' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        // Lấy tổng số đơn hàng
        const totalOrders = await Order.countDocuments();
        
        // Lấy tổng số sản phẩm
        const totalProducts = await Product.countDocuments();
        
        // Lấy tổng số người dùng
        const totalUsers = await User.countDocuments();
        
        // Lấy doanh thu theo tháng
        const monthlyRevenue = await Order.aggregate([
            { $match: { status: 'Đã giao hàng' } },
            { $group: { 
                _id: { $month: '$createdAt' },
                total: { $sum: '$totalAmount' }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        // Lấy số lượng đơn hàng theo trạng thái
        const orderStatusCount = await Order.aggregate([
            { $group: { 
                _id: '$status',
                count: { $sum: 1 }
            }}
        ]);
        
        // Lấy danh sách đơn hàng gần đây
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.render('dashboard', {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders,
            totalProducts,
            totalUsers,
            monthlyRevenue: Array(12).fill(0).map((_, i) => {
                const monthData = monthlyRevenue.find(m => m._id === i + 1);
                return monthData ? monthData.total : 0;
            }),
            orderStatusCount: orderStatusCount.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            recentOrders
        });
    } catch (error) {
        res.render('dashboard', {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalUsers: 0,
            monthlyRevenue: Array(12).fill(0),
            orderStatusCount: {},
            recentOrders: []
        });
    }
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

const getComment = async (req, res) => {
    try {
        // Lấy danh sách sản phẩm, có thể chọn trường cần thiết
        const products = await Product.find().lean();

        // Nếu sản phẩm chưa có rating, bạn có thể gán mặc định để test
        const productsWithRating = products.map(p => ({
            ...p,
            rating: p.rating || 5, // hoặc lấy rating thực tế nếu có
            image: p.images && p.images.length > 0 ? p.images[0] : '/images/default.jpg'
        }));

        res.render('comment', { products: productsWithRating });
    } catch (error) {
        res.render('comment', { products: [] });
    }
};

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

const getSetting = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.render('setting', { settings });
    } catch (error) {
        res.render('setting', { settings: null });
    }
}

module.exports = {
    getHome,
    getProduct,
    getOrder,
    getAccount,
    getComment,
    getCategory,
    getSetting
}