var mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
  username: {
      type: String,
      required: true,
      unqiue: true
  },
  password: {
      type: String,
      required: true
  },
  email: {
    type: String,
    required: true,
    unqiue: true
  },
  paypal: {
    type: String,
  },
  preference: String,
  refreshToken: String,
  forgotToken: String,
  forgotExpires: Date,
  isAdministrator: { 
      type: Boolean, 
      default: false
  }
}, 
{collection: 'users'},
{timestamps: true});

UserSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next()
    };
    bcrypt.hash(user.password,10).then((hashedPassword) => {
        user.password = hashedPassword;
        next();
    })
},  function (err) {
        next(err)
})
    

module.exports = mongoose.model('User', UserSchema);