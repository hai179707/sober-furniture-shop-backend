const mongoose = require("mongoose")
const Customer = require("../models/CustomerModel")
const bcrypt = require('bcrypt')
const exceljs = require('exceljs')

// Create customer
const createCustomer = async (req, res) => {
    try {
        const body = req.body

        if (!body.fullName) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Full name is required"
            })
        }

        if (!body.email) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Email is required"
            })
        }

        if (!body.phone) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Phone is required"
            })
        }

        const data = await Customer.create({
            email: body.email,
            fullName: body.fullName,
            displayName: body.displayName,
            photoURL: body.photoURL,
            address: body.address,
            phone: body.phone,
            city: body.city,
            province: body.province
        })

        return res.status(201).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Get all customers
const getAllCustomers = async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 20
        const ordersCountMin = req.query.orders_count_min
        const query = req.query.query

        const condition = { isAdmin: false }

        if (ordersCountMin) {
            condition.orders = { $exists: true }
            condition.$where = `this.orders.length>${ordersCountMin}`
        }

        if (query) {
            condition.$or = [
                { fullName: { $regex: query, $options: 'i' } },
                { phone: { $regex: query } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }

        const total = await Customer.count(condition)
        const data = await Customer.find(condition).sort({ updatedAt: -1 }).limit(limit).skip((page - 1) * limit).populate('orders')

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

// Get customer by id
const getCustomerById = async (req, res) => {
    try {
        const customerId = req.params.customerId

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Customer id is not valid"
            })
        }

        const data = await Customer.findById(customerId).populate('orders')

        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Update customer by id
const updateCustomerById = async (req, res) => {
    try {
        const customerId = req.params.customerId
        const body = req.body

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Customer id is not valid"
            })
        }

        if (body.password && !body.password.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Password is not valid"
            })
        }

        if (body.displayName && !body.displayName.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "DisplayName is not valid"
            })
        }

        if (body.photoURL && !body.photoURL.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "PhotoURL is not valid"
            })
        }

        if (body.fullName && !body.fullName.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Full name is not valid"
            })
        }

        if (body.phone && !body.phone.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Full name is not valid"
            })
        }

        if (body.email && !body.email.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Email is not valid"
            })
        }

        if (body.address && !body.address.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Address is not valid"
            })
        }

        if (body.city && !body.city.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "City is not valid"
            })
        }

        if (body.province && !body.province.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Province is not valid"
            })
        }

        const newCustomer = {}

        if (body.password) newCustomer.password = body.password
        if (body.displayName) newCustomer.displayName = body.displayName
        if (body.fullName) newCustomer.fullName = body.fullName
        if (body.photoURL) newCustomer.photoURL = body.photoURL
        if (body.phone) newCustomer.phone = body.phone
        if (body.email) newCustomer.email = body.email
        if (body.address) newCustomer.address = body.address
        if (body.city) newCustomer.city = body.city
        if (body.province) newCustomer.province = body.province

        const data = await Customer.findByIdAndUpdate(customerId, newCustomer, { new: true }).populate('orders')

        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Delete customer by id
const deleteCustomerById = async (req, res) => {
    try {
        const customerId = req.params.customerId

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Customer id is not valid"
            })
        }

        await Customer.findByIdAndDelete(customerId)
        
        return res.status(200).json({
            status: "Delete a customer successfully!"
        })
    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const exportCustomer = async (req, res) => {
    try {
        const ordersCountMin = req.query.orders_count_min
        const query = req.query.query

        const workbook = new exceljs.Workbook()
        const worksheet = workbook.addWorksheet('Customers')
        const condition = { isAdmin: false }

        if (ordersCountMin) {
            condition.orders = { $exists: true }
            condition.$where = `this.orders.length>${ordersCountMin}`
        }

        if (query) {
            if (+query) condition.phone = { $regex: query }
            else condition.fullName = { $regex: query, $options: 'i' }
        }

        worksheet.columns = [
            { header: 'No.', key: 'no' },
            { header: 'Full name', key: 'fullName' },
            { header: 'Display name', key: 'displayName' },
            { header: 'Photo URL', key: 'photoURL' },
            { header: 'Phone', key: 'phone' },
            { header: 'Email', key: 'email' },
            { header: 'Address', key: 'address' },
            { header: 'City', key: 'city' },
            { header: 'Province', key: 'province' },
            { header: 'Register date', key: 'createdAt' },
        ]

        const customers = await Customer.find(condition).sort({ updatedAt: -1 })
        customers.forEach((customer, index) => {
            customer.no = index + 1
            worksheet.addRow(customer)
        })
        worksheet.getRow(1).eachCell(cell => cell.font = { bold: true })

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheatml.sheet'
        )

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=customers.xlsx'
        )
        return workbook.xlsx.write(res).then(() => {
            res.status(200)
        })

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const changePassword = async (req, res) => {
    try {
        const { newPassword, currentPassword } = req.body
        const customerId = req.params.customerId

        const customerPassword = await Customer.findOne({ _id: customerId }, 'password')
        const isPasswordMatch = bcrypt.compareSync(currentPassword, customerPassword.password)
        if (isPasswordMatch) {
            const hashPassword = bcrypt.hashSync(newPassword, 10)
            Customer.findByIdAndUpdate(customerId, { password: hashPassword }, { new: true })
                .exec((error, data) => {
                    if (error) {
                        return res.status(500).json({
                            status: "Internal server error",
                            message: error.message
                        })
                    }

                    return res.status(200).json(data)
                })
        }
        else {
            return res.status(400).json({
                status: "Bad Request",
                message: "Current password is incorrect"
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomerById,
    deleteCustomerById,
    exportCustomer,
    changePassword
}