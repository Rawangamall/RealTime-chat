const express=require("express");
const router=express.Router();
const userController=require("./../Controllers/UserController");
const validateMW=require("./../Core/Validation/validateMW");
const {UserValidPOST,UserValidPUT,UserValidId}=require("./../Core/Validation/UserValidation");
const authenticationMW = require("./../Middlewares/authenticationMW")
const {addIMG , removeUserIMG}=require("./../Core/Validation/imageValidation");


router.route("/users/register")
       .post( UserValidPOST ,validateMW, userController.register) 

 router.route("/user/PhoneVerify")
       .get(authenticationMW.auth , userController.SendVerifactionCode) 

router.route("/user/CodeVerify")
       .patch(authenticationMW.auth , userController.phoneVerify) 

router.route("/user/name/:id")
       .get(authenticationMW.auth,userController.getUserName)



module.exports=router;