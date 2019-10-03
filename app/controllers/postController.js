const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib');
const check = require('../libs/checkLib');
const token = require('../libs/tokenLib');
const AuthModel = mongoose.model('Auth');
const UserModel = mongoose.model('User');
const CommentModel = mongoose.model('Comment');
const LikeCommentModel = mongoose.model('LikeComment');
const LikeReplyModel = mongoose.model('LikeReply');
const PostModel = mongoose.model('Post');
const ReplyModel = mongoose.model('Reply');

let postCreator = (req,res) =>{
    let validatePostInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.userEmail) {
                if (!validateInput.Email(req.body.userEmail)) {
                    let apiResponse = response.generate(true, 'Email Does not met the requirement', 400, null)
                    reject(apiResponse)
                }
                else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During Post Creation', 'postController: createPost()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate post input.

    let createPost = () => {
        return new Promise((resolve, reject) => {
            let newPost = new PostModel({
                postId: shortid.generate(),
                userId: req.body.userId,
                userEmail: req.body.userEmail.toLowerCase(),
                postTitle: req.body.postTitle,
                postDescription: req.body.postDescription,
                postCreatedBy: req.body.postCreatedBy,
                postCreatedOn: time.now()
            })
            newPost.save((err, newPost) => {
                if (err) {
                    logger.error(err.message, 'postController: createPost', 10)
                    let apiResponse = response.generate(true, 'Failed to create new post', 500, null)
                    reject(apiResponse)
                } else {
                    let newPostObj = newPost.toObject();
                    console.log("post object created :",newPostObj);
                    resolve(newPostObj);
                }
            })
        })

    } // end create post function.

    validatePostInput(req, res)
        .then(createPost)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'Post created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
} // end of post creation function.

let getAllPost = (req, res) => {
    PostModel.find()
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'postController: getAllPost', 10)
                let apiResponse = response.generate(true, 'Failed To Find Post Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Post found', 'postController: getAllPost')
                let apiResponse = response.generate(true, 'No post found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info('Post found', 'postController: getAllPost');
                console.log("result array before sort",result);
                let apiResponse = response.generate(false, 'All post details found', 200, result.sort(check.comparePost))
                console.log("result array after sort",result);
                res.send(apiResponse)

                //newArray.sort(check.compare)
            }
        })
}  // end of getAllPost function.


let getSinglePost = (req, res) => {
    PostModel.findOne({ 'postId': req.params.postId })
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'postController: getSinglePost', 10)
                let apiResponse = response.generate(true, 'Failed To Find Post Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Post found', 'postController: getSinglePost')
                let apiResponse = response.generate(true, 'No Post found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info('Post found', 'postController: getSinglePost');
                let apiResponse = response.generate(false, 'Post details found', 200, result)
                res.send(apiResponse)
            }
        })
} //end of getSinglePost function.





module.exports = {
    postCreator: postCreator,
    getAllPost: getAllPost,
    getSinglePost: getSinglePost
}