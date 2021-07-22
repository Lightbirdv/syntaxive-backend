const express = require('express')
const router = express.Router()
const userService = require('./userService')
const authenticationService = require('../authentication/authenticationService')

router.get('/all', authenticationService.authenticateToken, async (req, res) => {
    try {
        const users = await userService.getAllUser()
        res.json(users)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/:id', authenticationService.authenticateToken, userService.getUser, (req, res) => {
    res.send(res.user)
})

router.get('/find/:username', authenticationService.authenticateToken, userService.getUserByUsername, (req, res) => {
    res.send(res.user)
})

router.get('/admin/isadmin', authenticationService.authenticateToken, userService.isAdmin, (req,res) => {
    try {
        res.status(200).json({message: 'admin'})
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.patch('/:id', authenticationService.authenticateToken, userService.isAdmin, userService.getUser, async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req, res)
        res.json(updatedUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.delete('/:id', authenticationService.authenticateToken, userService.isAdmin, userService.getUser, async (req, res) => {
    try {
        console.log("user deletion has been requested")
        userService.deleteUser(res)
        res.json({ message: 'Deleted user' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/register', async (req, res) => {
    try {
        console.log("new user registration has been requested")
        let newUser = await userService.registerUser(req)
        res.status(201).json(newUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// routes for forgotten password

router.post('/forgot', async (req, res) => {
    try {
        userService.forgotPassword(req)
        res.json({ message: 'Email successfully send' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.post('/passwordReset/:hash', async (req, res) => {
    try {
        userService.changePassword(req, res)
        res.json({ message: 'Password successfully changed' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

module.exports = router