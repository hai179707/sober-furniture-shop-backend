const express = require("express")
const router = express.Router()
const productTypeController = require("../controllers/productTypeController")
const { verify, verifyAdmin } = require("../middlewares/authMiddleware")

router.post('/product-types', verify, verifyAdmin, productTypeController.createProductType)

router.get('/product-types', productTypeController.getAllProductTypes)

router.get('/product-types/:productTypeId', productTypeController.getProductTypeById)

router.put('/product-types/:productTypeId', verify, verifyAdmin, productTypeController.updateProductTypeById)

router.delete('/product-types/:productTypeId', verify, verifyAdmin, productTypeController.deleteProductTypeById)

module.exports = router