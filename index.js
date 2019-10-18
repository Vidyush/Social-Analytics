const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const sequelize = require("./config/db");
const robots = require("express-robots-txt");

//------------vivek added cashfree------------//
// const config    = require('./public/cashfree/config.json');
// const helpers   = require('./public/cashfree/helpers/signatureCreation');
// const enums     = require('./public/cashfree/helpers/enums');
// const checkout  = require('./public/cashfree/checkout');
// const notifyUrl = "";
//-----------vivek added cashfree------------//

// const engine =  require('ejs-mate');

const app = express();

const PORT = process.env.PORT || 3300;

// adding middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use("/", express.static(path.join(__dirname, "/public")));


// adding robot.txt
app.use(robots({ UserAgent: "*", Disallow: "/" }));
var idleTimeoutSeconds = 180;
// sessions :  by default session gets stored in the memory and it is really a horrible idea to store session in memory on production.
app.use(
  session({
    secret: "superSaiyan", //for signing hash which secretl stores our id to session
    resave: true,
    saveUninitialized: true,
    cookie: {}
  })
);

app.use(flash());

// use ejs-locals for all ejs templates:
// app.engine('ejs', engine);

// // setting view engine
app.set("view engine", "ejs");

// testing database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

// syncing sequelize so that it creates table as per model if not table does`nt exist..
sequelize.sync();

// passing user data to all the views
app.use(function(req, res, next) {
  // for testing only, remove on deployement
  // req.session.isLoggedIn = true;
  // req.session.keyword = { id: 1, name: "#javascript" };

  // req.session.user = {
  //   id: 1,
  //   email: "swapnil.shukla@netprophetsglobal.com",
  //   fullName: "Swapnil Shukla",
  //   name: "Swapnil"
  // };

  if (req.session.isLoggedIn === true) {
    res.locals.user = req.session.user;
  }
  res.locals.keyword = req.session.keyword;
  next();
});

// including rotues
const authRoutes = require("./routes/authRoutes");
const pageRoutes = require("./routes/pageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/auth", authRoutes);
app.use(pageRoutes);
app.use(paymentRoutes);

//------------vivek added cashfree------------//
// app.use('/checkout',checkout);

// app.post('/calculateSecretKey', (req, res, next)=>{

//   const {paymentType} = req.body;
//   var {formObj} = req.body;
//   const secretKey = config.secretKey;

//   switch(paymentType){
//       case enums.paymentTypeEnum.checkout: {
//           const returnUrl = "http://localhost:1234/checkout/result";
//           formObj.returnUrl = returnUrl;
//           formObj.notifyUrl = "";
//           formObj.appId = config.appId;
//           const signature = helpers.signatureRequest1(formObj, secretKey);
//           additionalFields = {
//               returnUrl,
//               notifyUrl,
//               signature,
//               appId: config.appId,
//           };

//          return res.status(200).send({
//               status:"success",
//              additionalFields,
//          });
//       }
//       default: {
//           console.log("incorrect payment option recieved");
//           console.log("paymentOption:", paymentType);
//           return res.status(200).send({
//               status:"error",
//               message:"incorrect payment type sent"
//           });
//       }
//   }
// });

// /*app.post('/result', (req,res,next)=>{
//   //will have to make generic/payment type based
//   console.log("result hit");
//   console.log(req.body);
//   const signature = req.body.signature;
//   const derivedSignature = helpers.signatureResponse1(req.body, config.secretKey);
//   if(derivedSignature === signature){
//       console.log("works");
//   }
//   else{
//       console.log("signature gotten: ", signature);
//       console.log("signature derived: ", derivedSignature);
//   }
//   return res.status(200).send({
//       body: req.body
//   });
// });*/

// //below will not be hit as server is not on https://
// app.post('/notify', (req, res, next)=>{
//   console.log("notify hit");
//   console.log(req.body);
//   return res.status(200).send({
//       status: "success",
//   })
// });

// app.use((err, req , res , next)=>{
//   console.log("error caught");
//   console.log(err);
//   res.status(500).send({
//       status:"fail",
//       err: err.message,
//   });
// })

// //------------vivek added cashfree------------//

// home route
app.get("/", (req, res) => {
  return res.render("index/index");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
