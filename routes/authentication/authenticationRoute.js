const express = require('express');
const router = express.Router();
const userService = require('../user/userService');
const authenticationService = require('./authenticationService')

router.post('/loginBasic',authenticationService.checkHeaderforToken,async function(req, res, next) {

    console.log('Trying to create token')
    const token = await authenticationService.createSessionToken(req, res)
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    const issuedDate = new Date().toLocaleTimeString()
    const subset = { username, token, issuedDate}
    res.send(subset)
})

router.delete('/logout', authenticationService.authenticateToken, (req, res) => {
    const user = authenticationService.deleteRefreshToken(req, res)
    if(!user) {
        res.status(501).send({ message: 'There has been an error by deleting the refresh Token'})
    }
    res.status(201).send({ message: 'You have been successfully logged out!'})
})

router.post('/token', authenticationService.authenticateToken, async (req, res) =>{
    let newAccessToken = await authenticationService.refreshTheToken(req, res)
    if(newAccessToken == null){
        return res.sendStatus(401)
    }
    res.json('refreshedToken: Bearer ' + newAccessToken)
})

router.post('/tokenBasic' ,(req, res) =>{
    const encodedString = authenticationService.generateBasicToken(req, res)
    if (encodedString == null) {
        return res.sendStatus(401)
    }
    res.json('Basic ' + encodedString)
})
module.exports = router