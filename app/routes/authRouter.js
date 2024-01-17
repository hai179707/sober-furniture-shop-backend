const express = require("express")
const authRouter = express.Router()
const { refreshUser, loginUser, resgisterUser, logoutUser } = require("../controllers/authController")
const { verify } = require("../middlewares/authMiddleware")

authRouter.post('/refresh', refreshUser)

authRouter.post('/login', loginUser)

authRouter.post('/register', resgisterUser)

authRouter.post('/logout', verify, logoutUser)

module.exports = authRouter