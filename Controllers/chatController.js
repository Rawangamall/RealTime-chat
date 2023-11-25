const mongoose=require("mongoose");
const JWT= require("jsonwebtoken");
const { promisify } = require("util")

require("./../Models/ChatModel")
require("./../Models/MessageModel")
require("./../Models/UserModel")

const UserSchema=mongoose.model("user");
const Conversation=mongoose.model("chat");
const Message=mongoose.model("message");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/CatchAsync");

exports.createConversation =  catchAsync(async (req,res,next)=>{
          const Phones = req.body.Phones
          if (!Phones || Phones.length === 0) {
            return res.status(400).json({ error: 'Phone numbers are required.' });
          }

    const participants = await Promise.all(
    Phones.map(async (phoneNumber) => {
        const user = await UserSchema.findOne({phoneNumber:phoneNumber});
        return user ? user._id : null; 
      })
    );

    // Filter users not found
    const existingParticipants = participants.filter((userId) => userId);
    token = req.headers.authorization.split(' ')[1];
    if(!token){
    return next(new AppError('You\'re not logged in, please go to login page',401));
    }
    const decoded = await promisify(JWT.verify)(token,process.env.JWT_SECRET);

    existingParticipants.push(decoded.id);
    if (existingParticipants.length < 2) {
      return res.status(400).json({ error: 'At least two valid exist users are required.' });
    }

    const conversation = await Conversation.create({ participants: existingParticipants });
    return res.status(201).json({ conversation });

  });
  
  exports.addMessageToConversation = async (conversationId, sender, receiver, content) => {
    try {
      const message = await Message.create({conversationId:conversationId ,
          sender : sender,
          receiver : receiver,
          content : content });
          
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $push: { messages: message._id } },
        { new: true }
      );
      return message;
    } catch (error) {
      console.error('Error adding message to conversation:', error);
      throw error;
    }
  };
  
  exports.getConversationsForUser = catchAsync(async (req,res,next)=>{
    const converID = req.params.id
    const offset = parseInt(req.query.offset) || 0; 
    const limit = parseInt(req.query.limit) || 6;

    const conversations = await Conversation.find({ _id: converID })
    .populate({
      path: 'messages',
      options: {
        sort: { createdAt: -1 },
        skip: offset * limit,
        limit: limit
      },
      select: 'content sender',
      populate: {
        path: 'sender receiver',
        select: 'firstName' 
      }
    })
    .exec();

    res.status(200).json(conversations)
  });
  