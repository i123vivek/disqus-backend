const mongoose = require('mongoose');
Schema = mongoose.Schema;

let commentSchema = new Schema({
    commentId: {
        type: String,
        unique: true,
        index: true,
        default: ''
    },
    postId: {
        type: String,
        default: ''
    },
    commentUserId: {
        type: String,
        default: ''
    },
    commentorName: {
        type: String,
        default: ''
    },
    commentMessage: {
        type: String,
        default: ''
    },
    likeCount: {
        type: Number,
        default: 0
    },
    dislikeCount: {
        type: Number,
        default: 0
    },
    commentCreatedOn: {
        type: Date,
        default: ""
    }
})

mongoose.model('Comment', commentSchema);