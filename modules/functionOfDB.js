const config = require("../configuration/sqlServerConfig")
const sql = require('mssql');



async function getAllInfoIsNull(idOfTableInfo) {
    try {
        // Connect to SQL Server
        await sql.connect(config);

        // Execute the function
        const result = await sql.query`SELECT * FROM dbo.GetAllRealTimeInfoIsNull()`;

        // Return the result set
        return result.recordset;
    } catch (err) {
        // Log any errors
        console.error(err);
    } finally {
        // Close the connection
        //await sql.close();
    }
}

async function getAllInfoByUserIdIsNull(userId, idOfTableInfo) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('id', sql.Int, idOfTableInfo)
            .query('SELECT * FROM dbo.GetAllRealTimeInfoForUserId(@userId,@id)');

        return result.recordset;
    } catch (err) {
        console.error(err);
    } finally {
        // Close the connection
        //await sql.close();
    }
}

async function getDefinedMessageByUserId(userID) {
    try {
        const pool = await sql.connect(config);
        const inputParam = { name: 'userID', sqlType: sql.Int, value: userID };
        const request = pool.request();
        request.input(inputParam.name, inputParam.sqlType, inputParam.value);
        const result = await request.execute('GetDefinedMessageByUserID');

        // Create an empty object to store the result
        const userInfo = {};

        // Iterate over the recordset and add each column to the object
        result.recordset.forEach(record => {
            userInfo.AlertLevel = record.AlertLevel;
            userInfo.ExceededSpeedLimit = record.ExceededSpeedLimit;
            userInfo.ForwardDirections = record.ForwardDirections;
            userInfo.LaneDeparture = record.LaneDeparture;
            userInfo.PedestrianAndCyclistCollision = record.PedestrianAndCyclistCollision;
            userInfo.SuddenBraking = record.SuddenBraking;
        });

        // Return the object with the result
        return userInfo;
    } catch (err) {
        console.error(err);
    } finally {
        // Close the connection to the SQL Server
        //await sql.close();
    }
}

async function getDriverVehicleInfo(tripId) {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM dbo.GetDriverInfoByTripID(${tripId})`;
        return result.recordset;
    } catch (err) {
        console.error(err);
    } finally {
        //sql.close();
    }
}

async function insertMessageToTable(userId, subject, body, sentTime) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('subject', sql.NVarChar(100), subject)
            .input('body', sql.NVarChar(sql.MAX), body)
            .input('sentTime', sql.DateTime2(6), sentTime)
            .execute('AddMessageToTable');
        return result;
    } catch (err) {
        console.error(err);
    } 
}


async function getInfoOfRealTimeByTripID(tripId) {
    try {
        await sql.connect(config);
        const result = await sql.query`EXEC getInfoOfRealTimeByTripID @tripId=${tripId}`;
        return result.recordset[0];
    } catch (err) {
        console.error(err);
    } finally {
        //sql.close();
    }
}
/**
 * Inserts alert server data into the database.
 * @param {number} tripId - The trip ID associated with the data.
 * @param {number} suddenBraking - The number of sudden braking events.
 * @param {number} collisionWarning - The number of collision warnings.
 * @param {number} speedWarningLaneDeparture - The number of speed warning lane departure events.
 * @returns {Promise<boolean>} - True if the data was inserted successfully, false otherwise.
 */
async function insertAlertData(tripId, suddenBraking, collisionWarning, speedWarningLaneDeparture) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('tripId', sql.Int, tripId)
            .input('suddenBraking', sql.Int, suddenBraking)
            .input('collisionWarning', sql.Int, collisionWarning)
            .input('speedWarningLaneDeparture', sql.Int, speedWarningLaneDeparture)
            .execute('insertDataOfAlertServer');
        //return result.rowsAffected[0] === 1;
    } catch (err) {
        console.error(err);
        //return false;
    }
}

/**
 * Updates alert server data in the database.
 * @param {number} tripId - The trip ID associated with the data.
 * @param {number} suddenBraking - The number of sudden braking events.
 * @param {number} collisionWarning - The number of collision warnings.
 * @param {number} speedWarningLaneDeparture - The number of speed warning lane departure events.
 * @returns {Promise<boolean>} - True if the data was updated successfully, false otherwise.
 */
async function updateAlertData(tripId, suddenBraking, collisionWarning, speedWarningLaneDeparture) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('tripId', sql.Int, tripId)
            .input('suddenBraking', sql.Int, suddenBraking)
            .input('collisionWarning', sql.Int, collisionWarning)
            .input('speedWarningLaneDeparture', sql.Int, speedWarningLaneDeparture)
            .execute('updateDataOfAlertServer');
       // return result.rowsAffected[0] === 1;
    } catch (err) {
        console.error(err);
        //return false;
    }
}


module.exports = {
    getAllInfoIsNull, getAllInfoIsNull,
    getAllInfoByUserIdIsNull, getAllInfoByUserIdIsNull,
    getDefinedMessageByUserId, getDefinedMessageByUserId,
    getDriverVehicleInfo, getDriverVehicleInfo,
    insertMessageToTable, insertMessageToTable,
    getInfoOfRealTimeByTripID, getInfoOfRealTimeByTripID,
    updateAlertData,updateAlertData,
    insertAlertData,insertAlertData
}

