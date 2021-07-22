const express = require('express')
const app = express()
const userService = require('./routes/user/userService')

const userRouter = require('./routes/user/userRoute')
const postRouter = require('./routes/post/postRoute')
const authenticationRouter = require('./routes/authentication/authenticationRoute')
const groupRouter = require('./routes/group/groupRoute')
const db = require('./db/db')
app.use(express.json())
const https = require('https');
const fs = require('fs');

const key = fs.readFileSync('./certs/key.pem');
const cert = fs.readFileSync('./certs/cert.pem');

var cors = require('cors')


db.initDb(function(err,db){
    if(db)
        console.log("initStep: Erfolgreich mit Datenbank verbunden")
    else
        console.log("Error: Verbindung mit Datenbank gescheitert")
})

app.use(cors())


userService.initAdministrator()
app.use('/authenticate', authenticationRouter)
app.use('/post', postRouter)
app.use('/user', userRouter)
app.use('/group', groupRouter)



/* Error Handler */
app.use(function (err, req, res, next){
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.use(function (req, res, next){
    res.status(404).send('This Url is not supported!')
})

const server = https.createServer({key: key, cert: cert }, app);
server.listen(8080, () => { console.log('listening on 8080') });