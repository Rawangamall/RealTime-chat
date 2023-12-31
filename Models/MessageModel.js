const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const MessageSchema = new Schema({
  _id:Number,
  conversationId: { type: Number, ref: 'Conversation' },
  sender: { type: Number, ref: 'user' },
  fileName: {type:String , default:"No file"},
  content: String,
},{timestamps:true});


MessageSchema.plugin(AutoIncrement, { id: "msg_id", inc_field: "_id" });
 mongoose.model("message", MessageSchema);

