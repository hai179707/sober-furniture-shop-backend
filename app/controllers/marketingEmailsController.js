const MarketingEmail = require("../models/MarketingEmailModel")
const Customer = require("../models/CustomerModel")

const getMarketingEmails = async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 20
        const query = req.query.query

        const condition = {}

        if (query) {
            condition.email = { $regex: query, $options: 'i' }
        }

        const total = await MarketingEmail.count(condition)
        const data = await MarketingEmail.find(condition).sort({ updatedAt: -1 }).limit(limit).skip((page - 1) * limit)

        return res.status(200).json({
            total,
            data
        })
    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

const addMarketingEmail = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Email is required!"
            })
        }

        const user = await Customer.findOne({ email })

        const data = await MarketingEmail.create({
            email,
            hasAccount: !!user
        })

        return res.status(201).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

const deleteMarketingEmail = async (req, res) => {
    try {
        const { marketingEmailId } = req.body

        await MarketingEmail.findByIdAndDelete(marketingEmailId)

        return res.status(201).json('Delete marketing email successfully!')
    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

module.exports = {
    getMarketingEmails,
    addMarketingEmail,
    deleteMarketingEmail
}