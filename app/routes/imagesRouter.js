const express = require("express")
const { getImages, addImage, deleteImage, uploadImage } = require("../controllers/imagesController")
const { verify, verifyAdmin } = require("../middlewares/authMiddleware")
const router = express.Router()
const multer = require('multer')

const upload = multer({
    storage: multer.memoryStorage()
})

router.get('/images', verify, verifyAdmin, getImages)

router.post('/images', verify, verifyAdmin, addImage)

router.post('/images/upload', verify, upload.single('uploadImage'), uploadImage)

router.delete('/images/:imageId', verify, verifyAdmin, deleteImage)

module.exports = router