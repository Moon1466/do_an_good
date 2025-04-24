const express = require('express')
const router = express.Router();
const Category = require('../model/Categories');
const User = require('../model/Accounts');

const {getHome, getProduct, getOrder} = require('../controllers/homeControllers')
const {getCategories, newCategory, showCategory} = require('../controllers/apiCategoryController')

router.get('/', getHome)

router.get('/product', getProduct)

router.get('/order', getOrder)

router.get('/account', async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        let query = {};
        
        if (searchTerm) {
            query = {
                $or: [
                    { username: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { fullName: { $regex: searchTerm, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query);
        res.render('account', { 
            users,
            searchTerm
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.render('account', { 
            users: [],
            searchTerm: '',
            error: 'Có lỗi xảy ra khi tải dữ liệu'
        });
    }
});

router.get('/category', getCategories)

router.get('/categories/new', newCategory);

router.get('/product/:slug', (req, res) => {
    const slug = req.params.slug
    res.send(`Product detail for ${slug}`)
})

// Route hiển thị chi tiết danh mục
router.get('/category/:slugPath', showCategory);

module.exports = router;
 