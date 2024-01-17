const mongoose = require("mongoose")
const Schema = mongoose.Schema
const BlogPostModel = new Schema(
    {
        title: {
            required: true,
            type: String
        },
        content: {
            type: String,
            required: true
        },
        excerpt: {
            type: String,
            default: ''
        },
        author: {
            type: mongoose.Types.ObjectId,
            ref: 'Customer',
        },
        public: {
            type: Boolean,
            default: false
        },
        featuredImage: {
            type: String,
            required: true
        },
        path: {
            required: true,
            type: String,
            unique: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("BlogPost", BlogPostModel)