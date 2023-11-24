const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
    participants: [{ type: Number, ref: 'user' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'message' }] 
  },{Timestamp:true});
  

 mongoose.model("chat", ConversationSchema);
