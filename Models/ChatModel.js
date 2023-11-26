const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const ConversationSchema = new Schema({
    _id:Number ,
    participants: [{ type: Number, ref: 'user' }],
    isGroup: { type: Boolean, default: false },
    chatName: { type: String },
    messages: [{ type: Number, ref: 'message' }] 
  },{Timestamp:true});
  
  ConversationSchema.plugin(AutoIncrement, { id: "chat_id", inc_field: "_id" });
 mongoose.model("chat", ConversationSchema);

