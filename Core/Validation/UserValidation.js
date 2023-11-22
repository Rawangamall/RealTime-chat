const { body, param } = require("express-validator");
const mongoose = require("mongoose");
require("./../../Models/UserModel");
const UserSchema = mongoose.model("user");


exports.UserValidPOST = [
  body("firstName").isString().withMessage("fisrt name should string"),
  body("lastName").isString().withMessage("last name should string"),
  body('phone').isString().withMessage('Should be a valid phone format').custom(async (value) => {
    const user = await UserSchema.findOne({ phoneNumber: value });

    if (user) {
      throw new Error('phoneNumber is already exist');
    }

    return true;
  }),
  body("image").optional().isString().withMessage("image should string"),
  body("password").isString().withMessage("password should string"),

];

exports.UserValidPUT = [
  body("firstName").isString().withMessage("fisrt name should string"),
  body("lastName").isString().withMessage("last name should string"),
  body("phone").isString().withMessage("should be valid email form"),
  body("image").optional().isString().withMessage("image should string"),
  body("password").isString().withMessage("password should string"),
];

exports.UserValidId = [
  param("id").isNumeric().withMessage("id should be integer"),
];