const mongoose = require('mongoose');
Schema = mongoose.Schema;

let likeReplySchema = new Schema({
    replyId:{
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

mongoose.model('LikeReply', likeReplySchema);