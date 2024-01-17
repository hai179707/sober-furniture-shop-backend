// Khai báo thư viện ExpressJS
const express = require("express")

// Khai báo router app
const router = express.Router()

const orderController = require("../controllers/orderController")
const { verifyAdmin, verify, verifyCustomer } = require("../middlewares/authMiddleware")


// routes
router.post('/orders', orderController.createOrder)

router.post('/customers/:customerId/orders', verify, verifyAdmin, orderController.createOrderOfCustomer)

router.get('/customers/:customerId/orders', verify, verifyCustomer, orderController.getAllOrdersOfCustomer)

router.get('/orders/total', verify, verifyAdmin, orderController.getOrderTotal)

router.get('/orders/hours', verify, verifyAdmin, orderController.getOrderHoursTotal)

router.get('/orders/week', verify, verifyAdmin, orderController.getOrderLastWeekTotal)

router.get('/customers/:customerId/orders/total', verify, verifyCustomer, orderController.getOrderTotalOfCustomer)

router.get('/orders', verify, verifyAdmin, orderController.getAllOrders)

router.get('/orders/export', verify, verifyAdmin, orderController.exportOrders)

router.get('/orders/:orderId', verify, verifyAdmin, orderController.getOrder)

router.put('/orders/:orderId', verify, verifyAdmin, orderController.updateOrder)

router.delete('/orders/:orderId', verify, verifyAdmin, orderController.deleteOrder)

module.exports = router