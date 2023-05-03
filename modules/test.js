const config = require("../configuration/sqlServerConfig")
const functionsOfSql = require("./functionOfDB");
const functionsOfAnalysisData = require("./analysisData");
const sql = require('mssql');

const TripRecord = require('./tripRecord');
let lastId = 0;

async function test() {
    try {
        // create a connection pool to the database
        const pool = await sql.connect(config);
        // Execute the function
        const result = await sql.query`SELECT * FROM dbo.GetAllRealTimeInfoIsNull()`;
        // fetch all the trips that have not yet been completed
        //const result = await pool.request().query('SELECT * FROM dbo.Travels WHERE TravelEnd IS NULL');

        // iterate over the result set and fetch real-time information for each trip
        for (const row of result.recordset) {
            console.log(result.recordset);

            const realTimeInfo = await pool
                .request()
                .input('TripID', sql.Int, row.TripID)
                .query('SELECT * FROM dbo.RealTimeInformation WHERE TripID = @TripID');

            // analyze the real-time information and check for any issues
            if (realTimeInfo.recordset.some((info) => info.SuddenBraking)) {
                // send a notification to the user who is driving badly
                // you can use a third-party service like Twilio, SendGrid, or Firebase Cloud Messaging to send notifications
                console.log(`User ${row.UserID} is driving badly on trip ${row.TripID}`);
            }
        }

        // close the connection pool
        await pool.close();
    } catch (err) {
        console.error(err);
    }
}

async function startAnalyzeData(idOfTableRealTimeInfo) {
    const result = await functionsOfSql.getAllInfoByUserIdIsNull(2, idOfTableRealTimeInfo);//.then(async (result) => {
    if(result.length === 0){
        return idOfTableRealTimeInfo;
    }
    let userInfo = null;
    let currentTripId = 0;
    let userTrip = null;
    lastId = result[result.length - 1].ID;
    //let dataBefore = null;
    for (const data of result) {

        if (data.TripID !== currentTripId) {
            currentTripId = data.TripID;
            userTrip = new TripRecord();
            userTrip.tripID = currentTripId;
            userInfo = await functionsOfSql.getDefinedMessageByUserId(data.UserID);
            //.then(result => {
            //    console.log("user is: "+userTrip.userID);
            //    userInfo = result;
            //console.log("This is info about user if allow demd message: " + userInfo);
            //});

        }

        //console.log("insertDataToTripRecord");
        //console.log(userInfo);
        insertDataToTripRecord(data, userTrip);
        //call func...
        await functionsOfAnalysisData.analyzeIfNeedSendMessage(userTrip, userInfo);
    }

    //}).catch(error => {
    //    console.log(error);
    //
    //})
    return lastId;
}

const insertDataToTripRecord = ((data, userTrip) => {
    //console.log(data.ID + " user: " + data.UserID);
    userTrip.userID = data.UserID;
    userTrip.tripID = data.TripID;
    userTrip.timeFromStart = data.TimeFromStart;
    userTrip.latitude = data.Latitude;
    userTrip.longitude = data.Longitude;
    userTrip.suddenBraking = Number(data.SuddenBraking);
    userTrip.laneDeparture = isGood(data.LaneDepartureWarning);
    userTrip.forwardDirections = isGood(data.ForwardWarningDirections);
    userTrip.pedestrianAndCyclistCollision = isOk(data.PedestrianAndCyclistCollisionWarning);
    userTrip.exceededSpeedLimit = isExceededSpeedLimit(data.SpeedAllowed, data.CurrentSpeed);
    userTrip.distanceTraveledMile = data.DistanceTraveledMile;
});

const isGood = ((data) => {
    if (data !== 'Good') {
        return 1;
    }
    return 0;
})

const isOk = ((data) => {
    if (data !== 'Ok') {
        return 1;
    }
    return 0;
})

const isExceededSpeedLimit = ((allowed, current) => {
    if (current > allowed + 10) {
        return 1;
    }
    return 0;
});


module.exports = {
    startAnalyzeData, startAnalyzeData

}
/*console.log("userTrip.userID " + userTrip.userID);
                console.log("currentUserId " + currentUserId);
                console.log("\nander user " + userTrip.userID);
                console.log("timeFromStart " + userTrip.timeFromStart);
                console.log("latitude " + userTrip.latitude);
                console.log("longitude " + userTrip.longitude);
                console.log("exceededSpeedLimit " + userTrip.exceededSpeedLimit);
                console.log("forwardDirections " + userTrip.forwardDirections);
                console.log("laneDeparture " + userTrip.laneDeparture);
                console.log("suddenBraking " + userTrip.suddenBraking);
                console.log("pedestrianAndCyclistCollision " + userTrip.pedestrianAndCyclistCollision);
                console.log("distanceTraveledMile " + userTrip.distanceTraveledMile);*/
