const cron = require('node-cron');
const { MongoClient } = require('mongodb');
const math = require('mathjs');

// Connect to the database
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("trips");

  // Schedule the task to run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    // Check if there is an active trip
    const activeTrip = collection.findOne({ status: 'active' });

    if (activeTrip) {
      // Retrieve the sensor data for the trip
      const sensorData = activeTrip.sensorData;

      // Analyze the sensor data
      const maxSpeed = math.max(sensorData.speed);
      const suddenBraking = sensorData.suddenBraking.some(val => val === true);
      const pedestrianCollision = sensorData.pedestrianAndCyclistCollisionWarning.some(val => val === true);
      const laneDeparture = sensorData.laneDepartureWarning.some(val => val === true);
      const forwardWarning = sensorData.forwardWarningDistance.some(val => val < 50);

      // Send alerts if there are problems
      if (maxSpeed > 80) {
        const client = new twilio(accountSid, authToken);
        client.messages.create({
           body: 'Your child is driving too fast!',
          to: '+1234567890',
          from: '+0987654321'
        });
      }

      if (suddenBraking || pedestrianCollision || laneDeparture || forwardWarning) {
       //send
      }
    }
  });
});