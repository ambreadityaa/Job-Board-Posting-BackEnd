const Interview = require('../models/interviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllInterviews = catchAsync(async (req,res,next)=>{

        const interview =  await Interview.find();

        res.status(200).json({
                status:"success",
                Size:interview.length,
                data:{
                        interview
                }
        })
})

exports.createInterview = catchAsync(async (req,res,next)=>{

        const newInterview =  await Interview.create(req.body);
        console.log("New Interview Created",newInterview)
        res.status(201).json({
                status:"success",
                data:{
                        newInterview
                }
        })
})