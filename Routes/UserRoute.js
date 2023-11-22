const express=require("express");
const router=express.Router();
const userController=require("./../Controllers/UserController");
const validateMW=require("./../Core/Validation/validateMW");
const {UserValidPOST,UserValidPUT,UserValidId}=require("./../Core/Validation/UserValidation");
const authenticationMW = require("./../Middlewares/authenticationMW")
const {addIMG , removeUserIMG}=require("./../Core/Validation/imageValidation");


router.route("/users")
       .post(authenticationMW.auth , UserValidPOST ,validateMW, userController.register) 





module.exports=router;