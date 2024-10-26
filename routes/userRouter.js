const express = require('express');
const UserController = require('./../controller/userController');
const AuthController = require('./../controller/authController');

const Router = express.Router();

Router.post('/signup', AuthController.signup);
Router.post('/login', AuthController.login);
Router.post('/forgotPassword', AuthController.forgotPassword);
Router.patch('/resetPassword/:token', AuthController.resetPassword);
Router.patch('/updatePassword',AuthController.protect, AuthController.updatePassword);
Router.patch('/updateUser',AuthController.protect, AuthController.updateUser);
Router.delete('/deleteUser', AuthController.protect, AuthController.deleteUser);

Router.route('/').get(UserController.getAllUser).post(UserController.AddUser);

Router.route('/:id')
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

module.exports = Router;
