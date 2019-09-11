const { check, body } = require("express-validator/check");
const User = require("../models/user");

module.exports = [
  body("name")
    .not()
    .isEmpty()
    .withMessage("Name is required"),

  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value, { req }) => {
      return new Promise((resolve, reject) => {
        User.findAll({
          where: {
            email: value
          }
        })
          .then(user => {
            console.log(user);
            if (user.length > 0) return reject("Email already exists!");
            return resolve(true);
          })
          .catch(err => console.log(err));
      });
    }),

  body(
    "password",
    "password must be atleast 4 character long  and should contain number and alphabet"
  )
    .isLength({ min: 4 }),
    // .isAlphanumeric(),

  body("confirmPassword").custom((val, { req }) => {
    if (val !== req.body.password) throw new Error("Password mismatch");
    return true;
  })
];
