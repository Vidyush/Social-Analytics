
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const checkout = require('../public/cashfree/checkout.js');

//------------cashfree------------//


//------------cashfree------------//

const authAccessonly = require("../middlewares/authAccess");
router.use(authAccessonly)
router.get('/checkout',authAccessonly,checkout);

router.post("/calculateSecretKey", authAccessonly, paymentController.calculateSecretKey);

module.exports= router;