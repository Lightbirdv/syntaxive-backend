var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  titel: {
      type: String,
      required: true
  },
  content: {
      type: String,
      required: true
  },
  picture: {
      data: Buffer,
      contentType: String
  },
  tag: {
      type: String,
      default: 'no tag'
  },
  headhunt: {
      type: Boolean,
      default: false
  },
  author: {
      type: String,
      default: 'anon'
  },
  comments: [{
      author:{
          type: String
      },
      content:{
          type: String
      },
      date: {
          type: Date,
          required: true,
          default: Date.now
      }
  }],
  postDate: {
      type: Date,
      required: true,
      default: Date.now
  }
}, 
{collection: 'posts'});

module.exports = mongoose.model('Post', PostSchema);