const BlogPost = require("../models/BlogPostModel")
const mongoose = require("mongoose")

const getBlogPosts = async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 20
        const query = req.query.query
        const visibility = req.query.visibility

        const condition = {}

        if (query) {
            condition.title = { $regex: query, $options: 'i' }
        }

        if (visibility) {
            if (visibility === 'visible') condition.public = true
            if (visibility === 'hidden') condition.public = false
        }

        const total = await BlogPost.count(condition)
        const data = await BlogPost.find(condition).sort({ updatedAt: -1 }).limit(limit).skip((page - 1) * limit).populate('author')

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

const getPublicBlogPosts = async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 20
        const query = req.query.query

        const condition = {
            public: true
        }

        if (query) {
            condition.title = { $regex: query, $options: 'i' }
        }

        const total = await BlogPost.count(condition)
        const data = await BlogPost.find(condition).sort({ updatedAt: -1 }).limit(limit).skip((page - 1) * limit).populate('author')

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

const getBlogPost = async (req, res) => {
    try {
        const blogPostId = req.params.blogPostId

        const condition = {}

        if (mongoose.Types.ObjectId.isValid(blogPostId)) {
            condition._id = blogPostId
        }
        else {
            condition.path = blogPostId
        }

        const data = await BlogPost.findOne(condition).populate('author')

        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

const getPublicBlogPost = async (req, res) => {
    try {
        const blogPostId = req.params.blogPostId

        const condition = {
            public: true
        }

        if (mongoose.Types.ObjectId.isValid(blogPostId)) {
            condition._id = blogPostId
        }
        else {
            condition.path = blogPostId
        }

        const data = await BlogPost.findOne(condition).populate('author')

        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

const updateBlogPost = async (req, res) => {
    try {
        const blogPostId = req.params.blogPostId
        const body = req.body

        const condition = {}

        if (mongoose.Types.ObjectId.isValid(blogPostId)) {
            condition._id = blogPostId
        }
        else {
            condition.path = blogPostId
        }

        const newBlogPost = {}

        if (body.title) newBlogPost.title = body.title
        if (body.content) newBlogPost.content = body.content
        if (body.excerpt) newBlogPost.excerpt = body.excerpt
        if (body.public !== undefined) newBlogPost.public = body.public
        if (body.author) newBlogPost.author = body.author
        if (body.featuredImage) newBlogPost.featuredImage = body.featuredImage
        if (body.path) newBlogPost.path = body.path

        const data = await BlogPost.findOneAndUpdate(condition, newBlogPost, { new: true }).populate('author')

        return res.status(200).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

const addBlogPost = async (req, res) => {
    try {
        const body = req.body

        if (!body.title) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Title is required!"
            })
        }

        if (!body.content) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Content is required!"
            })
        }

        if (!body.author || !mongoose.Types.ObjectId.isValid(body.author)) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Author is required!"
            })
        }

        if (!body.featuredImage) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Featured image is required!"
            })
        }

        if (!body.path) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Path is required!"
            })
        }

        const newBlogPost = await BlogPost.create({
            title: body.title,
            content: body.content,
            excerpt: body.excerpt,
            author: body.author,
            public: body.public,
            featuredImage: body.featuredImage,
            path: body.path,
        })

        return res.status(201).json(newBlogPost)
    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

const deleteBlogPost = async (req, res) => {
    try {
        const blogPostId = req.params.blogPostId

        const condition = {}

        if (mongoose.Types.ObjectId.isValid(blogPostId)) {
            condition._id = blogPostId
        }
        else {
            condition.path = blogPostId
        }

        const data = await BlogPost.findOneAndDelete(condition)

        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error
        })
    }
}

module.exports = {
    getBlogPosts,
    getBlogPost,
    updateBlogPost,
    addBlogPost,
    deleteBlogPost,
    getPublicBlogPosts,
    getPublicBlogPost
}