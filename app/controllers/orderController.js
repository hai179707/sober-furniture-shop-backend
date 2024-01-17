const mongoose = require("mongoose")

const Order = require("../models/OrderModel")
const Customer = require("../models/CustomerModel")
const Product = require("../models/ProductModel")
const randToken = require('rand-token').generator({
    chars: '0-9'
})
const exceljs = require('exceljs')

const createOrder = async (req, res) => {
    try {
        const body = req.body

        if (!body.fullName) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Full name is required!"
            })
        }
        if (!body.address) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Address is required!"
            })
        }
        if (!body.phone) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Phone is required!"
            })
        }
        if (!body.email) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Email is required!"
            })
        }
        if (!body.products || body.products.some(prod => !mongoose.Types.ObjectId.isValid(prod.product))) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Products is not valid!"
            })
        }
        if (!body.cost) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Cost is required!"
            })
        }

        const customer = await Customer.findOneAndUpdate(
            {
                email: body.email
            },
            {
                fullName: body.fullName,
                address: body.address,
                phone: body.phone,
                city: body.city,
                province: body.province
            },
            {
                new: true,
                upsert: true
            }
        )

        const order = await Order.create(
            {
                orderCode: randToken.generate(6),
                customer: customer._id,
                products: body.products,
                cost: body.cost,
                note: body.note
            }
        )

        await Customer.findByIdAndUpdate(customer._id, { $push: { orders: order._id } })
        for (let i = 0; i < body.products.length; i++) {
            await Product.findByIdAndUpdate(body.products[i].product, { $inc: { amount: -body.products[i].qty } })
        }

        return res.status(201).json(order)

    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

const createOrderOfCustomer = async (req, res) => {
    try {
        const customerId = req.params.customerId
        const body = req.body

        const order = await Order.create(
            {
                orderCode: randToken.generate(6),
                customer: customerId,
                products: body.products,
                cost: body.cost,
                note: body.note,
                status: body.status,
                deliveryStatus: body.deliveryStatus,
                paymentStatus: body.paymentStatus
            }
        )

        await Customer.findByIdAndUpdate(customerId, { $push: { orders: order._id } })
        for (let i = 0; i < body.products.length; i++) {
            await Product.findByIdAndUpdate(body.products[i].product, { $inc: { amount: -body.products[i].qty } })
        }

        return res.status(201).json(order)

    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

const getAllOrdersOfCustomer = async (req, res) => {
    try {
        const customerId = req.params.customerId

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Customer Id is not valid"
            })
        }

        const data = await Customer.findById(customerId).populate({
            path: 'orders',
            populate: {
                path: 'products',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            }
        })
        return res.status(200).json(data.orders)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const getOrderTotal = async (req, res) => {
    try {
        const total = await Order.count()
        const unpaid = await Order.count({ paymentStatus: 'unpaid' })
        const notShippedYet = await Order.count({ deliveryStatus: 'not shipped yet' })
        const delivering = await Order.count({ deliveryStatus: 'delivering' })
        const cancel = await Order.count({ status: 'cancel' })
        const open = await Order.count({ status: 'open' })

        return res.status(200).json({
            total,
            unpaid,
            notShippedYet,
            delivering,
            cancel,
            open
        })

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const getOrderHoursTotal = async (req, res) => {
    try {
        const today = new Date()
        const currentHour = today.getHours()
        const date = req.query.date || today

        const getRes = () => {
            const results = [5, 4, 3, 2, 1, 0].map(num => {
                return Order.count({
                    createdAt: {
                        $gte: new Date(new Date(date).setHours(currentHour - num, 00, 00, 000)).toISOString(),
                        $lt: new Date(new Date(date).setHours(currentHour + 1 - num, 00, 00, 000)).toISOString()
                    }
                })
            })
            return Promise.all(results)
        }

        const data = await getRes()

        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const getOrderLastWeekTotal = async (req, res) => {
    try {
        const getDate = (num = 0) => new Date().setDate(new Date().getDate() - num)

        const getRes = () => {
            const results = [6, 5, 4, 3, 2, 1, 0].map(num => {
                return Order.count({
                    createdAt: {
                        $gte: new Date(new Date(getDate(num)).setHours(00, 00, 00, 000)).toISOString(),
                        $lt: new Date(new Date(getDate(num)).setHours(23, 59, 59, 999)).toISOString()
                    }
                })
            })
            return Promise.all(results)
        }

        const data = await getRes()

        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const getOrderTotalOfCustomer = async (req, res) => {
    try {
        const customerId = req.params.customerId

        const total = await Order.count({ customer: customerId })

        return res.status(200).json(total)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const getAllOrders = async (req, res) => {
    try {
        const date = req.query.date
        const page = req.query.page || 1
        const limit = req.query.limit || 20
        const delivery = req.query.delivery
        const status = req.query.status
        const payment = req.query.payment
        const query = req.query.query
        const startDate = req.query.startDate
        const endDate = req.query.endDate
        const customerId = req.query.customer_id
        const condition = {}

        if (date) condition._id = { $gt: mongoose.Types.ObjectId(Math.floor(new Date(day) / 1000).toString(16) + "0000000000000000") }
        if (delivery) condition.deliveryStatus = delivery
        if (status) condition.status = status
        if (payment) condition.paymentStatus = payment
        if (startDate) condition.createdAt = { $gte: new Date(new Date(startDate).setHours(00, 00, 00, 000)).toISOString() }
        if (endDate) condition.createdAt = { ...condition.createdAt, $lt: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() }
        if (customerId) condition.customer = customerId

        if (query) {
            const customer = await Customer.find({ fullName: { $regex: query, $options: 'i' } })
            condition.$or = [
                { orderCode: { $regex: query, $options: 'i' } },
                { customer: { $in: customer.map(cus => cus._id) } }
            ]
        }
        const total = await Order.count(condition)
        const data = await Order.find(condition).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).populate('customer')

        return res.status(200).json({
            total,
            data
        })

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const getOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId

        const condition = {}

        if (orderId.length === 6) {
            condition.orderCode = orderId
        }
        else {
            condition._id = orderId
        }

        const order = await Order.findOne(condition)
            .populate([{
                path: 'customer'
            },
            {
                path: 'products',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            }])

        return res.status(200).json(order)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId
        const { products, customer, note, cost, paymentMethod, status, deliveryStatus, paymentStatus } = req.body

        const update = {}

        if (products) update.products = products
        if (customer) update.customer = customer
        if (note) update.note = note
        if (cost) update.cost = cost
        if (paymentMethod) update.paymentMethod = paymentMethod
        if (status) update.status = status
        if (deliveryStatus) update.deliveryStatus = deliveryStatus
        if (paymentStatus) update.paymentStatus = paymentStatus

        const order = await Order.findByIdAndUpdate(orderId, update, { new: true })
            .populate([{
                path: 'customer'
            },
            {
                path: 'products',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            }])

        if (order) {
            return res.status(200).json(order)
        }
        else {
            return res.status(500).json({
                status: "Internal server error",
                message: error.message
            })
        }


    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId

        const order = await Order.findById(orderId)
        if (order.status === 'confirmed' || order.status === 'success') {
            return res.status(400).json(`You can not delete ${order.status} order!`)
        }
        else {
            await Order.findByIdAndDelete(orderId)
            await Customer.findOneAndUpdate({ orders: orderId }, { $pull: { orders: orderId } })
            return res.status(200).json('Delete order successfully!')
        }

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const exportOrders = async (req, res) => {
    try {
        const delivery = req.query.delivery
        const status = req.query.status
        const payment = req.query.payment
        const query = req.query.query
        const startDate = req.query.startDate
        const endDate = req.query.endDate
        const customerId = req.query.customer_id
        const condition = {}

        if (delivery) condition.deliveryStatus = delivery
        if (status) condition.status = status
        if (payment) condition.paymentStatus = payment
        if (startDate) condition.createdAt = { $gte: new Date(new Date(startDate).setHours(00, 00, 00, 000)).toISOString() }
        if (endDate) condition.createdAt = { ...condition.createdAt, $lt: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() }
        if (customerId) condition.customer = customerId

        if (query) {
            if (+query) condition.orderCode = { $regex: query, $options: 'i' }
            else {
                const customer = await Customer.find({ fullName: { $regex: query, $options: 'i' } })
                condition.customer = { $in: customer.map(cus => cus._id) }
            }
        }

        const orders = await Order.find(condition).sort({ createdAt: -1 })

        const workbook = new exceljs.Workbook()
        const worksheet = workbook.addWorksheet('Orders')
        worksheet.columns = [
            { header: 'No.', key: 'no' },
            { header: 'Order code', key: 'orderCode' },
            { header: 'Customer', key: 'customer' },
            { header: 'Cost', key: 'cost' },
            { header: 'Products', key: 'products' },
            { header: 'Status', key: 'status' },
            { header: 'Payment method', key: 'paymentMethod' },
            { header: 'Delivery status', key: 'deliveryStatus' },
            { header: 'Payment status', key: 'paymentStatus' },
            { header: 'Note', key: 'note' },
            { header: 'Date', key: 'createdAt' },
        ]

        orders.forEach((order, index) => {
            order.no = index + 1
            worksheet.addRow(order)
        })
        worksheet.getRow(1).eachCell(cell => cell.font = { bold: true })

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheatml.sheet'
        )

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=orders.xlsx'
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


module.exports = {
    createOrder,
    createOrderOfCustomer,
    getAllOrdersOfCustomer,
    getOrderTotal,
    getOrderHoursTotal,
    getOrderLastWeekTotal,
    getOrderTotalOfCustomer,
    getAllOrders,
    getOrder,
    updateOrder,
    deleteOrder,
    exportOrders
}