require('dotenv').config()
const userService = require('../user/userService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../user/userModel')

async function createSessionToken(req, res) {

    if(!req.body) {
        console.log("Error not json body found")
        res("JSON-Body missing", null, null);
        return
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const user = await userService.getUserByName(username, res)
    console.log(user)
    const passworduser = user.password
    if(!user) {
        res.status(500).json({message: 'No user found error'})
    }
    try {
        if(await bcrypt.compare(password, passworduser)) {
            console.log('Password found. Creating Token')
            const issuedAt = new Date().getTime()
            const expirationTime = process.env.TIMEOUT
            const expiresAt = issuedAt + (expirationTime * 1000)
            let accessToken = jwt.sign({ 'user': username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiresAt, algorithm: 'HS256'})
            let refreshToken = jwt.sign({ 'user': username }, process.env.REFRESH_TOKEN_SECRET)
            console.log(accessToken, refreshToken)
            user.refreshToken = refreshToken
            const newUser = await user.save()
            console.log(newUser)
            // console.log('Token created: ' + token)
            return accessToken;
        } else {
            return null
        }
    } catch (err) {
        res.status(500).json({message:'the comparison of passwords failed error: ' + err.message})
    }
}


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

function checkHeaderforToken(req, res, next) {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        return res.json({ message: 'Missing Authorization Header Gib die daten' });
    } else {
        next()
    }
}

async function deleteRefreshToken(req, res) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err,user) => {
        if (err) return res.sendStatus(403)
        try {
            const newUser = await userService.getUserByName(user.user, res)
            console.log(newUser)
            newUser.refreshToken = ''
            const u = await newUser.save()
            return u
        } catch (err) {
            res.status(500).send({message: 'The new user could not be saved'})
        }
    })
}

async function refreshTheToken(req, res) {
    user = await User.findOne({username: req.user.user})
    console.log(user)
    accessToken = jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return null
        const issuedAt = new Date().getTime()
        const expirationTime = process.env.TIMEOUT
        const expiresAt = issuedAt + (expirationTime * 1000)
        const accessToken = jwt.sign({ 'user': user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiresAt, algorithm: 'HS256'})
        return accessToken
    })
    return accessToken
}

function generateBasicToken(req, res) {
    const { username, password } = req.body
    const decodedString = username + ':' + password
    const encodedString = Buffer.from(decodedString).toString('base64')
    return encodedString
}

module.exports = {
    refreshTheToken,
    authenticateToken,
    createSessionToken,
    generateBasicToken,
    checkHeaderforToken,
    deleteRefreshToken
}