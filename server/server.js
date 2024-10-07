require('dotenv').config()

const express = require('express')
const userRoutes = require('./routes/userRoute')
const stockRoutes = require('./routes/stockRoute')

const mongoose = require('mongoose')
const app = express()

app.use(express.json())

app.use((req,res,next) => {
    console.log(req.path, req.method)
    next()
})

app.use('/api/users/',userRoutes)
app.use('/api/stocks/', stockRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to database')
    })
    .catch(() => {
        console.log('Connection failed')
    })
app.listen(process.env.PORT, () => {
    console.log('Server is running on port ', process.env.PORT)
});