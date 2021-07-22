require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('./userModel')
const jwt = require('jsonwebtoken')
const crypto = require("crypto");
const config = require('../../config/default.json');
const nodemailer = require('nodemailer')

async function getAllUser() {
    const users = await User.find()
    return users
}

async function updateUser(req, res) {
    if (req.body.username != null) {
        res.user.username = req.body.username
    }
    if (req.body.preference != null) {
        res.user.preference = req.body.preference
    }
    const updatedUser = await res.user.save()
    return updatedUser
}

async function deleteUser(res) {
    await res.user.remove()
}

async function registerUser(req) {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        preference: req.body.preference
    })
    const newUser = await user.save()
    return newUser
}


async function getUser(req, res, next) {
    let user
    try {
        user = await User.findById(req.params.id)
        if (user == null) {
            return res.status(404).json ({ message : 'Cannot find user'})
        }
    } catch (err) {
        return res.status(500).json ({ message : err.message })
    }

    res.user = user
    next()
}

async function getUserByUsername(req, res, next) {
    let user
    try {
        user = await User.findOne({username: req.params.username})
        if (user == null) {
            return res.status(404).json ({ message : 'Cannot find user'})
        }
    } catch (err) {
        return res.status(500).json ({ message : err.message })
    }

    res.user = user
    next()
}

async function getUserByName(username, res, next) {
    let user
    try {
        user = await User.findOne({username: username})
        if (user == null) {
            return res.status(404).json ({ message : 'Cannot find user'})
        }
    } catch (err) {
        return res.status(500).json ({ message : err.message })
    }

    return user
}

async function initAdministrator() {
    User.countDocuments({isAdministrator: true}, function(err,result) {
        if(result == 0) {
            console.log('initStep There is no admin account yet. Create it with default password')
            const admin = new User({
            username: "admin",
            password: "123",
            email: "adminpseudomail@mail.de",
            isAdministrator: true
            })
            admin.save(function(err) {
                if(err) {
                    console.log("Could not create default admin account: " + err)
                }
            })
        }
        else {
            console.log('initStep: There already is an admin account.')
        }
    });
}

async function isAdmin(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err,user) => {
        if (err) return res.sendStatus(403)
        try {
            const newUser = await getUserByName(user.user, res)
            console.log(newUser)
            if(newUser.isAdministrator == true){
                next()
            } else {
                return res.status(500).send ({ message : 'This function is only available for admins' })
            }
        } catch (err) {
            res.status(500).send({message: 'The check for admin was not successful ' + err.message})
            res.end()
        }
    })
}

// forgotten password functions

async function forgotPassword(req) {
    const user = await User.findOne({email: req.body.email})
    console.log(user)
    let resetToken = crypto.randomBytes(20).toString("hex")
    user.forgotToken = resetToken
    user.forgotExpires = Date.now() + 3600000;
    user.save()
    const link = config.baseurl + '/user/passwordReset/' + resetToken
    console.log(link)
    sendEmail(link,user.email,user.username)
}

async function changePassword(req, res) {
    User.findOne({ forgotToken: req.params.hash, forgotExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return res.status(500).send ({ message : 'The Token is expired or wrong' })
        }

        user.password = req.body.password;
        user.forgotToken = undefined;
        user.forgotExpires = undefined;

        user.save()
    })
}

function sendEmail(link, email, username) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAILPASSWORD
        }
      });
      console.log(process.env.EMAIL)
      console.log(process.env.EMAILPASSWORD)
      console.log(email)
      const Text = 'Hello ' + username + ',\nYou are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      'Please click on the following link, or paste this into your browser to complete the process:\n\n' + link +
      'If you did not request this, please ignore this email and your password will remain unchanged.\n'

      var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'You forgot your password',
        text: Text
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}



module.exports = {
    getUser,
    deleteUser,
    registerUser,
    updateUser,
    getAllUser,
    initAdministrator,
    getUserByName,
    getUserByUsername,
    isAdmin,
    forgotPassword,
    changePassword
}