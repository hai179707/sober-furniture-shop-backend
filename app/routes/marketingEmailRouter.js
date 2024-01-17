const express = require("express")
const { getMarketingEmails, addMarketingEmail, deleteMarketingEmail } = require("../controllers/marketingEmailsController")
const { verify, verifyAdmin } = require("../middlewares/authMiddleware")
const router = express.Router()

router.get('/marketingEmails', verify, verifyAdmin, getMarketingEmails)

router.post('/marketingEmails', addMarketingEmail)

router.delete('/marketingEmails/:marketingEmailId', verify, verifyAdmin, deleteMarketingEmail)

module.exports = router