const express = require('express');
const interviewController  = require('./../controller/interviewController');
const Router = express.Router();

Router.route('/')
  .get(interviewController .getAllInterviews)
  .post(interviewController .createInterview);

module.exports = Router;
