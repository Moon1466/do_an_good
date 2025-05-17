const express = require('express')
const router = express.Router();
const Category = require('../model/Categories');
const { getOrders } = require('../controllers/apiOrderController');

const {getHome, getProduct, getComment} = require('../controllers/homeControllers')
const {getCategories, newCategory, showCategory} = require('../controllers/apiCategoryController')

router.get('/', getHome)

router.get('/product', getProduct)

router.get('/order', getOrders)

router.get('/category', getCategories)

router.get('/categories/new', newCategory);

router.get('/comment', getComment)

router.get('/product/:slug', (req, res) => {
    const slug = req.params.slug
    res.send(`Product detail for ${slug}`)
})

// Route hiển thị chi tiết danh mục
router.get('/category/:slugPath', showCategory);

module.exports = router;
 