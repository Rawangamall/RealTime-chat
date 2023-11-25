const bcrypt = require("bcrypt");
const JWT= require("jsonwebtoken");
const { promisify } = require("util")
const mongoose=require("mongoose");
require("./../Models/UserModel")
const UserSchema=mongoose.model("user");

const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/CatchAsync");
const TwilioService = require("./../utils/ResetPassword");

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds)

exports.register = catchAsync(async (req,res,next)=>{


    const {firstName,lastName,image} = req.body;
    const phone = "+2" + req.body.phone
    const hash = await bcrypt.hash(req.body.password, salt);

    const user = new UserSchema({
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phone,
        password: hash,
      });
  
      const data = await user.save();

      const isSMSSent = await TwilioService.sendSMS(phone);

      if (isSMSSent) {
          return res.status(200).json({ message: "Success: SMS sent for phone verifaction" });
      } else {
          return next(new AppError("Error sending SMS. Please try again later!", 500));
      }
      res.status(201).json(data);

});

exports.phoneVerify =  catchAsync(async (req,res,next)=>{
    
    const otp = req.body.code
    token = req.headers.authorization.split(' ')[1];
    if(!token){
    return next(new AppError('You\'re not logged in, please go to login page',401));
    }
    const decoded = await promisify(JWT.verify)(token,process.env.JWT_SECRET);

    //verify if the user of that token still exist
    const user = await UserSchema.findById(decoded.id);
    if(!user){
    return next(new AppError("The user of that token no longer exist"),401)
    }

    const verify = await TwilioService.verifyUser(user.phone , otp)
    if(!verify){
    return next(new AppError("invalid otp code"),400);
    }

    user.phone_verification = true
    await user.save();
    
    res.status(200).json({ message: "Success: Ur Phone Verified" });
});

exports.getUserName = catchAsync(async(req,res,next)=>{
 const id = req.params.id

 const user = await UserSchema.findById(id)

 if(!user){
    return next(new AppError("Not exist in the db"),400);
 }

 res.status(200).json({ firstName: user.firstName });

})