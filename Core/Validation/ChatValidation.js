const { body, param } = require("express-validator");
const mongoose = require("mongoose");
require("./../../Models/UserModel");
const UserSchema = mongoose.model("user");


exports.chatValidPOST = [
  body("chatName").isString().withMessage("chat name should be string"),
  body('Phones').custom(async (values) => {
    const userPromises = values.map(async (value) => {
      const user = await UserSchema.findOne({ phoneNumber: value });
      if (!user) {
        throw new Error(`phoneNumber: ${value} does not exist in the app, invite them! :)`);
      }
    });

    await Promise.all(userPromises);
  }),
];