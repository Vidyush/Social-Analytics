// Page controller
const config    = require('../public/cashfree/config.json');
const helpers   = require('../public/cashfree/helpers/signatureCreation');
const enums     = require('../public/cashfree/helpers/enums');
const notifyUrl = "";
const Order = require("../models/order");
const Transaction = require("../models/transaction");


module.exports.calculateSecretKey = (req, res) => {
  const {paymentType} = req.body;
  var {formObj} = req.body;
  const secretKey = config.secretKey;

  switch(paymentType){
      case enums.paymentTypeEnum.checkout: {
          const returnUrl = 'http://'+req.headers.host+'/search';
          formObj.returnUrl = returnUrl;
          formObj.notifyUrl = "";
          formObj.appId = config.appId;
          const signature = helpers.signatureRequest1(formObj, secretKey);
          additionalFields = {
              returnUrl,
              notifyUrl,
              signature,
              appId: config.appId,
          };
          //-------------------------save-------------------------//
          let orderId      = formObj.orderId;
          let customerName = formObj.customerName;
          let customerEmail = formObj.customerEmail;
          let orderAmount = formObj.orderAmount;

          Order.create({
            userId: req.session.user.id,
            orderId,
            customerName,
            customerEmail,
            orderAmount,
          })
          .then(result => {
              //console.log(result);
              //console.log('Created Product');
             })
          .catch(err => {
            //console.log(err);
          });

          Transaction.create({
            orderId,
          })
          .then(result => {
              //console.log(result);
              //console.log('Created Product');
             })
          .catch(err => {
            //console.log(err);
          });

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