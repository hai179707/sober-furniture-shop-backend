// Import thư viện mongoose
const mongoose = require("mongoose")

// Tạo Class Schema từ thư viện mongoose
const Schema = mongoose.Schema

// Khởi tạo instance schema từ Class Schema
const CustomerModel = new Schema(
    {
        username: {
            type: String,
            unique: true
        },
        password: {
            type: String,
            select: false
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        displayName: {
            type: String,
            required: true,
            default: 'Unknown'
        },
        photoURL: {
            type: String,
            required: true,
            default: 'https://firebasestorage.googleapis.com/v0/b/devcamp-shop-24h-19469.appspot.com/o/files%2Fdefault-avatar.png?alt=media&token=2cb04386-712f-4fe8-a41a-ae4c917a4bab'
        },
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        address: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        province: {
            type: String,
            default: ''
        },
        orders: [{
            type: mongoose.Types.ObjectId,
            ref: 'Order'
        }],
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Customer", CustomerModel)