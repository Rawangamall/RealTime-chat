const bcrypt = require("bcrypt");
const mongoose=require("mongoose");
require("./../Models/UserModel")
const UserSchema=mongoose.model("user");

const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/CatchAsync");
const sendSMS = require("./../utils/ResetPassword");

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds)

exports.register = catchAsync(async (req,res,next)=>{

    const hash = await bcrypt.hash(req.body.password, salt);

    const {firstName,lastName,image,phone} = req.body;

    const user = new UserSchema({
        _id: request.body._id,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phone,
        password: hash,
      });
  
      const data = await user.save();
      response.status(201).json(data);

});