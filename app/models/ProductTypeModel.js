// Import thư viện mongoose
const mongoose = require("mongoose")

// Tạo Class Schema từ thư viện mongoose
const Schema = mongoose.Schema

// Khởi tạo instance schema từ Class Schema
const ProductTypeSchema = new Schema({
        name: {
            type: String,
            unique: true,
            required: true
        },
        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("ProductType", ProductTypeSchema)