const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const bcrypt = require("bcrypt");
const crypto = require("crypto");


const schema = new mongoose.Schema({
  _id: Number,
  firstName: String,
  lastName: String,
  password: { type: String, select: false },
  image:{ type : String , default:"default.jpg"},
  phoneNumber: {type:String, unique:true , require:true},
  Status: {
    type: String,
    enum: ['offline', 'online'], 
    default: "offline",
  },
  phone_verification: {
    type: Boolean,
    default: false,
  },
  code: String,
  passwordResetExpires: Date,
});

schema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
 
  return await bcrypt.compare(candidatePassword, userPassword);
};

schema.methods.createPasswordRandomToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.code = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 min

  return resetToken;
};

schema.plugin(AutoIncrement, { id: "user_id", inc_field: "_id" });

//mapping
mongoose.model("user", schema);