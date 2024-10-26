// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');


const interviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    description: {
      type: String,
      required: [true, 'Description can not be empty!']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required:[true,"Interview date cannot be empty"]
    },
    experience:{
      type: String,
      required:[true,'experience can not be empty']
    },
    candidates:{
      type: [],
      required:[true,'Candidates can not be empty']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Interview must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

interviewSchema.index({  user: 1 }, { unique: true });

interviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name'
  });
  next();
});



const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
