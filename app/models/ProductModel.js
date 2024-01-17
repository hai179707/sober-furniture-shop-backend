// Import thư viện mongoose
const mongoose = require("mongoose")

// Tạo Class Schema từ thư viện mongoose
const Schema = mongoose.Schema

// Khởi tạo instance schema từ Class Schema
const ProductModel = new Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        quote: {
            type: String,
            default: ''
        },
        type: {
            type: mongoose.Types.ObjectId,
            ref: 'ProductType'
        },
        images: {
            type: [String],
            required: true
        },
        buyPrice: {
            type: Number,
            required: true
        },
        promotionPrice: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            default: 0
        },
        public: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Product", ProductModel)