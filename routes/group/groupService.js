const Group = require('./groupModel')
const Post = require('../post/postModel')

async function getAllGroup() {
    const groups = await Group.find()
    return groups
}

async function listPosts(req, res) {
    const posts = res.group.posts
    var postIDs = []
    for (const post of posts) {
        postIDs.push(post.postId)
    }
    console.log(postIDs)
    var newPosts = await Post.find({ '_id': {$in: postIDs}})
    return newPosts
}

async function updateGroup(req, res) {
    if (req.body.parameter != null) {
        res.group.parameter = req.body.parameter
    }
    const updatedGroup = await res.group.save()
    return updatedGroup
}

async function deleteGroup(res) {
    await res.group.remove()
}

async function registerGroup(req) {
    const group = new Group({
        parameter: req.body.parameter,
    })
    const newGroup = await group.save()
    return newGroup
}


async function getGroup(req, res, next) {
    let group
    try {
        group = await Group.findById(req.params.id)
        if (group == null) {
            return res.status(404).json ({ message : 'Cannot find group'})
        }
    } catch (err) {
        return res.status(500).json ({ message : err.message })
    }

    res.group = group
    next()
}

module.exports = {
    getGroup,
    deleteGroup,
    registerGroup,
    updateGroup,
    getAllGroup,
    listPosts
}