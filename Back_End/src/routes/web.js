const express = require('express')
const router = express.Router();
 const Category = require('../model/Categories');

const {getHome, getProduct, getOrder, getAccount} = require('../controllers/homeControllers')
const {getCategory, newCategory, showCategory} = require('../controllers/categoryController')
router.get('/', getHome)

router.get('/product', getProduct)

router.get('/order', getOrder)

router.get('/account', getAccount)

router.get('/category', getCategory)

router.get('/categories/new', newCategory);


router.get('/product/:slug', (req, res) => {
    const slug = req.params.slug
    res.send(`Product detail for ${slug}`)
}   )

// Route hiển thị chi tiết danh mục
router.get('/category/:slugPath', showCategory );
  

module.exports = router;
 