var mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var GroupSchema = new mongoose.Schema({
  parameter: {
      type: String,
      required: true,
      unqiue: true
  },
  posts: [{
    titel: {
        type: String
    },
    postId: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Post'
    }
  }]
}, 
{collection: 'groups'},
{timestamps: true});

GroupSchema.pre('save', function (next) {
    this.parameter = this.parameter.toLowerCase();
    next();
})

module.exports = mongoose.model('Group', GroupSchema);