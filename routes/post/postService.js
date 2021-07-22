const Post = require('./postModel')
const Group = require('../group/groupModel')

async function getAllPost() {
    const posts = await Post.find()
    return posts
}

async function listAuthorPost(req, res) {
    const posts = await Post.find({author: req.params.author})
    return posts
}

async function updatePost(req, res) {
    if (req.body.titel != null) {
        res.post.titel = req.body.titel
    }
    if (req.body.content != null) {
        res.post.content = req.body.content
    }
    if (req.body.picture != null) {
        res.post.picture = req.body.picture
    }
    if (req.body.author != null) {
        res.post.author = req.body.author
    }
    const updatedPost = await res.post.save()
    return updatedPost
}

async function addComment(req, res) {
    //console.log(req.user.user)
    post = res.post
    comment = {author: req.user.user, content: req.body.content}
    post.comments.push(comment)
    await post.save()
}

async function deleteComment(req, res) {
    post = res.post
    post.updateOne({ 
        $pull: { 'comments': {  _id: req.params.idcomment } } },function(err,model){
           if(err){
                console.log(err);
                return res.send(err);
             }
             return model;
         })
}

async function deletePost(res) {
    const tagsclean = res.post.tag.replace(/\s+/g, '')
    const tags = tagsclean.split(',')
    for(const t of tags) {
        const group = Group.findOne({parameter:t})
        group.updateOne(
           { $pull: { 'posts': {  postId: res.post._id } } },function(err,model){
              if(err){
                   console.log(err);
                   return res.send(err);
                }
                return model;
            })
        console.log(group)
    }
    await res.post.remove()
}

async function registerPost(req) {
    console.log(req.user)
    const post = new Post({
        titel: req.body.titel,
        content: req.body.content,
        picture: req.body.picture,
        author: req.user.user,
        tag: req.body.tag,
        comments: req.body.comments,
        postDate: req.body.postDate
    })
    console.log(post._id)
    const newPost = await post.save()
    const tagsclean = req.body.tag.replace(/\s+/g, '')
    const tags = tagsclean.split(',')
    for(const t of tags) {
        var group = await Group.findOne({parameter: t})
        console.log("searching for groups with tag: " + t + " group: " + group)
        if(group == null) {
            var group = new Group({
                parameter : t,
            })
        }
        var gpost = {titel: req.body.titel, postId: post._id}
        console.log(gpost)
        group.posts.push(gpost)
        console.log('this is supposed to be the group ' + group)
        await group.save()
    }
    return newPost
}


async function getPost(req, res, next) {
    let post
    try {
        post = await Post.findById(req.params.idpost)
        if (post == null) {
            return res.status(404).json ({ message : 'Cannot find post'})
        }
    } catch (err) {
        return res.status(500).json ({ message : err.message })
    }

    res.post = post
    next()
}

module.exports = {
    getPost,
    deletePost,
    registerPost,
    updatePost,
    getAllPost,
    addComment,
    deleteComment,
    listAuthorPost
}