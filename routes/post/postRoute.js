const express = require('express')
const router = express.Router()
const postService = require('./postService')
const authenticationService = require('../authentication/authenticationService')

router.get('/all', async (req, res) => {
    try {
        const posts = await postService.getAllPost()
        console.log("posts have been requested")
        res.json(posts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/:idpost', postService.getPost, (req, res) => {
    res.send(res.post)
})

router.get('/author/:author', authenticationService.authenticateToken, async (req, res) => {
    try {
        const posts = await postService.listAuthorPost(req, res)
        res.json(posts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.patch('/:idpost', authenticationService.authenticateToken, postService.getPost, async (req, res) => {
    try {
        const updatedPost = await postService.updatePost(req, res)
        res.json(updatedPost)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.delete('/:idpost', authenticationService.authenticateToken, postService.getPost, async (req, res) => {
    try {
        postService.deletePost(res)
        res.json({ message: 'Deleted post' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/:idpost/comments', authenticationService.authenticateToken, postService.getPost, async (req, res) => {
    try {
        postService.addComment(req, res)
        res.json({ message: 'Comment has been added successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete('/:idpost/comments/:idcomment', authenticationService.authenticateToken, postService.getPost, async (req, res) => {
    try {
        postService.deleteComment(req, res)
        res.json({ message: 'Comment has been deleted successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/register', authenticationService.authenticateToken,async (req, res) => {
    try {
        console.log("a new post request has been requested")
        let newPost = await postService.registerPost(req)
        res.status(201).json(newPost)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

module.exports = router