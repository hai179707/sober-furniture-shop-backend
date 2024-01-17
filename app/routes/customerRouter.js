const express = require("express")
const router = express.Router()
const customerController = require("../controllers/customerController")
const { verify, verifyAdmin, verifyCustomer } = require("../middlewares/authMiddleware")

router.post('/customers', customerController.createCustomer)

router.get('/customers', verify, verifyAdmin, customerController.getAllCustomers)

router.get('/customers/export', verify, verifyAdmin, customerController.exportCustomer)

router.get('/customers/:customerId', verify, verifyCustomer, customerController.getCustomerById)

router.put('/customers/:customerId', verify, verifyCustomer, customerController.updateCustomerById)

router.put('/customers/:customerId/password', verify, verifyCustomer, customerController.changePassword)

router.delete('/customers/:customerId', verify, verifyAdmin, customerController.deleteCustomerById)

module.exports = router