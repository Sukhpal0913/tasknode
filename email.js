var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'singh13sukhpal@gmail.com',
    pass: ''
  }
});


// Providing details of the recipents and the user

var mailOptions = {
  from: 'singh13sukhpal@gmail.com',
  to: 'anupam.patel@mail.vinove.com',
  subject: 'Sending Email to the User',
  html: '<h1>Hello Anupam</h1>'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});