const nodemailer = require('nodemailer');

const sendmail = async (options) => {
  //1) Create a Transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //  2) Define email options
  const mailOptions = {
    from: 'Aditya Ambre <hello@aditya.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //  3) Send the Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendmail;
