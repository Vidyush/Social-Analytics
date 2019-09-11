// Page controller
var config = require('../public/cashfree/config.json');

module.exports.pricingPage = (req, res) => {
  //return res.render("pricing/pricing");


  console.log("index get hit");
  console.log(config.paths[config.enviornment].cashfreePayUrl);
  res.render('pricing/pricing',{ 
      postUrl: config.paths[config.enviornment].cashfreePayUrl
  });

};



module.exports.index = (req, res) => {
  
  res.render('index/index');

};