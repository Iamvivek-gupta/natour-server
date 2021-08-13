const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync( async(req, res, next) => {
    const newUser = await User.create(req.body);
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET , {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    sendSignUpEmail(req.body);
    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser
        }
    })
})



exports.login = catchAsync( async (req, res, next) => {
  // const email = req.body.email;
  // const password = req.body.password;
  const { email, password } = req.body;
  // 1. Check if email and password exist
  if(!email || !password){
    // res.status(400).json({
    //   status: 'fail',
    //   message: 'Please provide email and password' 
    // })
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({'email': email});
  let checkPassword = await bcrypt.compare(password, user.password);
  // 2. check if user exist and password is correct.
  if(!user || !checkPassword){
    return next(new AppError('Incorrect email or password', 401));
  }


  // 3. If everything ok, send token to client
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET , {
    expiresIn: process.env.JWT_EXPIRES_IN
  });


  res.status(200).json({
    status: 'success',
    token
  })
})



exports.protect = catchAsync( async(req, res, next) => {
  // 1. get token and Check token if its there
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
  }

  if(!token){
    return next(new AppError('You are not logged in! please login to get access.', 401));
  }
  // 2. Verification token
  let decoded = await jwt.verify(token, process.env.JWT_SECRET);
  //console.log(decoded)

  // 3. Check if user still exists
  const currentUser = await User.findOne({_id: decoded.id});
  //console.log(currentUser);
  if(!currentUser){
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }
  
  // 4. Check if user changed password after token was issued
  if(currentUser.passwordChangedAfter(decoded.iat)){
    return next(new AppError('User has recently changed password! please login again!', 401))
  }

  // Grant Access
  req.user = currentUser;
  next();
})


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(roles)
    console.log(req.user.role);
    if(!roles.includes(req.user.role)){
      return next(new AppError('You dont have access to delete tour', 403))
    }
    next();
  }
}

exports.forgotPassword = catchAsync(async(req, res, next) => {
  // 1) Get and Check email in DB
  const user = await User.findOne({ email: req.body.email});
  if(!user){
    return next(new AppError('There is no user with this email address.', 404))
  }
  // 2) Generate the random reset token
  let resetToken = user.createPasswordResetToken();
  console.log(resetToken)
  await user.save({ validateBeforeSave: false});

  // 3) Send it to user's email
  // 'http://localhost:8555/resetPassword/b cbjb jb bb '
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your Password? Please Click on below link to generate new password
  ${resetURL}`;
  resetPasswordEmail({
    email: req.body.email,
    subject: 'Your reset password Token (valid for 10 Min)',
    message: message
  })

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email for reset password'
  })
})


exports.resetPassword = catchAsync(async(req, res, next) => {
  res.redirect('https://web.whatsapp.com/')
})











function resetPasswordEmail(option){
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  var mailOptions = {
    from: 'Komal Waghmare <kawaghmare374@gmail.com>',
    to: option.email,
    subject: option.subject,
    text: option.message
    
           
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}







function sendSignUpEmail(data){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      var mailOptions = {
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: 'Welcome to CodeX Family',
        html: `<head>
        </head>
        <body bgcolor="black">
            <div>
              <div style="text-align:center; mid-width:375px; min-height:50px; padding-left:20px; padding-right:20px; max-width:600px; margin:auto; padding-top:10px">
                <img src="https://coupacafe.ncrengage.com/images/hero.png?ecdf2ecb0e3c7fca9019020cce29f631" alt="CompanyLogo" style="max-width:150px; border:5px; border-color:white; margin:20px;">
              </div>
              <div align="center" style="background-color:#FFFFFF; padding-left:20px; padding-right:20px; max-width:550px; margin:auto; border-radius:5px; padding-bottom:5px; text-align:left; margin-bottom:40px; width:80%"> 
                <h2 style="padding-top:25px; min-width:600; align:center; font-family:Roboto">
                Hi!  ${data.name}               </h2>
                <p style="max-width:500px; align:center; font-family:Roboto; padding-bottom:0px; wrap:hard; line-height:25px">
                  Thanks for creating an account with Coupa Cafe! We're so happy to have you on board. 
                </p>
                <p style="max-width:500px; align:center; font-family:Roboto-Bold; padding-bottom:0px; wrap:hard">
                  Please verify your email using the code below:
                </p>
                <h1 style="font-family:Roboto-Bold; letter-spacing:5px; margin-bottom:0px">
                  00000000
                </h1>
            <a href="google.com" style="width:100px; height:100px; background-color:yellow; font-family:Roboto-Bold; font-color:black; font-weight:2px; padding-top:15px; padding-bottom:15px; padding-left:15%; padding-right:15%; border-radius:30px; text-decoration:none; color:black">
                  Verify Email
                </a>
          
                <p style="max-width:500px; align:center; font-family:Roboto; padding-bottom:0px; wrap:hard">
                  Thank you,
                </p>
                <p style="max-width:500px; align:center; font-family:Roboto; padding-bottom:20px; wrap:hard">
                  The Coupa Cafe Team
                </p style="color:black">
                <hr>
                </hr>
                <p style="max-width:100%; align:center; font-family:Roboto; padding-bottom:10px; wrap:hard; padding-top: 0px; font-size:10px">
                  You’re receiving this email because you recently created a new Coupa Cafe account. If this wasn’t you, please ignore this email.
                </p>
              </div>
          </div>
        </body>`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}