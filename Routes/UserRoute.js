const express=require("express");
const router=express.Router();
const userController=require("./../Controllers/UserController");
const validateMW=require("./../Core/Validation/validateMW");
const {UserValidPOST,UserValidPUT,UserValidId}=require("./../Core/Validation/UserValidation");
const authenticationMW = require("./../Middlewares/authenticationMW")
const {addIMG , removeUserIMG}=require("./../Core/Validation/imageValidation");


router.route("/users/register")
       .post( UserValidPOST ,validateMW, userController.register) 

router.route("/users/PhoneVerify")
       .patch(authenticationMW.auth , userController.phoneVerify) 





module.exports=router;