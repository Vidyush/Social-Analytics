const express = require("express");
const router = express.Router();
const unAuthAccess = require("../middlewares/unAuthAccess");
const authController = require("../controllers/authController");

// validation imports
const signupValidation = require("../validations/signUpValidation");
const loginValidation = require("../validations/loginValidation");
const authAccessonly = require("../middlewares/authAccess");


// adding middlewares to all the routes so the user can`t access auth pages if alread loggedin
  // get login route
  router.get("/login",unAuthAccess, authController.getLogin);
  // post login route
  router.post("/login",unAuthAccess, loginValidation, authController.postLogin);
  // get signup route
  router.get("/sign-up",unAuthAccess, authController.getSignUp);
  // get signup route
  router.post("/sign-up",unAuthAccess, signupValidation, authController.postSignUp);


router.get("/auth/logout", authController.getLogout);

router.get("/forget/:token?",authController.forget);
router.post('/resetpassword',authController.resetPassword);
router.post('/changepassword/:token',authController.changePassword)


module.exports = router;
