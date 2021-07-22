const express = require('express')
const router = express.Router()
const groupService = require('./groupService')
const userService = require('../user/userService')
const authenticationService = require('../authentication/authenticationService')

router.get('/all', authenticationService.authenticateToken, async (req, res) => {
    try {
        const groups = await groupService.getAllGroup()
        res.json(groups)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/:id', authenticationService.authenticateToken, groupService.getGroup, (req, res) => {
    res.send(res.group)
})

router.get('/:id/posts', authenticationService.authenticateToken, groupService.getGroup, async (req, res) => {
    try {
        const posts = await groupService.listPosts(req, res)
        res.json(posts)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.patch('/:id', userService.isAdmin, groupService.getGroup, async (req, res) => {
    try {
        const updatedGroup = await groupService.updateGroup(req, res)
        res.json(updatedGroup)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.delete('/:id', userService.isAdmin, groupService.getGroup, async (req, res) => {
    try {
        groupService.deleteGroup(res)
        res.json({ message: 'Deleted group' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/register', authenticationService.authenticateToken, async (req, res) => {
    try {
        let newGroup = await groupService.registerGroup(req)
        res.status(201).json(newGroup)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

module.exports = router