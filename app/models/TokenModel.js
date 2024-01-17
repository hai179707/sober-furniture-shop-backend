const mongoose = require("mongoose")
const Schema = mongoose.Schema
const TokenModel = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'Customer'
        },
        token: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Token", TokenModel)