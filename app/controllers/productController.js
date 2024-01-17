const mongoose = require("mongoose")
const Product = require("../models/ProductModel")
const ProductType = require("../models/ProductTypeModel")
const exceljs = require('exceljs')

const getTotal = async (req, res) => {
    try {
        const total = await Product.count({ public: true })
        const minPrice = await Product.findOne({ public: true }).sort({ promotionPrice: 1 }).limit(1)
        const maxPrice = await Product.findOne({ public: true }).sort({ promotionPrice: -1 }).limit(1)

        await res.status(200).json({
            total,
            maxPrice: maxPrice.promotionPrice,
            minPrice: minPrice.promotionPrice
        })
    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Create product
const createProduct = async (req, res) => {
    try {
        const body = req.body

        if (!body.name || !body.name.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Name is not valid"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(body.type)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Product id is not valid"
            })
        }

        if (!body.images || !body.images.length) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Images is not valid"
            })
        }

        if (!Number.isInteger(+body.buyPrice)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Buy price is not valid"
            })
        }

        if (!Number.isInteger(+body.promotionPrice) || +body.promotionPrice > +body.buyPrice) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Promotion price is not valid"
            })
        }

        const newProduct = {
            _id: mongoose.Types.ObjectId(),
            name: body.name,
            description: body.description || '',
            quote: body.quote || '',
            type: body.type,
            images: body.images,
            buyPrice: body.buyPrice,
            promotionPrice: body.promotionPrice,
            amount: body.amount,
            public: typeof (body.public) === 'boolean' ? body.public : true
        }

        const data = await Product.create(newProduct)
        return res.status(201).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const limit = req.query.limit || 20
        const page = req.query.page || 1
        const maxPrice = req.query.max_price
        const minPrice = req.query.min_price
        const name = req.query.name
        const type = req.query.type
        const visibility = req.query.visibility

        const condition = {}

        if (maxPrice) {
            condition.promotionPrice = {
                ...condition.promotionPrice,
                $lte: maxPrice
            }
        }

        if (minPrice) {
            condition.promotionPrice = {
                ...condition.promotionPrice,
                $gte: minPrice
            }
        }

        if (name) condition.name = { $regex: name, $options: 'i' }

        if (type) {
            const data = await ProductType.findOne({ name: type })
            condition.type = data._id
        }

        if (visibility) {
            if (visibility === 'visible') condition.public = true
            if (visibility === 'hidden') condition.public = false
        }

        const total = await Product.count(condition)

        const data = await Product.find(condition).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).populate('type')

        return res.status(200).json({
            data,
            total
        })
    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Get all public products
const getAllPublicProducts = async (req, res) => {
    try {
        const limit = req.query.limit || 20
        const page = req.query.page || 1
        const maxPrice = req.query.max_price
        const minPrice = req.query.min_price
        const name = req.query.name
        const type = req.query.type

        const condition = {
            public: true
        }

        if (maxPrice) {
            condition.promotionPrice = {
                ...condition.promotionPrice,
                $lte: maxPrice
            }
        }

        if (minPrice) {
            condition.promotionPrice = {
                ...condition.promotionPrice,
                $gte: minPrice
            }
        }

        if (name) condition.name = { $regex: name, $options: 'i' }

        if (type) {
            const data = await ProductType.findOne({ name: type })
            condition.type = data._id
        }

        const total = await Product.count(condition)

        const data = await Product.find(condition).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).populate('type')

        return res.status(200).json({
            data,
            total
        })

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Get product by id
const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Product id is not valid"
            })
        }

        const data = await Product.findById(productId).populate('type')

        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Get public product by id
const getPublicProductById = async (req, res) => {
    try {
        const productId = req.params.productId

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Product id is not valid"
            })
        }

        const data = await Product.findOne({ _id: productId, public: true }).populate('type')

        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Get product by id
const getRelatedProducts = async (req, res) => {
    try {
        const productId = req.params.productId

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Product id is not valid"
            })
        }

        const product = await Product.findById(productId)
        const related = await Product.find({ type: product.type, _id: { $ne: product._id }, public: true }).sort({ updatedAt: 'asc' }).limit(4)

        return res.status(200).json(related)
    }
    catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

// Update product by id
const updateProductById = async (req, res) => {
    try {
        const productId = req.params.productId
        const body = req.body

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Product id is not valid"
            })
        }

        if (body.name && !body.name.trim()) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Name is not valid"
            })
        }

        if (body.type && !mongoose.Types.ObjectId.isValid(body.type)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Type is not valid"
            })
        }

        if (body.images && !body.images.length) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Image url is not valid"
            })
        }

        if (body.buyPrice && !Number.isInteger(+body.buyPrice)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Buy price is not valid"
            })
        }

        if (body.promotionPrice && !Number.isInteger(+body.promotionPrice)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Promotion price is not valid"
            })
        }

        const newProduct = {}

        if (body.name) newProduct.name = body.name
        if (body.description) newProduct.description = body.description
        if (body.quote) newProduct.quote = body.quote
        if (body.type) newProduct.type = body.type
        if (body.images) newProduct.images = body.images
        if (body.buyPrice) newProduct.buyPrice = body.buyPrice
        if (body.promotionPrice) newProduct.promotionPrice = body.promotionPrice
        if (body.amount) newProduct.amount = body.amount
        if (typeof (body.public === 'boolean')) newProduct.public = body.public

        const data = await Product.findByIdAndUpdate(productId, newProduct, { new: true }).populate('type')
        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const exportProducts = async (req, res) => {
    try {
        const query = req.query.query

        const condition = {}
        if (query) condition.name = { $regex: query, $options: 'i' }

        const products = await Product.find(condition)

        const workbook = new exceljs.Workbook()
        const worksheet = workbook.addWorksheet('Products')
        worksheet.columns = [
            { header: 'No.', key: 'no' },
            { header: 'Name', key: 'name' },
            { header: 'Description', key: 'description' },
            { header: 'Quote', key: 'quote' },
            { header: 'Type', key: 'type' },
            { header: 'Buy price', key: 'buyPrice' },
            { header: 'Promotion price', key: 'promotionPrice' },
            { header: 'Amount', key: 'amount' },
            { header: 'Images', key: 'images' },
            { header: 'Public', key: 'public' },
            { header: 'Created date', key: 'createdAt' },
        ]

        products.forEach((product, index) => {
            product.no = index + 1
            worksheet.addRow(product)
        })
        
        worksheet.getRow(1).eachCell(cell => cell.font = { bold: true })

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheatml.sheet'
        )

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=products.xlsx'
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
    createProduct,
    getAllProducts,
    exportProducts,
    getTotal,
    getProductById,
    getRelatedProducts,
    updateProductById,
    getAllPublicProducts,
    getPublicProductById
}