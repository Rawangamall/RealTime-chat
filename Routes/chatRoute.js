const express=require("express");
const router=express.Router();
const chatController=require("./../Controllers/chatController");
const validateMW=require("./../Core/Validation/validateMW");
const authenticationMW = require("./../Middlewares/authenticationMW")
const phoneVerifyMW = require("./../Middlewares/phoneVerifyMW")
const {chatValidPOST}=require("./../Core/Validation/ChatValidation");


router.route("/Conversation")
       .post( authenticationMW.auth ,phoneVerifyMW.Verify,chatValidPOST,validateMW, chatController.createConversation)  //create chat
       .get(authenticationMW.auth ,phoneVerifyMW.Verify,chatController.getAllGPRooms)   // all the groups in the application so user can select one to join


router.route("/OneConversation/:id")
       .get(authenticationMW.auth ,phoneVerifyMW.Verify,chatController.getConversationsForUser)  //open specific chat
       .patch(authenticationMW.auth ,phoneVerifyMW.Verify, chatController.joinRoom)       //join selected group

router.route("/AllPrivatesConversation")
       .get(authenticationMW.auth,phoneVerifyMW.Verify,chatController.getAllPrivateRooms)    //user's private chats

router.route("/AllMyConversation")
       .get(authenticationMW.auth,phoneVerifyMW.Verify,chatController.getAllMyRooms)    //user's chats


module.exports=router;