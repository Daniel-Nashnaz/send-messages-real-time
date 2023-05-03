const nodemailer = require('nodemailer');
const axios = require('axios');
const dotenv = require('dotenv');
const functionsOfSql = require("./functionOfDB");


dotenv.config()

// Create a nodemailer transporter object to send emails
const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
       ciphers:'SSLv3'
    },
    auth: {
        user: process.env.emailSystem,
        pass: process.env.emailPass
    }
});

/**
 * Sends an email message and saves it in the database.
 *
 * @param {string} email - The email address to send the message to.
 * @param {string} subject - The subject of the message.
 * @param {string} body - The body of the message.
 * @param {number} userId - The ID of the user associated with the message.
 */
/*async function sendMessageAndSaveInDB(email, subject, body, userId) {
console.log("i srart send message!");
    // Send the email using the nodemailer transporter object
    transporter.sendMail({
        from: 'RTDI.2023@outlook.com',
        to: email,
        subject: subject,
        text: body
    }, async(error, info) => {
        if (error) { 
            // If there is an error sending the email, log the error and insert the message into the database with null sent time
           await functionsOfSql.insertMessageToTable(userId, subject, body, null);
            console.error(error);
        } else {
            // If the email is sent successfully, log the response and insert the message into the database with the current time
            console.log('Email sent: ' + info.response);
           await functionsOfSql.insertMessageToTable(userId, subject, body, new Date());
        }
    });
}
*/
async function sendMessageAndSaveInDB(email, subject, body, userId) {
    console.log("i start send message!");
  
    try {
      // Send the email using the nodemailer transporter object
      await new Promise((resolve, reject) => {
        transporter.sendMail(
          {
            from: process.env.emailSystem,
            to: email,
            subject: subject,
            text: body
          },
          (error, info) => {
            if (error) {
              // If there is an error sending the email, log the error and insert the message into the database with null sent time
              functionsOfSql.insertMessageToTable(userId, subject, body, null);
              console.error(error);
              reject(error);
            } else {
              // If the email is sent successfully, log the response and insert the message into the database with the current time
              console.log('Email sent: ' + info.response);
              functionsOfSql.insertMessageToTable(userId, subject, body, new Date());
              resolve();
            }
          }
        );
      });
    } catch (error) {
      // Handle errors here
      console.error(error);
    }
  }
  
module.exports = {
    sendMessageAndSaveInDB, sendMessageAndSaveInDB
}
