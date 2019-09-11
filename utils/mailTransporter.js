var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'trueUsername@gmail.com',
        pass: 'truePassword'
    }
});