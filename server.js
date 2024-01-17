// Khai báo thư viên Express
const express = require("express")
const cors = require('cors')
require('dotenv').config()

// Khai báo thư viện Mongoose
const mongoose = require("mongoose")

// Router
const productTypeRouter = require('./app/routes/productTypeRouter')
const productRouter = require('./app/routes/productRouter')
const customerRouter = require('./app/routes/customerRouter')
const orderRouter = require('./app/routes/orderRouter')
const imagesRouter = require('./app/routes/imagesRouter')
const postPostRouter = require('./app/routes/blogPostRouter')
const marketingEmailRouter = require('./app/routes/marketingEmailRouter')
const authRouter = require('./app/routes/authRouter')

// Khởi tạo app express
const app = express()

// Khai báo cổng chạy app 
const port = process.env.PORT || 8000

// Cấu hình request đọc được body json
app.use(express.json())
app.use(cors())

// App sử dụng router
app.use('/api', productTypeRouter)
app.use('/api', productRouter)
app.use('/api', customerRouter)
app.use('/api', orderRouter)
app.use('/api', imagesRouter)
app.use('/api', postPostRouter)
app.use('/api', marketingEmailRouter)
app.use('/api', authRouter)

app.get("/", (req, res) => {
    res.json({
        message: 'Devcamp shop24h backend'
    })
})

mongoose.connect(process.env.MONGODB_URI, (error) => {
    if (error) throw error
    console.log("Connect MongoDB successfully!")
})

app.listen(port, () => {
    console.log(`App Listening on port ${port}`);
})