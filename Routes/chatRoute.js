const express=require("express");
const router=express.Router();
const chatController=require("./../Controllers/chatController");
const validateMW=require("./../Core/Validation/validateMW");
const authenticationMW = require("./../Middlewares/authenticationMW")


router.route("/Conversation")
       .post( authenticationMW.auth ,validateMW, chatController.createConversation) 

router.route("/Conversation/:id")
       .get(authenticationMW.auth ,chatController.getConversationsForUser)

module.exports=router;