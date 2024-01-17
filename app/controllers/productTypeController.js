// Import thư viện Mongoose
const mongoose = require("mongoose")

// Import Model
const ProductType = require("../models/ProductTypeModel")

// Create product type
const createProductType = async (req, res) => {
    try {
        // B1: Chuẩn bị dữ liệu
        const body = req.body

        // B2: Validate dữ liệu
        if (!body.name) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Name is not valid"
            })
        }

        // B3: Gọi Model tạo dữ liệu
        const newProductType = {
            _id: mongoose.Types.ObjectId(),
            name: body.name,
            description: body.description || ''
        }

        const data = await ProductType.create(newProductType)

        return res.status(201).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Get all product types
const getAllProductTypes = async (req, res) => {
    try {
        const data = await ProductType.find()

        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Get product type by id
const getProductTypeById = async (req, res) => {
    try {
        const productTypeId = req.params.productTypeId

        if (!mongoose.Types.ObjectId.isValid(productTypeId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Product type id is not valid"
            })
        }

        const data = await ProductType.findById(productTypeId)
        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Update product type by id
const updateProductTypeById = async (req, res) => {
    try {
        const productTypeId = req.params.productTypeId
        const body = req.body

        if (!mongoose.Types.ObjectId.isValid(productTypeId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Product type id is not valid"
            })
        }

        if (!body.name || !body.name.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Name is not valid"
            })
        }

        const newProductType = {}

        if (body.name) newProductType.name = body.name
        if (body.description) newProductType.description = body.description

        const data = await ProductType.findByIdAndUpdate(productTypeId, newProductType)
        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Delete product type by id
const deleteProductTypeById = async (req, res) => {
    try {
        const productTypeId = req.params.productTypeId

        if (!mongoose.Types.ObjectId.isValid(productTypeId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Product type id is not valid"
            })
        }

        await ProductType.findByIdAndDelete(productTypeId)
        return res.status(200).json({
            status: "Delete a product type successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

module.exports = {
    createProductType,
    getAllProductTypes,
    getProductTypeById,
    updateProductTypeById,
    deleteProductTypeById
}