const express = require("express");
const dotenv = require("dotenv");
const functionsSendEmail = require("../modules/emails");
const nodemailer = require('nodemailer');
const axios = require('axios');
const { startAnalyzeData } = require("../modules/test");
const cron = require('node-cron');
const router = express.Router();
const functionsOfSql = require("../modules/functionOfDB");
let task;
let count = 0;

const DatabaseConnection  = require("../configuration/tedt");

/*
router.get("/", async (req, res) => {
  functionsOfSql.getAllInfoIsNull().then(result => {
    res.send(result)
  })
})

router.get("/allRealTimeInfoForUserId", async (req, res) => {

  functionsOfSql.getAllInfoByUserIdIsNull(req.body.userId).then(result => {
    res.send(result)
  })
})

*/

task = cron.schedule("*/15 * * * * *", () => {
  console.log("running a task every 10 seconds");
  startAnalyzeData(count).then(res => {
    count = res;
    console.log(count);
  });
}, {
  scheduled: false
});

router.get("/startServerCheckDataRealTime", async (req, res) => {

  task.start();
  res.status(200).json({ message: 'Server started!' })

});

router.get("/stopServerCheckDataRealTime", async (req, res) => {
  try {
    task.stop();
    res.status(200).json({ message: 'Server stoped!' })
  } catch (error) {
    res.status(500).json({ error: '' + error })
  }


});
router.get("/send", async (req, res) => {

  //const tripRecord = new TripRecord(2, 156,'00h:00m:35s', 10.5, 32.987714, 35.693244, 10, 10, 12, 45, 24);
  //let dataFromDB = await startAnalyzeData(0);
  //console.log(dataFromDB);
  //const x = await startAnalyzeData(1550);
  //console.log(x);
  /*const x = await functionsOfSql.getAllInfoByUserIdIsNull(2, 1550);
  const lastId = x[x.length - 1].ID;
  console.log(lastId); // Output: "1552"
  res.json(lastId);*/
  //cron.schedule("* * * * * *",
  //startAnalyzeData();
  //functionsOfSql.getAllInfoIsNull().then(ress=>{
  //console.log(ress);
  //})

  /*const db = DatabaseSingleton();
  const params = [
    { name: 'userId', value: 2 },
    { name: 'subject', value: 'test' },
    { name: 'body', value: 'testttt' },
    { name: 'sentTime', value: null },
  ];
  const result = await db.executeProcedure('dbo.AddMessageToTable', params);
  console.log(result);
*/

const db = new DatabaseConnection();
await db.connect();
const result = await db.query('SELECT * FROM Users');
console.log(result);
await db.disconnect();
})

router.get("/test", async (req, res) => {
  const userTrip = {
    userID: 2,
    tripID: 156,
    timeFromStart: '00h:00m:35s',
    distanceTraveledMile: 1.38,
    latitude: 32.987714,
    longitude: 35.693244,
    exceededSpeedLimit: 2,
    forwardDirections: 1,
    laneDeparture: 1,
    pedestrianAndCyclistCollision: 0,
    suddenBraking: 2
  }
  let sendErrors = {
    collisionWarning: 'Clings to the car'
  };

  let message = {};
  functionsOfSql.getDriverVehicleInfo(156).then(userInfo => {

    for (const err in sendErrors) {
      if (sendErrors[err].length > 0) {
        message.email = userInfo[0].AdministratorEmail;
        message.sebject = sendErrors[err];
        message.body = `Driver: ${userInfo[0].FullName}, car number: ${userInfo[0].VehicleNumber}, car name: ${userInfo[0].VehicleName},
        error time from the start of the trip: ${userTrip.timeFromStart}, km from the start: ${userTrip.distanceTraveledMile}
        Error location:`;//${userTrip.getAddress()}

      }
    }
    console.log(userInfo);
    console.log(message);
  }).catch(err => {
    console.error(err)
  });/*
  let userInfo, message = {};
 functionsOfSql.getDriverVehicleInfo(156)
  .then(result => {
    userInfo = result;

    for (const err in sendErrors) {
      if (sendErrors[err].length > 0) {
        message.email = userInfo[0].AdministratorEmail;
        message.sebject = sendErrors[err];
        message.body = `Driver: ${userInfo[0].FullName}, car number: ${userInfo[0].VehicleNumber}, car name: ${userInfo[0].VehicleName},
        error time from the start of the trip: ${userTrip.timeFromStart}, km from the start: ${userTrip.distanceTraveledMile}
        Error location:`;//${userTrip.getAddress()}
      }
    }
    
    console.log(userInfo);
    console.log(message);
  })
  .catch(err => {
    console.error(err)
  });
*/
})

router.get("/email", async (req, res) => {
  const emails = [
    { email: 'baniel1413@gmail.com', subject: 'Test Email 1', body: 'This is test email 1.', userId: 2 },
    { email: 'ekkdkd.34@gmail.com', subject: 'Test Email 2', body: 'This is test email 2.', userId: 2 },
    { email: 'baniel1413@gmail.com', subject: 'Test Email 3', body: 'This is test email 3.', userId: 2 }
  ];

  async function sendBulkEmails() {
    const promises = emails.map(({ email, subject, body, userId }) => functionsSendEmail.sendMessageAndSaveInDB(email, subject, body, userId));
    await Promise.all(promises);
  }

  sendBulkEmails();

  //await functionsSendEmail.sendMessageAndSaveInDB('baniel1413@gmail.com',"test","bla bla bla",2);
  //console.log("send?");
})
//sendLocationEmail(34.78178, 31.24810, 'baniel1413@gmail.com');

//sendLocationLink(37.7749, -122.4194, 'your-email@example.com', 'user-email@example.com');
/*const data=  {
  tripID: 156,
  timeFromStart: '',
  Latitude: 32.987714,
  Longitude: 35.693244,
  forwardDirections:10,
  pedestrianAndCyclistCollision:15,
  exceededSpeedLimit ,
  laneDeparture:10,
  suddenBraking:10,
  userID: 2
}*/
module.exports = router;