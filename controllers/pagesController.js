// Page controller
var config = require('../public/cashfree/config.json');
const Order = require("../models/order");


module.exports.pricingPage = (req, res) => {
  console.log("index get hit");
  console.log(req.session.isLoggedIn);
  console.log(req.session);

  if(req.session.isLoggedIn){
  Order.findAll({
    limit: 1,
    where: {
      //your where conditions, or without them if you need ANY entry
    },
    order: [ [ 'id', 'DESC' ]]
  }).then(function(orders){
    console.log(orders);
  
  if(orders.length>0){
    res.render('pricing/pricing',{ 
        postUrl: config.paths[config.enviornment].cashfreePayUrl,
        orderId:300000000+orders[0].id+1,
        orderAmount:10,
        customerName:req.session.user.fullName,
        customerEmail:req.session.user.email,
        customerPhone:1234567890
      });
  }
  else{
    res.render('pricing/pricing',{ 
        postUrl: config.paths[config.enviornment].cashfreePayUrl,
        orderId:300000001,
        orderAmount:10,
        customerName:req.session.user.fullName,
        customerEmail:req.session.user.email,
        customerPhone:1234567890
      });
  }

  //  res.render('pricing/pricing',{ 
  //   postUrl: config.paths[config.enviornment].cashfreePayUrl,
  //   orderId:'OR00000'+orders[0].id+1,
  //   customerName:req.session.user.fullName,
  //   customerEmail:req.session.user.email
  // });
  }).catch(err => console.log(err));

 }
 else{
   //console.log('not login');
   //console.log(config.paths[config.enviornment].cashfreePayUrl);
    res.render('pricing/pricing',{ 
    postUrl: '',
    orderId:'',
    orderAmount:'',
    customerName:'',
    customerEmail:'',
    customerPhone:''
  });
 }

};



module.exports.index = (req, res) => {
  
  res.render('index/index');

};