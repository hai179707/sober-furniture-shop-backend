// Import thư viện mongoose
const mongoose = require("mongoose")

// Tạo Class Schema từ thư viện mongoose
const Schema = mongoose.Schema

// Khởi tạo instance schema từ Class Schema
const OrderModel = new Schema(
    {
        orderCode: {
            type: String,
            required: true,
            unique: true
        },
        customer: {
            type: mongoose.Types.ObjectId,
            ref: 'Customer',
        },
        note: {
            type: String,
        },
        products: {
            type: Array
        },
        cost: {
            type: Number,
            default: 0
        },
        paymentMethod: {
            type: String,
            default: 'cash on delivery'
        },
        status: {
            type: String,
            default: 'open'
        },
        deliveryStatus: {
            type: String,
            default: 'not shipped yet'
        },
        paymentStatus: {
            type: String,
            default: 'unpaid'
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Order", OrderModel)