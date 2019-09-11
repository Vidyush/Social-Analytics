// Auth Controller
const User = require("../models/user");
const {
  validationResult
} = require("express-validator/check");
const transporter = require('../utilities/mail');
const crypto = require("crypto");
const moment = require('moment');
const bcrypt = require('bcrypt');
const multer = require('multer');

//console.log('print in authcontroller');

var storage = multer.diskStorage({
  destination:(req, file, cb) => {
      cb(null,'uploads');
  },
  filename: (req, file, cb) => {
      const ext = file.mimetype.split('/')[1];
cb(null, file.fieldname + '-' + Date.now() + '.'+ext);
}
});    
var upload = multer({storage: storage,fileFilter: function(req, file, callback) {
  var ext = path.extname(file.originalname)
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(console.log('Only images are allowed'), null)
  }
  callback(null, true)
}});


// GET- Login method
module.exports.getLogin = (req, res) => {
  data = {
    form: {}
  };
  return res.render("auth/login", data);
};

// GET - Sign up method
module.exports.getSignUp = (req, res) => {
  const data = {
    form: {}
  };
  return res.render("auth/signup", data);
};

// POST - Sign up method
module.exports.postSignUp = async (req, res) => {
  const body = req.body;

  const data = {
    pageTitle: "Sign Up",
    form: body,
    errors: []
  };

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    data.errors = errors.array();

    return res.status(422).render("auth/signup", data);
  }

  try {
    user = await User.create({
      name: body.name,
      email: body.email,
      password: body.password
    });
  } catch (err) {
    console.log(err);
  }

  // as user is created now, initialize session with login status
  req.session.isLoggedIn = true;
  req.session.user = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  console.log(req.session.user.email)
  var mailOptions = {
    from: '"Buzzabl" <accounts@buzzabl.com>',
    to: req.session.user.email,
    subject: 'Buzzab::Account Created',
    html: 'Hi ' + req.session.user.name + ',<br/> Your account has been sucessfully created.<br/>'
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      req.flash('error', 'Could not sent email');
      console.log("error")
     return res.redirect('/search');
      } else {
      req.flash('success', 'Account created successfully');
      res.redirect('/search');
    }
  });
  };

// POST - LOGIN Method
module.exports.postLogin = (req, res) => {

  const body = req.body;
  const data = {
    form: body
  };
  
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    data.errors = errors.array();
    data.form = body;
    return res.status(422).render("auth/login", data);
  }

  User.findOne({
      where: {
        email: body.email
      }
    })
    .then(user => {
      if (!user) {
        data.errors = "Email/Password is incorrect.";
        return res.render("auth/login", data);
      }

      isAuth = bcrypt.compareSync(body.password, user.password);

      if (isAuth) {

        // as user is created now, initialize session with login status
        req.session.isLoggedIn = true;
        req.session.user = {
          id: user.id,
          email: user.email,
          fullName: user.name,
          name: user.name.split(" ")[0]
        };
        return res.redirect("/search");
      } else {
        data.errors = "Email/Password is incorrect.";
        return res.render("auth/login", data);
      }
    })
    .catch(err => console.log(err));
};

// GET- logout function
module.exports.getLogout = (req, res) => {
  req.session.destroy(function (err) {
    if (err) console.log(err);
    else return res.redirect("/auth/login");
  });
};

module.exports.forget = async (req, res) => {
  let error = req.flash('error');
  let success = req.flash('success');
  let title;
  let token = req.params.token;

  if (!token) token = '';

  if (!token) {
    title = 'Reset Password';
  } else {
    title = 'Change Password';
  }
  //console.log(token)
  res.render('auth/forget', {
    title: title,
    token,
    success,
    error,
    //csrfToken:req.csrfToken()
  });
}


module.exports.resetPassword = async (req, res) => {

  let body = req.body;
  const user = await User.findOne({
    where: {
      email: body.email
    }
  });

 
  if (!user) {
    req.flash('error', 'Invalid Email ID');
    return res.redirect('forget')
  }

  let secret = 'abcdefg';
  // var hash = crypto.createHash('sha256').update("pwd").digest('base64');
  let hashBytes = crypto.randomBytes(64);
  let hash = hashBytes.toString('hex');
  // return res.json(hash);

  var msg = 'Hi ' + user.name + '<br/>You are receiving this because you (or someone else) have requested the reset of the password for your account.<br/>' +
    'Please click on the following ' +
    '<a href="http://' + req.headers.host + '/auth/forget/' + hash + '" target="_blank">link </a>or paste this into your browser to complete the process:<br/><br/>http://' + req.headers.host + '/auth/forget/' + hash +
    '<br/>Token will be expire in 2 days' +
    '<br/>If you did not request this, please ignore this email and your password will remain unchanged'

  var mailOptions = {
    from: '"Buzzabl" <accounts@buzzabl.com>',
    to: body.email,
    subject: 'Buzzabl: Reset password Link',
    html: msg
  };
  // let tokenUrl = "http://" + req.headers.host + '/auth/forget/' + hash;

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      req.flash('error', 'Could not sent email');
      console.log(error)
      return res.redirect('forget');
    }

    console.log('email has been sent!');
    let new_date = moment().add(2, 'days');


    user.resetToken = hash;
    user.resetTime = new_date;
    user.save().then(()=>{
      req.flash('success', 'Email sent successfully');
      return res.redirect('forget');
    }).catch(err=>{
      console.log(err);
    })
    });
}


module.exports.changePassword = async (req, res) => {
  let password = req.body.Password;
  let password1 = password;
  let token = req.params.token;
  console.log(password, password1)
  console.log(token);
  if (token === '') {
    req.flash('error', 'Invalide Link');
    res.redirect('forget');
    return;
  }
  const isUser = await User.findOne({
    where: {
      resetToken: token
    }
  });
  if (!isUser) {
    req.flash('error', 'Invalid token');
    return res.redirect('/forget/' + token);
  }
  if (password === '') {
    req.flash('error', 'Please enter password');
    res.redirect('/forget/' + token);
    return;
  }
  let hash = bcrypt.hashSync(password, 10);
  password = hash;
  User.update({
    password
  }, {
    where: {
      resetToken: token
    }
  }).then((upd) => {
    var mailOptions = {
      from: '"Buzzabl" <accounts@buzzabl.com>',
      to: isUser.email,
      subject: 'Buzzab::Reset Password',
      html: 'Hi ' + isUser.name + ',<br/> Your password has been sucessfully upadated<br/>'
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        req.flash('error', 'Could not sent email');
        res.redirect('/auth/forget');
        } else {
        req.flash('success', 'Password updated successfully');
        res.redirect('/auth/forget');
      }
    });
  })
}

module.exports.profile = async(req,res)=>{
  let getUserDetails = await User.findOne({
      where:{
          id:[req.params.id]
      },
      attributes: ['id','name','email']
  });
 
 
 
  res.render('auth/profile',{
      details:getUserDetails
  })
  
}

module.exports.editForm = async(req,res)=>{
  let getUserDetails = await User.findOne({
    where:{
        id:[req.params.id]
    },
    attributes: ['id','name','email']
});



res.render('auth/editUser',{
    details:getUserDetails
})
}
module.exports.update = async(req,res)=>{
  let name = req.body.first_name+' '+req.body.last_name;
  let mobile = req.body.mobile;
  let id = req.params.id;
  
  let updateUser = await auth.update(
      {name:name,
          email:email,
          
          },
      {returning: true, where: {id: id} }
  )
  res.redirect('/auth/');
}

module.exports.Delete = async(req,res)=>{
  let del = await auth.destroy({
      where:{id:req.params.id}
  })
  .then(deletedUser=>{
      var msg =`user ${deletedUser} has been deleted`;
      res.redirect('/auth/?msg=msg')
  })
}

module.exports.Upload = async(req,res)=>{
  let getUserDetails = await auth.findOne({
      where:{
          id:[req.params.id]
      },
      attributes: ['id']
  });
 
  res.render('user/uploadimage',{
      details:getUserDetails
  })
  
}
  
module.exports.Uploaduser = async(req,res)=>{
  let id = req.params.id;
      var storage = multer.diskStorage({
          destination:(req, file, cb) => {
              cb(null,'uploads');
          },
          filename: (req, file, cb) => {
              const ext = file.mimetype.split('/')[1];
      cb(null, file.fieldname + '-' + Date.now() + '.'+ext);
    }
});    
      var upload = multer({storage: storage,fileFilter: function(req, file, callback) {
    var ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(console.log('Only images are allowed'), null)
    }
    callback(null, true)
      }}).single('avatar');
      
      upload(req, res, function (err) {
  
          if (err) {
  
               return res.send({ success: false, msg: 'something went wrong' })
  
              }
  
          else {
  
              if (!req.file) {
  
                  return res.send({ success: false, msg: 'No file selected' })
  
              }
              else
              {   let fpath = req.file.path;
                  console.log(id)
                  let updateUser = auth.update(
                  {
              
                  filePath:fpath
                  },
                  {returning: true, where: {id: id} }
                  )
                  res.redirect('/auth/');
                  }
              }
      })

      
}