const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_KEY
);


mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB connected Succesfull 👍');
  });




const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at ${port}`);
});


process.on('unhandledRejection',err=>{
  console.log(err.name , err.message);
});