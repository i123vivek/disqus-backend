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

let addReply = (req, res) => {
    CommentModel.findOne({ commentId: req.body.commentId })
        .select('-__v -_id')
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'replyController: addReply', 10)
                let apiResponse = response.generate(true, 'commentId not found', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Comment Found', 'replyController: addReply')
                let apiResponse = response.generate(true, 'No Comment Found', 404, null)
                res.send(apiResponse)
            }
            else {
                let newReply = new ReplyModel({
                    replyId: shortid.generate(),
                    commentId: req.body.commentId,
                    replyerUserId: req.body.replyerUserId,
                    replyerName: req.body.replyerName,
                    replyMessage: req.body.replyMessage,
                    replyCreatedOn: time.now()
                })
                newReply.save((err, newReply) => {
                    if (err) {
                        console.log("error while saving new reply: ", err)
                        logger.error(err.message, 'replyController: addReply', 10)
                        let apiResponse = response.generate(true, 'Failed to save new reply', 500, null)
                        res.send(apiResponse)
                    } else if (check.isEmpty(newReply)) {
                        console.log("no reply found");
                        logger.info('No reply Found', 'replyController: addReply')
                        let apiResponse = response.generate(true, 'No reply Found', 404, null)
                        res.send(apiResponse)
                    } else {
                        console.log("reply created");
                        logger.info("reply created", "replyController: addReply");
                        let apiResponse = response.generate(false, 'Replyed successfully', 200, newReply);
                        res.send(apiResponse);
                    }
                })
            }
        })
} // end of addReply function.

function getAllReplyOfAComment(req, res) {

    let findAllReplyOfComment = () => {
        return new Promise((resolve, reject) => {

            if (check.isEmpty(req.params.commentId)) {
                let apiResponse = response.generate(true, "commentId missing", 500, null);
                reject(apiResponse);
            } else {
                ReplyModel.find({ 'commentId': req.params.commentId })
                    .select('-__v -_id')
                    .sort('-replyCreatedOn')
                    
                    .lean()
                    
                    .exec((err, result) => {
                        console.log("commentId for reply:",req.params.commentId)
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'replyController: findAllReplyOfComment', 10)
                            let apiResponse = response.generate(true, 'Failed to find reply with this commentId', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(result)) {
                            logger.info('No reply found', 'replyController: findAllReplyOfComment')
                            let apiResponse = response.generate(true, 'No reply found', 404, null)
                            reject(apiResponse)
                        } else {
                            resolve(result)
                        }

                    })
            }
        })
    } // end of find all reply of comment function.


    let createNewObjwithuserInfo = (resolvedResult) => {

        return new Promise((resolve, reject) => {
            let newArray = []
            let length = resolvedResult.length
            let i = 0
            for (let x of resolvedResult) {

                console.log("qerying for x ====", x.replyerUserId)

                UserModel.find({ 'userId': [x.replyerUserId] })
                    .exec((err, result) => {

                        console.log("got user Info 123", result)
                        if (err) {
                            logger.error(err.message, 'replyController: createNewObjwithuserInfo', 10)
                            let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                            console.log("got user Info in err", err)
                            reject(apiResponse)

                        } else if (check.isEmpty(result)) {
                            logger.info('No User Found', 'replyController: createNewObjwithuserInfo')
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
                                newArray.sort(check.compareReply)
                                resolve(newArray)
                            }

                        }
                    })

            }



        })

    } // end of createNewObjwithuserInfo function.

    findAllReplyOfComment(req, res)
        .then(createNewObjwithuserInfo)
        .then((resolve) => {

            console.log("resolve here is", resolve)
            let apiResponse = response.generate(false, 'All reply of a comment found', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
} // end of getAllReplyOfAComment function.

let getSingleReply = (req, res) => {
    ReplyModel.findOne({ 'replyId': req.params.replyId })
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'replyController: getSingleReply', 10)
                let apiResponse = response.generate(true, 'Failed To Find reply Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Reply found', 'replyController: getSingleReply')
                let apiResponse = response.generate(true, 'No Reply found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info('Reply found', 'replyController: getSingleReply');
                let apiResponse = response.generate(false, 'Reply details found', 200, result)
                res.send(apiResponse)
            }
        })
} //end of getSingleReply function.

let markReplyLike = (req, res) => {
    LikeReplyModel.findOne({ replyId: req.body.replyId, userId: req.body.userId })
        .select('-__v -_id')
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'replyController: markReplyLike', 10)
                let apiResponse = response.generate(true, 'replyId or userId not found', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {



                let newlikeObj = new LikeReplyModel({
                    replyId: req.body.replyId,
                    userId: req.body.userId,

                })
                newlikeObj.save((err, newlike) => {
                    if (err) {
                        console.log("error while saving new likereply: ", err)
                        logger.error(err.message, 'replyController: markReplyLike', 10)
                        let apiResponse = response.generate(true, 'Failed to save new likeReply', 500, null)
                        res.send(apiResponse)
                    }
                    else {
                        console.log("reply like created");
                        logger.info("reply like created", "replyController: markReplyLike");
                        let apiResponse = response.generate(false, 'Reply like created successfully', 200, newlike);
                        res.send(apiResponse);
                    }
                })
            }
            else {
                logger.info('like reply  already exists', 'replyController: markReplyLike')
                let apiResponse = response.generate(true, ' replylike Found', 404, null)
                res.send(apiResponse)
            }
        })
}




let deleteReplyLike = (req, res) => {
    if (check.isEmpty(req.body.replyId) || check.isEmpty(req.body.userId)) {

        console.log('replyId & userId should be passed')
        let apiResponse = response.generate(true, 'replyId & userId is missing', 403, null)
        res.send(apiResponse)
    } else {

        LikeReplyModel.remove({ replyId: req.body.replyId, userId: req.body.userId }, (err, result) => {
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
}

let getAllReplyLike = (req, res) => {
    LikeReplyModel.find()
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'replyController: getAllReplyLike', 10)
                let apiResponse = response.generate(true, 'Failed To Find LikedReply Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No LikedReply Found', 'replyController: getAllReplyLike')
                let apiResponse = response.generate(true, 'No LikedReply Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All LikedReply Details Found', 200, result)
                res.send(apiResponse)
            }
        })

}

let getAllLikeofAReply = (req, res) => {
    if (check.isEmpty(req.params.replyId || req.params.userId)) {
        let apiResponse = response.generate(true, "replyId or userId missing", 500, null);
        reject(apiResponse);
    } else {
        LikeReplyModel.find({ 'replyId': req.params.replyId, 'userId': req.params.userId })
            .select('-__v -_id')
            .lean()
            .exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'replyController: getAllLikeofAReply', 10)
                    let apiResponse = response.generate(true, 'Failed to find like of a reply with this userId and replyId', 500, null)
                    res.send(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No like found', 'replyController: getAllLikeofAReply')
                    let apiResponse = response.generate(true, 'No like found', 404, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'All LikedReply of a reply Details Found', 200, result)
                    res.send(apiResponse)
                }

            })
    }
}

let findAllLikeofAReply = (req, res) => {
    if (check.isEmpty(req.params.replyId )) {
        let apiResponse = response.generate(true, "replyId missing", 500, null);
        reject(apiResponse);
    } else {
        LikeReplyModel.find({ 'replyId': req.params.replyId })
            .select('-__v -_id')
            .lean()
            .exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'replyController: findAllLikeofAReply', 10)
                    let apiResponse = response.generate(true, 'Failed to find like of a reply with this replyId', 500, null)
                    res.send(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No like found', 'replyController: findAllLikeofAReply')
                    let apiResponse = response.generate(true, 'No like found', 404, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'All LikedReply of a reply Details Found', 200, result)
                    res.send(apiResponse)
                }

            })
    }
}


module.exports = {
    addReply: addReply,
    getAllReplyOfAComment: getAllReplyOfAComment,
    getSingleReply: getSingleReply,
    markReplyLike: markReplyLike,
    deleteReplyLike: deleteReplyLike,
    getAllReplyLike: getAllReplyLike,
    getAllLikeofAReply: getAllLikeofAReply,
    findAllLikeofAReply: findAllLikeofAReply

}