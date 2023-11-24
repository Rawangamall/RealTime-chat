const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  sender: { type: Number, ref: 'user' },
  receiver: { type: Number, ref: 'user' },
  content: String,
},{timestamps:true});

 mongoose.model("message", MessageSchema);

