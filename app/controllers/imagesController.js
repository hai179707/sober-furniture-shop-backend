const Images = require("../models/ImagesModel")
const bucket = require('../firebase/firebase')

const getImages = async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 20
        const query = req.query.query

        const condition = {}

        if (query) {
            condition.name = { $regex: query, $options: 'i' }
        }

        const total = await Images.count(condition)
        const data = await Images.find(condition).sort({ updatedAt: -1 }).limit(limit).skip((page - 1) * limit)

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

const addImage = async (req, res) => {
    try {
        const { url, name, media } = req.body

        if (!url) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Url is required!"
            })
        }

        if (!name) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Name is required!"
            })
        }

        if (!media) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Media is required!"
            })
        }

        const newImage = await Images.findOneAndUpdate({
            url
        },
            {
                name,
                media
            },
            {
                new: true,
                upsert: true
            })

        return res.status(201).json(newImage)

    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

const deleteImage = async (req, res) => {
    try {
        const imageId = req.params.imageId
        await Images.findByIdAndDelete(imageId)

        return res.status(200).json('Delete image successfully!')
    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("Error: No files found")
        }

        const blob = bucket.file('shop24h/' + req.file.originalname)

        const blobWriter = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        })

        blobWriter.on('error', (err) => {
            console.log(err)
        })

        blobWriter.on('finish', async () => {
            res.status(200).json("Uploaded")
        })

        blobWriter.end(req.file.buffer)
    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

module.exports = {
    getImages,
    addImage,
    deleteImage,
    uploadImage
}