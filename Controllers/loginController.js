const mongoose=require("mongoose");
const JWT= require("jsonwebtoken");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

require("./../Models/UserModel")
const UserSchema=mongoose.model("user");

const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/CatchAsync");
const sendSMS = require("./../utils/ResetPassword");

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds)


exports.login = catchAsync(async (req,res,next)=>{
    const {phone , password }  = req.body;

    if(!phone || !password){
    return next(new AppError(` Missing paramters for login`, 404));
    }

const user = await UserSchema.findOne({phoneNumber:phone}).select("+password");
console.log((await user.correctPassword(password, user.password)))
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

    const resetToken = await user.createPasswordRandomToken();
    await user.save({ validateBeforeSave: false });

    const message = `Hi ${firstName} Forgot your password? No worries, we’ve got you covered. Submit with that code ${resetToken}`
    const isSMSSent = await sendVerificationCode(message,user.phoneNumber);

    if (isSMSSent) {
        return res.status(200).json({ message: "Success: SMS sent for password reset" });
    } else {
        user.code = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError("Error sending SMS. Please try again later!", 500));
    }

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

exports.resetpassword = catchAsync(async (req,res,next)=>{

    if((req.body.code == "") && (req.body.password) == "" && (req.body.confirmPassword) == "") {
        return next(new AppError("Enter valid input"),400);
    }

const hashToken = crypto.createHash('sha256').update(req.body.code).digest('hex');

const user = await UserSchema.findOne({code: hashToken ,
     passwordResetExpires : {$gt : Date.now()}
    });

    if(!user){
    return next(new AppError("Code is invalid or expired"),400);
    }

if(req.body.password === req.body.confirmPassword){
user.password = bcrypt.hashSync(req.body.password ,salt) 
user.code = undefined    //to be removed from db
user.passwordResetExpires = undefined
await user.save();
}else{
    return next(new AppError("Password not matched!"),404);
}

res.status(200).json({
    status:"success"
});

});

