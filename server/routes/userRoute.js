const express = require('express')
const router = express.Router()
const User = require('../models/userModel')

router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post('/', async (req, res) => {
    const { username, email, password } = req.body
    try {
        const user = await User.create({
            username,
            email,
            password,
            portfolio: []
        })
        res.status(201).json(user)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = router
