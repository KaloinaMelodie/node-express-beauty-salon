require("dotenv").config();
const nodemailer = require('nodemailer'); // Import nodemailer
const crypto = require('crypto');
const initiateMail=()=>{
    console.log(process.env.EMAIL_HOST_USER)
     // Create a transporter using nodemailer
     const vaovao = nodemailer.createTransport({
      host: 'smtp.gmail.com', // SMTP server hostname
      port: 587, // Port for TLS
      secure: process.env.EMAIL_HOST_SECURE==='true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_HOST_USER, // Your email address
        pass: process.env.EMAIL_HOST_PASSWORD, // Your email password
      },
      tls: {
            rejectUnauthorized: false, // Disable SSL certificate verification
          },
      debug: true,
    });
    return vaovao  
}

const sendEmail=(to,subject,message,params,template="'./templates/template.ejs'")=>{
    let transporter=initiateMail()
          // Email content
          const mailOptions = {
            from: process.env.EMAIL_HOST_USER,
            to: to,
            subject: subject,
            text: message,
            html:getTemplate(template, params)
          };
          // Send the email with the token
    transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
}

function generateRandomNumberWithDigits(digit) {
  if (digit < 1 || digit > 15) {
    throw new Error("Invalid digit count. Please choose a number between 1 and 15.");
  }

  const min = 10 ** (digit - 1); // Minimum value with the specified number of digits
  const max = 10 ** digit - 1;   // Maximum value with the specified number of digits
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getTemplate=(template,data)=>{
  let ejs = require('ejs');
const fs = require('fs');

const templates = fs.readFileSync(template, 'utf-8');
  return  ejs.render(templates, data);
}

const generatetoken=()=>{
  const crypto = require("crypto");
  return crypto.randomBytes(25).toString('hex')
}

module.exports = {
  initiateMail,
  sendEmail,
  generateRandomNumberWithDigits,
  generatetoken
}