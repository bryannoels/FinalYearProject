require('dotenv').config()

const express = require('express')
const usersRoutes = require('./routes/users')

const mongoose = require('mongoose')
const app = express()


app.use((req,res,next) => {
    console.log(req.path, req.method)
    next()
})

app.use('api/users/',usersRoutes)

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