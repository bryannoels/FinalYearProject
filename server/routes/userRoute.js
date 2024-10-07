const express = require('express')
const router = express.Router()
const User = require('../models/userModel')

router.get('/', () => {})
router.post('/', async (req,res) => {
    const {username, email, password} = req.body
    try{
        const user = await User.create({
            username,
            email,
            password,
            portfolio: []
        })
        res.status(201).json(user)
    }
    catch(err){
        res.status(400).json(err)
    }
})
module.exports = router