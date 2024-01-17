const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Token = require("../models/TokenModel")
const Customer = require("../models/CustomerModel")

const refreshUser = (req, res) => {
    const refreshToken = req.body.refreshToken

    if (!refreshToken) {
        return res.status(401).json('You are not authenticated!')
    }

    Token.findOneAndDelete({ token: refreshToken }, (err, token) => {
        if (err || !token) {
            return res.status(403).json('Refresh token is not valid!')
        }

        jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (error, data) => {
            if (error) {
                return res.status(500).json({
                    status: "Error 500: Internal server error",
                    message: error.message
                })
            }

            const newAccessToken = jwt.sign({ id: data._id, isAdmin: data.isAdmin }, process.env.SECRET_KEY, { expiresIn: '1d' })
            const newRefreshToken = jwt.sign({ id: data._id, isAdmin: data.isAdmin }, process.env.REFRESH_SECRET_KEY, { expiresIn: '365d' })

            Token.create({
                userId: data.id,
                token: newRefreshToken
            })

            res.status(200).json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            })
        })
    })
}

const loginUser = async (req, res) => {
    try {
        const username = req.body.username
        const password = req.body.password

        const condition = {
            $or: [
                { email: username },
                { phone: username },
                { username: username }
            ]
        }

        const customer = await Customer.findOne(condition, 'password')
        const isPasswordMatch = bcrypt.compareSync(password, customer.password)
        if (isPasswordMatch) {
            const data = await Customer.findOne(condition)
            const accessToken = jwt.sign({ id: data._id, isAdmin: data.isAdmin }, process.env.SECRET_KEY, { expiresIn: '1d' })
            const refreshToken = jwt.sign({ id: data._id, isAdmin: data.isAdmin }, process.env.REFRESH_SECRET_KEY, { expiresIn: '365d' })
            Token.create({
                userId: data._id,
                token: refreshToken
            })
            const { orders, ...other } = data._doc
            res.status(200).json({
                user: other,
                accessToken,
                refreshToken
            })
        }
        else {
            res.status(400).json('Login fail!')
        }
    } catch (error) {
        return res.status(500).json({
            status: "Error 500: Internal server error",
            message: error.message
        })
    }
}

const resgisterUser = async (req, res) => {
    try {
        const { fullName, username, email, password, phone } = req.body
        const hashPassword = bcrypt.hashSync(password, 10)

        const data = await Customer.create({
            username,
            password: hashPassword,
            fullName,
            email,
            phone
        })
        return res.status(201).json(data)

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken

        await Token.findOneAndDelete({ token: refreshToken })
        return res.status(200).json('You logged out successfully!')

    } catch (error) {
        return res.status(500).json({
            status: "Internal server error",
            message: error.message
        })
    }

}

module.exports = {
    refreshUser,
    loginUser,
    resgisterUser,
    logoutUser
}
