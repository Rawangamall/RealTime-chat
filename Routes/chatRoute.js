const express=require("express");
const router=express.Router();
const chatController=require("./../Controllers/chatController");
const validateMW=require("./../Core/Validation/validateMW");
const authenticationMW = require("./../Middlewares/authenticationMW")
const {chatValidPOST}=require("./../Core/Validation/ChatValidation");


router.route("/Conversation")
       .post( authenticationMW.auth ,chatValidPOST,validateMW, chatController.createConversation)  //create chat
       .get(authenticationMW.auth ,chatController.getAllGPRooms)   // all the groups in the application so user can select one to join


router.route("/OneConversation/:id")
       .get(authenticationMW.auth ,chatController.getConversationsForUser)  //open specific chat
       .patch(authenticationMW.auth , chatController.joinRoom)       //join selected group

router.route("/AllPrivatesConversation")
       .get(authenticationMW.auth,chatController.getAllPrivateRooms)    //user's private chats

router.route("/AllMyConversation")
       .get(authenticationMW.auth,chatController.getAllMyRooms)    //user's chats


module.exports=router;