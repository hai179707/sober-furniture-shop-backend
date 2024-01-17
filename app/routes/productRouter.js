const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")
const { verify, verifyAdmin } = require("../middlewares/authMiddleware")


router.post('/products', verify, verifyAdmin, productController.createProduct)

router.get('/products', verify, verifyAdmin, productController.getAllProducts)

router.get('/products/public', productController.getAllPublicProducts)

router.get('/products/export', verify, verifyAdmin, productController.exportProducts)

router.get('/products/total', productController.getTotal)

router.get('/products/:productId', verify, verifyAdmin, productController.getProductById)

router.get('/products/public/:productId', productController.getPublicProductById)

router.get('/products/:productId/related', productController.getRelatedProducts)

router.put('/products/:productId', verify, verifyAdmin, productController.updateProductById)

module.exports = router