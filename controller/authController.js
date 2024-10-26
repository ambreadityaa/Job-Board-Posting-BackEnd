const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const sendMail = require('../utils/email');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPRIES_IN,
  });
};

const createSendToken = (statusCode, res, user) => {
  const token = signToken(user._id);
  const user_id = user._id
  const user_name =  user.name
  const user_phone =  user.phone
  const user_email =  user.email
  const user_size =  user.companySize
  res.status(statusCode).json({
    status: 'success',
    token,
    user_id,
    user_name,
    user_email,
    user_phone,
    user_size
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword,
    
    phone:req.body.phone,
    companySize:req.body.companySize,
    
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please prvoide email and password !', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password !', 401));
  }

  console.log(user);
  createSendToken(200, res, user);
});

exports.protect = catchAsync(async (req, res, next) => {
  //  1 ) Gettting token and check if it exists

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged In  !  PLease Log in toget Access', 401)
    );
  }

  // 2) verfication token

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if user still exists

  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return next(new AppError('User Doesnt not exists!', 401));
  }

  // 4) Check if User changes password

  if (freshUser.changedPasswordAfter(decode.iat)) {
    return next(new AppError(' User recently has changes Password!', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no User with this Email ID', 404));
  }
  // Generate Random set token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendMail({
      email: user.email,
      subject: 'Your Password reset token is valid for 10 min',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token has been sent to Email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending emial please try again', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password

  if (!user) {
    return next(new AppError('Token is Invalid or Has Expired', 400));
  }

  user.password = req.body.password;
  user.confirmpassword = req.body.confirmpassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the user

  // 4) Log the user in, send JWT
  createSendToken(200, res, user);
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get User from Collection

  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTED current password is correct

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current Password is incorrect', 401));
  }

  //  3) If so Upadte the Password
  user.password = req.body.newPassword;
  user.confirmpassword = req.body.newPassword;
  await user.save();

  createSendToken(200, res, user);
  //  4) Log the User in , send JWT
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data

  if (req.body.password || req.body.confirmpassword) {
    return next(new AppError('This route is not for Updating Password', 400));
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated


  const filterbody = filterObj(req.body,'email','name'); 

   

  const updateUser = await User.findByIdAndUpdate(req.user.id,filterbody, {
    new: true,
    runValidator: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updateUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req,res,next)=>{
  
  await User.findByIdAndUpdate(req.user.id,{
    active:false
  })

  res.status(204).json({
    status:"success",
    data:
      null
    
  })

})