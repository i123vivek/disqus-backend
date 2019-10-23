const mongoose = require('mongoose');
Schema = mongoose.Schema;

let likeCommentSchema = new Schema({
    postId:{
        type: String,
        default:''
    },
    commentId:{
        type: String,
        default:''
    },
    userId: {
        type: String,
        default:''
    },
    status: {
        type: String,
        default:'Like'
    }
})

mongoose.model('LikeComment', likeCommentSchema);