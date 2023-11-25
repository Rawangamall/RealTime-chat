const mongoose=require("mongoose");
const JWT= require("jsonwebtoken");
const { promisify } = require("util")

require("./../Models/UserModel")
const UserSchema=mongoose.model("user");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/CatchAsync");


exports.Verify = catchAsync(async (req,res,next)=>{
token = req.headers.authorization.split(' ')[1];
if(!token){
return next(new AppError('You\'re not logged in, please go to login page',401));
}

const decoded = await promisify(JWT.verify)(token,process.env.JWT_SECRET);

const user = await UserSchema.findById(decoded.id).select("phone_verification");

console.log(user.phone_verification)
    if(!(user.phone_verification)){
        return next(new AppError('You\'re not verified ur number, please go to verify it first',401));
    }
next();
});