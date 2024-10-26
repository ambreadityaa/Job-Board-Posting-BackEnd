const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// User API

exports.getAllUser = catchAsync(async (req, res) => {
  const Users = await User.find();
  // const size =  Users.length()
  res.status(200).json({
    status: 'success',
    results: Users.length,
    data: {
     Users: Users,
    },
  });
});

exports.AddUser = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: {
      newuser,
    },
  });
};

exports.getUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.updateUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.deleteUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};
