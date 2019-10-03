const express = require('express');
const router = express.Router();
const multerLib = require('./../multer/multer')
const userController = require("./../../app/controllers/userController");
const postController = require("./../../app/controllers/postController");
const commentController = require("./../../app/controllers/commentController")
const replyController = require("./../controllers/replyController")
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}/users`;

    //-------------route for user -------------------------.

    app.post(`${baseUrl}/signup`, multerLib.upload.single('image'), userController.signUpFunction);

    app.post(`${baseUrl}/login`, userController.loginFunction);

    //app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser);

    app.get(`${baseUrl}/:userId/details`, auth.isAuthorized, userController.getSingleUser);

    app.post(`${baseUrl}/logout`,auth.isAuthorized, userController.logout);


    //-------------route for post -------------------------.

    app.post(`${baseUrl}/create/post`, auth.isAuthorized, postController.postCreator);

    app.get(`${baseUrl}/get/all/post`, postController.getAllPost);

    app.get(`${baseUrl}/post/:postId/details`, postController.getSinglePost);

    //-------------route for comment -------------------------.

    app.post(`${baseUrl}/add/comment`, auth.isAuthorized, commentController.addComment);

    app.post(`${baseUrl}/add/comment/like`, auth.isAuthorized, commentController.markCommentLike);

    app.post(`${baseUrl}/delete/comment/like`, auth.isAuthorized, commentController.deleteCommentLike);

    app.get(`${baseUrl}/get/all/:postId/comment`, commentController.getAllCommentOfAPost);

    app.get(`${baseUrl}/get/all/like/comment`, commentController.getAllCommentLike);

    app.get(`${baseUrl}/get/all/comment/like/:commentId/:userId`, commentController.getAllLikeofAComment);

    app.get(`${baseUrl}/get/comment/:commentId/likes`, commentController.findAllLikeofAComment);

    app.get(`${baseUrl}/comment/:commentId/details`, commentController.getSingleComment);

    //-------------route for reply -------------------------.

    app.post(`${baseUrl}/add/reply`,auth.isAuthorized, replyController.addReply);

    app.post(`${baseUrl}/add/reply/like`, auth.isAuthorized, replyController.markReplyLike);

    app.post(`${baseUrl}/delete/reply/like`, auth.isAuthorized, replyController.deleteReplyLike);

    app.get(`${baseUrl}/get/all/:commentId/reply`, replyController.getAllReplyOfAComment);

    app.get(`${baseUrl}/get/all/like/reply`, replyController.getAllReplyLike);

    app.get(`${baseUrl}/get/all/reply/like/:replyId/:userId`, replyController.getAllLikeofAReply);

    app.get(`${baseUrl}/get/reply/:replyId/likes`, replyController.findAllLikeofAReply);

    app.get(`${baseUrl}/reply/:replyId/details`, replyController.getSingleReply);

}