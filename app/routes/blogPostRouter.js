const express = require("express")
const { getBlogPosts, getBlogPost, addBlogPost, updateBlogPost, deleteBlogPost, getPublicBlogPosts, getPublicBlogPost } = require("../controllers/blogPostController")
const { verify, verifyAdmin } = require("../middlewares/authMiddleware")
const router = express.Router()


router.get('/blogs', verify, verifyAdmin, getBlogPosts)

router.get('/blogs/public', getPublicBlogPosts)

router.get('/blogs/:blogPostId', verify, verifyAdmin, getBlogPost)

router.get('/blogs/public/:blogPostId', getPublicBlogPost)

router.post('/blogs', verify, verifyAdmin, addBlogPost)

router.put('/blogs/:blogPostId', verify, verifyAdmin, updateBlogPost)

router.delete('/blogs/:blogPostId', verify, verifyAdmin, deleteBlogPost)

module.exports = router