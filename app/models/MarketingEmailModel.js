const mongoose = require("mongoose")
const Schema = mongoose.Schema
const MarketingEmailModel = new Schema(
    {
        email: {
            required: true,
            type: String,
            unique: true
        },
        hasAccount: {
            required: true,
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("MarketingEmail", MarketingEmailModel)