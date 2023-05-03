const nodemailer = require('nodemailer');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.emailSystem,
    pass: process.env.emailPass
  }
});


var mailOptions = {
  from: 'RTDI.2023@outlook.com',
  to: 'baniel1413@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That supper easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});



function sendLocationLink(latitude, location, subject, body, toEmail) {
  // Create a transporter for sending email


  // Make a request to the Nominatim API to get the location link
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${location}`;

  axios.get(url)
    .then(response => {
      const data = response.data;
      const address = data.display_name;
      const link = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${location}#map=15/${location}/${location}`;
      const message = `${body} \n This is location: ${address}\n\n${link}`;

      // Send the email to the user
      transporter.sendMail({
        from: 'RTDI.2023@outlook.com',
        to: toEmail,
        subject: subject,
        text: message
      }, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    })
    .catch(error => {
      console.error(error);
    });
}


async function sendLocationEmail(longitude, latitude, zoom = 15, width = 500, height = 300, recipientEmail) {
  try {
    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: 'RTDI.2023@outlook.com',
        pass: 'i+/u5jWUQVR(a_W'
      }
    });

    // Generate image URL
    const imageUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude},${latitude},${longitude},${latitude}&layer=mapnik&marker=${latitude},${longitude}&zoom=${zoom}&width=${width}&height=${height}`;

    // Download image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');

    // Encode image to base64
    const imageBase64 = imageBuffer.toString('base64');

    // Define email options
    const mailOptions = {
      from: 'RTDI.2023@outlook.com',
      to: recipientEmail,
      subject: "subject",
      html: `<p>${body}</p><img src="data:image/png;base64,${imageBase64}" alt="Map image">`
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error(error);
  }




}