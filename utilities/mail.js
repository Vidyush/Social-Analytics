const nodemailer = require('nodemailer');
// const Email = require('email-templates');
// const path = require('path');

var transporter = nodemailer.createTransport({

    service:'gmail',
    auth: {
      type: 'oauth2',
      user: 'vidyush.bakshi@netprophetsglobal.com',
      clientId: '336586741335-gg97ghqqd190sk7kk107ie98ig1hti0m.apps.googleusercontent.com',
      clientSecret: '70iZsh8oOwMyGJQd53IbspNI',
      refreshToken: '1/j9u62O63Nca5h6A43HO0dz3H4WKf2PHsomFbvl_f4fs',
    },
   
  });
  
  // const mail = new Email({
  //   transporter,
  //   send: true,
  //     preview: false,
  //     views: {
  //       options: {
  //         extension: 'ejs',
  //       },
  //       root: path.join(__dirname,'../templates/resetPassword'),
  //     },
  // })

  module.exports = transporter;
 