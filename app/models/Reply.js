const mongoose = require('mongoose');
Schema = mongoose.Schema;

let replySchema = new Schema({
    replyId: {
        type: String,
        unique: true,
        index: true,
        default: ''
    },
    commentId: {
        type: String,
        default: ''
    },
    replyerUserId: {
        type: String,
        default: ''
    },
    replyerName: {
        type: String,
        default: ''
    },
    replyMessage: {
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
    replyCreatedOn: {
        type: Date,
        default: ""
    }
})

mongoose.model('Reply', replySchema);