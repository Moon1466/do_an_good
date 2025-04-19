const express = require('express')
const router = express.Router();
 const Category = require('../model/Categories');

const {getHome, getProduct, getOrder, getAccount} = require('../controllers/homeControllers')
const {getCategory, newCategory} = require('../controllers/categoryController')
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
router.get('/category/:slugPath', async (req, res) => {
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
  });
  

module.exports = router;
 