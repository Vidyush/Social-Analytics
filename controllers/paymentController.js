// Page controller
const config    = require('../public/cashfree/config.json');
const helpers   = require('../public/cashfree/helpers/signatureCreation');
const enums     = require('../public/cashfree/helpers/enums');
const notifyUrl = "";
const dashboardController = require("../controllers/dashboardController");
const Order = require("../models/order");


module.exports.calculateSecretKey = (req, res) => {
  
  const {paymentType} = req.body;
  var {formObj} = req.body;
  const secretKey = config.secretKey;
 
  console.log(req.body);



  switch(paymentType){
      case enums.paymentTypeEnum.checkout: {
          //const returnUrl = "http://localhost:1234/search";
         // formObj.returnUrl = returnUrl;
          formObj.notifyUrl = "";
          formObj.appId = config.appId;
          const signature = helpers.signatureRequest1(formObj, secretKey);
          additionalFields = {
              //returnUrl,
              notifyUrl,
              signature,
              appId: config.appId,
          };

          //-------------------------save-------------------------//


          let customerName = formObj.customerName;
          let customerEmail = formObj.customerEmail;
          let orderAmount = formObj.orderAmount;

          Order.create({
            customerName,
            customerEmail,
            orderAmount,
          })
          .then(result => {
              //console.log(result);
              //console.log('Created Product');
              //res.redirect('/admin/products');
             })
          .catch(err => {
            //console.log(err);
          });


        //     console.log(req.body);
        //     const description = req.body.fullName;
        //     req.order
        //     .createOrder({
        //       name: title,
        //       email: price,
        //       address: imageUrl,     
        //     })
        //     .then(result => {
        //       console.log(result);
        //       //console.log('Created Product');
        //       //res.redirect('/admin/products');
        //     })
        //     .catch(err => {
        //       console.log(err);
        //     });

          //-------------------------save-------------------------//
       
          
         return res.status(200).send({
              status:"success",
             additionalFields,
         });
      }

      default: {
          console.log("incorrect payment option recieved");
          console.log("paymentOption:", paymentType);
          return res.status(200).send({
              status:"error",
              message:"incorrect payment type sent"
          });
      }
  }

};