const mongoose = require('mongoose');
Schema = mongoose.Schema;

let postSchema = new Schema({
    postId: {
        type: String,
        unique: true,
        index: true,
        default: ''
    },
    userId: {
        type: String,
        default: ''
    },
    userEmail: {
        type: String,
        default: ''
    },
    postTitle: {
        type: String,
        default: ''
    },
    postDescription: {
        type: String,
        default: ''
    },
    postCreatedBy: {
        type: String,
        default: ''
    },
    postCreatedOn: {
        type: Date,
        default: ''
    }
})

mongoose.model('Post', postSchema);