const axios = require('axios');
const functionsOfSql = require("../database/SingletonDatabase");
const { LOW_LEVEL,
    MEDIUM_LEVEL,
    HIGT_LEVEL,
    LOW_LEVEL_SUDDEN_BRAKIMG,
    LOW_LEVEL_COLLISIONS,
    LOW_LEVEL_SPEED_OR_LANE,
    MEDIUM_LEVEL_SUDDEN_BRAKIMG,
    MEDIUM_LEVEL_COLLISIONS,
    MEDIUM_LEVEL_SPEED_OR_LANE,
    HIGH_LEVEL_SUDDEN_BRAKIMG,
    HIGH_LEVEL_COLLISIONS,
    HIGH_LEVEL_SPEED_OR_LANE } = require("../constants/definitions");


let collisionWarningCount;
let speedWarningLaneDepartureCount;
let suddenBrakingCount;
let sendErrors = {};
let dataBefore = {
    speedWarningLaneDepartureCount: 0,
    collisionWarningCount: 0,
    suddenBrakingCount: 0
};
let userInfoAboutAlert;
let flagChangeTrip = false;
let saveTripId = 0;
let x = [];
async function analyzeIfNeedSendMessage(userTrip, userInfo) {

    if (saveTripId !== userTrip.tripID) {
        flagChangeTrip = true;
    }
    if (flagChangeTrip) {
        saveTripId = userTrip.tripID;
        flagChangeTrip = false;
        //insert to table only if tripID not exists!
        await functionsOfSql.insertAlertData(saveTripId, 0, 0, 0);
    } else {
        let dataFromDB = await functionsOfSql.getInfoOfRealTimeByTripID(userTrip.tripID);
        dataBefore.collisionWarningCount = dataFromDB.CollisionWarning;
        dataBefore.speedWarningLaneDepartureCount = dataFromDB.SpeedWarningLaneDeparture;
        dataBefore.suddenBrakingCount = dataFromDB.SuddenBraking;
    }
    userInfoAboutAlert = userInfo;
    let messageArrayToDB;
    collisionWarningCount = userTrip.forwardDirections + userTrip.pedestrianAndCyclistCollision + dataBefore.collisionWarningCount;
    speedWarningLaneDepartureCount = userTrip.exceededSpeedLimit + userTrip.laneDeparture + dataBefore.speedWarningLaneDepartureCount;
    suddenBrakingCount = userTrip.suddenBraking + dataBefore.suddenBrakingCount;
    sendErrors = {};

    //Minimal notifications
    if (userInfoAboutAlert.AlertLevel === LOW_LEVEL) {
        ifSpeedOrLane(LOW_LEVEL_SPEED_OR_LANE);
        ifCollisions(LOW_LEVEL_COLLISIONS);
        ifSuddenBraking(LOW_LEVEL_SUDDEN_BRAKIMG);
        //Moderate notifications: 
    } else if (userInfoAboutAlert.AlertLevel === MEDIUM_LEVEL) {
        ifSpeedOrLane(MEDIUM_LEVEL_SPEED_OR_LANE);
        ifCollisions(MEDIUM_LEVEL_COLLISIONS);
        ifSuddenBraking(MEDIUM_LEVEL_SUDDEN_BRAKIMG);
        //Maximum notifications:
    } else if (userInfoAboutAlert.AlertLevel === HIGT_LEVEL) {
        ifSpeedOrLane(HIGH_LEVEL_SPEED_OR_LANE);
        ifCollisions(HIGH_LEVEL_COLLISIONS);
        ifSuddenBraking(HIGH_LEVEL_SUDDEN_BRAKIMG);
    }
    // console.log(collisionWarningCount);
    // console.log(speedWarningLaneDepartureCount);
    // console.log(suddenBrakingCount);
    // console.log("if1");
    // console.log(sendErrors);
    if (JSON.stringify(sendErrors) === '{}') {
        await saveDataInObjToUseLater();
        return;
    }
    //If he exceeded the limit of the warnings then after each time 
    //he exceeds he will be sent a message! 
    /* if (ifNoChangeWithDataBefore()) {
         await saveDataInObjToUseLater();
         return;
     }*/
    await saveDataInObjToUseLater();
    messageArrayToDB = await generatesMessage(userTrip, sendErrors);
    x.push(messageArrayToDB);
    //console.log("data before: ");
    //console.log(dataBefore);

    messageArrayToDB.forEach(async (message) => {
        await functionsOfSql.insertMessageToTable(userTrip.userID, message.sebject, message.body, null);
    });
    console.log(x);

}

async function saveDataInObjToUseLater() {
    await functionsOfSql.updateAlertData(saveTripId, suddenBrakingCount, collisionWarningCount, speedWarningLaneDepartureCount);
    dataBefore.collisionWarningCount = collisionWarningCount;
    dataBefore.speedWarningLaneDepartureCount = speedWarningLaneDepartureCount;
    dataBefore.suddenBrakingCount = suddenBrakingCount;

};


function ifNoChangeWithDataBefore() {

    if (userInfoAboutAlert.AlertLevel === LOW_LEVEL) {
        return checksForErrors(LOW_LEVEL_COLLISIONS, LOW_LEVEL_SPEED_OR_LANE, LOW_LEVEL_SUDDEN_BRAKIMG);
    }
    if (userInfoAboutAlert.AlertLevel === MEDIUM_LEVEL) {
        return checksForErrors(MEDIUM_LEVEL_COLLISIONS, MEDIUM_LEVEL_SPEED_OR_LANE, MEDIUM_LEVEL_SUDDEN_BRAKIMG);
    }
    if (userInfoAboutAlert.AlertLevel === HIGT_LEVEL) {
        return checksForErrors(HIGH_LEVEL_COLLISIONS, HIGH_LEVEL_SPEED_OR_LANE, HIGH_LEVEL_SUDDEN_BRAKIMG);
    }


    function checksForErrors(collision, speedOrLane, braking) {
        if (dataBefore.collisionWarningCount === collisionWarningCount &&
            speedWarningLaneDepartureCount <= speedOrLane &&
            suddenBrakingCount <= braking) {
            return true;
        }
        if (dataBefore.suddenBrakingCount === suddenBrakingCount &&
            collisionWarningCount <= collision &&
            speedWarningLaneDepartureCount <= speedOrLane) {
            return true;
        }

        if (dataBefore.speedWarningLaneDepartureCount === speedWarningLaneDepartureCount &&
            collisionWarningCount <= collision &&
            suddenBrakingCount <= braking) {
            return true;
        }
    }

    if (dataBefore.collisionWarningCount === collisionWarningCount &&
        dataBefore.suddenBrakingCount === suddenBrakingCount &&
        dataBefore.speedWarningLaneDepartureCount === speedWarningLaneDepartureCount) {
        return true;
    }
    /*if (dataBefore.collisionWarningCount === collisionWarningCount &&
        (speedWarningLaneDepartureCount > speedOrLane ||
            suddenBrakingCount > braking)) {
        sendErrors.collisionWarning = '';
        return true;
    }
    if (dataBefore.suddenBrakingCount === suddenBrakingCount &&
        (collisionWarningCount > collision ||
            speedWarningLaneDepartureCount > speedOrLane)) {
        sendErrors.suddenBraking = '';
        return false;
    }

    if (dataBefore.speedWarningLaneDepartureCount === speedWarningLaneDepartureCount &&
        (collisionWarningCount > collision ||
            suddenBrakingCount > braking)) {
        sendErrors.speedOrLane = '';
        return false;
    }*/
    return false;
};
function ifSuddenBraking(number) {
    if (userInfoAboutAlert.SuddenBraking) {

        if (suddenBrakingCount >= number) {
            sendErrors.suddenBraking = 'Sudden braking happened';
            suddenBrakingCount = 0;

        }
    }
};
function ifCollisions(number) {
    if (userInfoAboutAlert.ForwardDirections && userInfoAboutAlert.PedestrianAndCyclistCollision) {

        if (collisionWarningCount >= number) {
            sendErrors.collisionWarning = 'Clings to the car ' + 'And' + ' Clings to pedestrians and bicycles';
            collisionWarningCount = 0;
            return;
        }

    }
    if (userInfoAboutAlert.ForwardDirections) {

        if (collisionWarningCount >= number) {
            sendErrors.collisionWarning = 'Clings to the car';
            collisionWarningCount = 0;
            return;
        }

    }
    if (userInfoAboutAlert.PedestrianAndCyclistCollision) {
        if (collisionWarningCount >= number) {
            sendErrors.collisionWarning = 'Clings to pedestrians and bicycles';
            collisionWarningCount = 0;
            return;
        }
    }
};
function ifSpeedOrLane(number) {
    if (userInfoAboutAlert.ExceededSpeedLimit && userInfoAboutAlert.LaneDeparture) {

        if (speedWarningLaneDepartureCount >= number) {
            sendErrors.speedOrLane = 'The speed exceeds the limit ' + 'And' + ' Departure from the lane';
            speedWarningLaneDepartureCount = 0;
            return;
        }

    }
    if (userInfoAboutAlert.ExceededSpeedLimit) {

        if (speedWarningLaneDepartureCount >= number) {
            sendErrors.speedOrLane = 'The speed exceeds the limit ';
            speedWarningLaneDepartureCount = 0;
            return;
        }

    }
    if (userInfoAboutAlert.LaneDeparture) {
        if (speedWarningLaneDepartureCount >= number) {
            sendErrors.speedOrLane = 'Departure from the lane';
            speedWarningLaneDepartureCount = 0;
        }
    }
};

async function generatesMessage(userTrip, sendErrors) {
    let timeFromStart = userTrip.timeFromStart;
    let distanceTraveledMile = userTrip.distanceTraveledMile;
    let latitude = userTrip.latitude;
    let longitude = userTrip.longitude;
    let message = {};
    let messageArray = [];
    const userInfo = await functionsOfSql.getDriverVehicleInfo(userTrip.tripID);
    for (const err in sendErrors) {
        if (sendErrors[err].length > 0) {
            message.email = userInfo[0].AdministratorEmail;
            message.sebject = sendErrors[err];
            message.body = `Driver: ${userInfo[0].FullName}\nCar number: ${userInfo[0].VehicleNumber}\nCar name: ${userInfo[0].VehicleName},` +
                `\nError time from the start of the trip: ${timeFromStart}\n km from the start: ${distanceTraveledMile}` +
                `\nError location:${await getAddress(latitude, longitude)}`
            messageArray.push(message);
            message = {};
        }
    }
    return messageArray;

}

async function getAddress(latitude, longitude) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    try {
        const response = await axios.get(url);
        const data = response.data;
        const address = data.display_name;
        const link = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
        const message = `location: ${address} \nLink to website:\n${link}`;

        if (!data.address) {
            throw new Error('Could not get address for the given location');
        }

        return message;
    } catch (error) {
        throw new Error(`Could not get address: ${error.message}`);
    }
}

module.exports = {
    analyzeIfNeedSendMessage, analyzeIfNeedSendMessage
}



