const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ImagesModel = new Schema(
    {
        url: {
            required: true,
            type: String,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        media: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Images", ImagesModel)