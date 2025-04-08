const express = require('express')
const router = express.Router();

const {getHome, getProduct, getOrder, getAccount} = require('../controllers/homeControllers')

router.get('/', getHome)

router.get('/product', getProduct)

router.get('/order', getOrder)

router.get('/account', getAccount)

module.exports = router;