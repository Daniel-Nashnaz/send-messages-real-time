
const functionsOfSql = require("../database/SingletonDatabase");
const functionsOfAnalysisData = require("./analysisDataSecond");

const TripRecord = require('./tripRecord');
let lastId = 0;

async function startAnalyzeData(idOfTableRealTimeInfo) {
    const result = await functionsOfSql.getAllInfoIsNull(idOfTableRealTimeInfo);//.then(async (result) => {
    //const result = await functionsOfSql.getAllInfoByUserIdIsNull(2, idOfTableRealTimeInfo);//.then(async (result) => {
    if(result.length === 0){
        console.log("no more!!! ");
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

        }

        insertDataToTripRecord(data, userTrip);

        await functionsOfAnalysisData.analyzeIfNeedSendMessage(userTrip, userInfo);
    }

    return lastId;
}

const insertDataToTripRecord = ((data, userTrip) => {
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
