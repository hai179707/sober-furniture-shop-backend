const jwt = require('jsonwebtoken')

const verify = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (authHeader) {
        const token = authHeader.split(' ')[1]
        jwt.verify(token, process.env.SECRET_KEY, (error, user) => {
            if (error) {
                return res.status(401).json('Token is not valid!')
            }
            req.user = user
            next()
        })
    }
    else {
        res.status(401).json('You are not authenticated!')
    }
}

const verifyAdmin = (req, res, next) => {
    const user = req.user

    if(user.isAdmin) {
        next()
    }
    else {
        res.status(401).json('You are not authenticated!')
    }
}

const verifyCustomer = (req, res, next) => {
    const customerId = req.params.customerId
    const user = req.user

    if(user.isAdmin || user.id === customerId) {
        next()
    }
    else {
        res.status(401).json('You are not authenticated!')
    }
}

module.exports = {
    verify,
    verifyAdmin,
    verifyCustomer
}