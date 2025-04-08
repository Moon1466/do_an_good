const getHome = (req, res) =>{
    res.render('index.ejs')
}

const getProduct = (req, res) =>{
    res.render('product.ejs')
}

const getOrder = (req, res) =>{
    res.render('order.ejs')
}

const getAccount = (req, res) =>{
    res.render('account.ejs')
}

module.exports = {
    getHome, getProduct, getOrder, getAccount
}