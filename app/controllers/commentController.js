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

let addComment = (req, res) => {
    PostModel.findOne({ postId: req.body.postId })
        .select('-__v -_id')
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'commentController: addComment', 10)
                let apiResponse = response.generate(true, 'postId not found', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No post Found', 'commentController: addComment')
                let apiResponse = response.generate(true, 'No post Found', 404, null)
                res.send(apiResponse)
            }
            else {
                let newComment = new CommentModel({
                    commentId: shortid.generate(),
                    postId: req.body.postId,
                    commentUserId: req.body.commentUserId,
                    commentorName: req.body.commentorName,
                    commentMessage: req.body.commentMessage,
                    commentCreatedOn: time.now()
                })
                newComment.save((err, newComment) => {
                    if (err) {
                        console.log("error while saving new comment: ", err)
                        logger.error(err.message, 'commentController: addComment', 10)
                        let apiResponse = response.generate(true, 'Failed to save new comment', 500, null)
                        res.send(apiResponse)
                    } else if (check.isEmpty(newComment)) {
                        console.log("no comment found");
                        logger.info('No comment Found', 'commentController: addComment')
                        let apiResponse = response.generate(true, 'No Comment Found', 404, null)
                        res.send(apiResponse)
                    } else {
                        console.log("comment created");
                        logger.info("comment created", "commentController: addComment");
                        let apiResponse = response.generate(false, 'Commented successfully', 200, newComment);
                        res.send(apiResponse);
                    }
                })
            }
        })
} // end of addComment function.




function getAllCommentOfAPost(req, res) {

    let findAllCommentOfPost = () => {
        return new Promise((resolve, reject) => {

            if (check.isEmpty(req.params.postId)) {
                let apiResponse = response.generate(true, "postId missing", 500, null);
                reject(apiResponse);
            } else {
                CommentModel.find({ 'postId': req.params.postId })
                    .select('-__v -_id')
                    .sort('-commentCreatedOn')
                    
                    .lean()
                    
                    .exec((err, result) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'commentController: findAllCommentOfPost', 10)
                            let apiResponse = response.generate(true, 'Failed to find comment with this postId', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(result)) {
                            logger.info('No comment found', 'commentController: findAllCommentOfPost')
                            let apiResponse = response.generate(true, 'No comment found', 404, null)
                            reject(apiResponse)
                        } else {
                            resolve(result)
                        }

                    })
            }
        })
    } // end of find all comment of post function.


    let createNewObjwithuserInfo = (resolvedResult) => {

        console.log("resolvedResults are in create obj use", resolvedResult)

        return new Promise((resolve, reject) => {
            let newArray = []
            let length = resolvedResult.length
            let i = 0
            for (let x of resolvedResult) {

                console.log("qerying for x ====", x.commentUserId)

                UserModel.find({ 'userId': [x.commentUserId] })
                
                    .exec((err, result) => {
                        console.log("userId to find",x.commentUserId)
                        console.log("got user Info 123", result)
                        if (err) {
                            logger.error(err.message, 'commentController: createNewObjwithuserInfo', 10)
                            let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                            console.log("got user Info in err", err)
                            reject(apiResponse)

                        } else if (check.isEmpty(result)) {
                            logger.info('No User Found', 'commentController: createNewObjwithuserInfo')
                            let apiResponse = response.generate(true, 'No User Found', 404, null)
                            console.log("got user Info in empty", result)
                            reject(apiResponse)
                        } else {

                            resultobj = result[0]
                            delete resultobj._doc.password
                            let newObj = {
                                ...x,
                                ...resultobj._doc,

                            }

                            newArray.push(newObj)
                            i = i + 1;
                            if (length == i) {

                                newArray.sort(check.compare)
                                resolve(newArray)
                            }

                        }
                    })

            }



        })

    } // end of createNewObjwithuserInfo function.

    findAllCommentOfPost(req, res)
        .then(createNewObjwithuserInfo)
        .then((resolve) => {

            console.log("resolve here is", resolve)
            let apiResponse = response.generate(false, 'All comment of a post found', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
} // end of getAllCommentOfAPost function.

let getSingleComment = (req, res) => {
    CommentModel.findOne({ 'commentId': req.params.commentId })
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'commentController: getSingleComment', 10)
                let apiResponse = response.generate(true, 'Failed To Find comment Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Comment found', 'commentController: getSingleComment')
                let apiResponse = response.generate(true, 'No Comment found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info('Comment found', 'commentController: getSingleComment');
                let apiResponse = response.generate(false, 'Comment details found', 200, result)
                res.send(apiResponse)
            }
        })
} //end of getSingleComment function.


let markCommentLike = (req, res) => {
    LikeCommentModel.findOne({ commentId: req.body.commentId, userId: req.body.userId })
        .select('-__v -_id')
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'commentController: markCommentLike', 10)
                let apiResponse = response.generate(true, 'commentId or userId not found', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {



                let newlikeObj = new LikeCommentModel({
                    commentId: req.body.commentId,
                    userId: req.body.userId,
                    postId:req.body.postId

                })
                newlikeObj.save((err, newlike) => {
                    if (err) {
                        console.log("error while saving new likecomment: ", err)
                        logger.error(err.message, 'commentController: markCommentLike', 10)
                        let apiResponse = response.generate(true, 'Failed to save new likecomment', 500, null)
                        res.send(apiResponse)
                    }
                    else {
                        console.log("comment like created");
                        logger.info("comment like created", "commentController: markCommentLike");
                        let apiResponse = response.generate(false, 'Commented like created successfully', 200, newlike);
                        res.send(apiResponse);
                    }
                })
            }
            else {
                logger.info('like comment  already exists', 'commentController: markCommentLike')
                let apiResponse = response.generate(true, ' postlike Found', 404, null)
                res.send(apiResponse)
            }
        })
} // end of markCommentLike function




let deleteCommentLike = (req, res) => {
    if (check.isEmpty(req.body.commentId) || check.isEmpty(req.body.userId)) {

        console.log('commentId & userId should be passed')
        let apiResponse = response.generate(true, 'commentId & userId is missing', 403, null)
        res.send(apiResponse)
    } else {

        LikeCommentModel.remove({ commentId: req.body.commentId, userId: req.body.userId }, (err, result) => {
            if (err) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                console.log('like obj Not Found.')
                let apiResponse = response.generate(true, 'like obj Not Found.', 404, null)
                res.send(apiResponse)
            } else {
                console.log('like obj Deletion Success')
                let apiResponse = response.generate(false, 'like obj Deleted Successfully', 200, result)
                res.send(apiResponse)
            }
        })
    }
} // end of deleteCommentLike function

let getAllCommentLike = (req, res) => {
    LikeCommentModel.find()
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'commentController: getAllCommentLike', 10)
                let apiResponse = response.generate(true, 'Failed To Find LikedComment Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No LikedComment Found', 'commentController: getAllCommentLike')
                let apiResponse = response.generate(true, 'No LikedComment Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All LikedComment Details Found', 200, result)
                res.send(apiResponse)
            }
        })

}

let getAllLikeofAComment = (req, res) => {
    if (check.isEmpty(req.params.commentId || req.params.userId)) {
        let apiResponse = response.generate(true, "commentId or userId missing", 500, null);
        reject(apiResponse);
    } else {
        LikeCommentModel.find({ 'commentId': req.params.commentId, 'userId': req.params.userId })
            .select('-__v -_id')
            .lean()
            .exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'commentController: getAllLikeofAComment', 10)
                    let apiResponse = response.generate(true, 'Failed to find like of a comment with this userId and commentId', 500, null)
                    res.send(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No like found', 'commentController: getAllLikeofAComment')
                    let apiResponse = response.generate(true, 'No like found', 404, null)
                    res.send(apiResponse)
                } else {
                    res.send(result)
                }

            })
    }
}

let findAllLikeofAComment = (req, res) => {
    if (check.isEmpty(req.params.commentId )) {
        let apiResponse = response.generate(true, "commentId missing", 500, null);
        reject(apiResponse);
    } else {
        LikeCommentModel.find({ 'commentId': req.params.commentId })
            .select('-__v -_id')
            .lean()
            .exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'commentController: findAllLikeofAComment', 10)
                    let apiResponse = response.generate(true, 'Failed to find like of a comment with this commentId', 500, null)
                    res.send(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No like found', 'commentController: findAllLikeofAComment')
                    let apiResponse = response.generate(true, 'No like found', 404, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'All LikedComment Details Found', 200, result)
                    res.send(apiResponse)
                }

            })
    }
}


let findAllLikeofAPost = (req, res) => {
    console.log("fun called")
    if (check.isEmpty(req.params.postId )) {
        let apiResponse = response.generate(true, "commentId missing", 500, null);
        reject(apiResponse);
    } else {

        console.log("gfsdycuijscvsucja",req.params.postId)
        LikeCommentModel.find({'postId': req.params.postId})
            .select('-__v -_id')
            .lean()
            .exec((err, result) => {
                
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'commentController: findAllLikeofAComment', 10)
                    let apiResponse = response.generate(true, 'Failed to find like of a comment with this commentId', 500, null)
                    res.send(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No like found', 'commentController: findAllLikeofAComment')
                    let apiResponse = response.generate(true, 'No like found', 404, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'All LikedComment Details Found', 200, result)
                    res.send(apiResponse)
                }

            })
    }
}



module.exports = {
    addComment: addComment,
    getAllCommentOfAPost: getAllCommentOfAPost,
    getSingleComment: getSingleComment,
    markCommentLike: markCommentLike,
    deleteCommentLike: deleteCommentLike,
    getAllCommentLike: getAllCommentLike,
    getAllLikeofAComment: getAllLikeofAComment,
    findAllLikeofAComment: findAllLikeofAComment,
    findAllLikeofAPost:findAllLikeofAPost
}