const mongoose=require("mongoose");
const JWT= require("jsonwebtoken");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

require("./../Models/UserModel")
const UserSchema=mongoose.model("user");

const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/CatchAsync");
const TwilioService = require("./../utils/ResetPassword");

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds)


exports.login = catchAsync(async (req,res,next)=>{
    const {phone , password }  = req.body;

    if(!phone || !password){
    return next(new AppError(` Missing paramters for login`, 404));
    }

const user = await UserSchema.findOne({phoneNumber:phone}).select("+password");

if(!user || !(await user.correctPassword(password, user.password))){
    return next(new AppError(`Incorrect phoneNumber or password`, 401));
}


const token = JWT.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE_IN});

res.status(200).json({
    status:"success" , 
    token
});
});

exports.forgetpassword = catchAsync(async (req,res,next)=>{
    const user = await UserSchema.findOne({ phoneNumber: req.body.phone });
    if (!user) {
        return next(new AppError(`User with that phone number not found`, 401));
    }

    const isSMSSent = await TwilioService.sendSMS(user.phoneNumber);

    if (isSMSSent) {
        return res.status(200).json({ message: "Success: SMS sent for password reset" });
    } else {
        user.code = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError("Error sending SMS. Please try again later!", 500));
    }

});

exports.resetpassword = catchAsync(async (req,res,next)=>{

    const otp = req.body.code
    const newPassword = req.body.password;
    const phone = req.body.phone

    const user = await UserSchema.findOne({ phoneNumber: phone});
    if (!user) {
        return next(new AppError(`User with that phone number not found`, 401));
    }

    const verify = await TwilioService.verifyUser(phone , otp)
    if(!verify){
    return next(new AppError("invalid otp code"),400);
    }

    if(!newPassword || (req.body.confirmPassword) != newPassword) {
        return next(new AppError("Enter valid password and its match"),400);
    }else{

    user.password = bcrypt.hashSync(newPassword ,salt) 
    await user.save();

    }
res.status(200).json({
    status:"success"
});

});


exports.isValidToken = async (req,res,next)=>{
    const token = req.headers.authorization;

    try {
        
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
    
        console.log(decoded)
        const expirationDate = new Date(decoded.exp * 1000); 
        const currentDate = new Date();
    
        if (currentDate > expirationDate) {
          return res.status(401).json({ message: 'Token expired' });
        }
    
        return res.status(200).json({ message: 'Token is valid' });
      } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
      }
}
