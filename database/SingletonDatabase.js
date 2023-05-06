const config = require("../configuration/sqlServerConfig");
const sql = require('mssql');
/**
 * The Database class is used to manage connections to a SQL Server database.
 * It is implemented as a Singleton, which means that only one instance of the
 * class can exist within the application.
 *
 * @class
 */

class SingletonDatabase {
  /**
  * Creates a new instance of the Database class.
  * If an instance of the class already exists, returns that instance instead.
  *
  * @constructor
  * @returns {Database} An instance of the Database class.
  */
  constructor() {
    // If an instance of the class does not already exist, create one
    if (!SingletonDatabase.instance) {
      // Create a new connection pool using the SQL Server configuration
      this.pool = new sql.ConnectionPool(config);
      // Store the instance of the class
      SingletonDatabase.instance = this;
    }
    // Return the instance of the class
    return SingletonDatabase.instance;
  }
  /**
   * Closes the connection pool for the database.
   *
   * @async
   * @method
   */
  async closePool() {
    try {
      await this.pool.close();
      console.log("Connection pool closed.");
    } catch (err) {
      console.error(err);
    }
  }

    /**
   * Retrieves information from the database where a specified column is null.
   *
   * @async
   * @method
   * @param {number} idOfTableInfo - The ID of the table to retrieve information from.
   * @returns {Array<object>} An array of objects representing the rows from the database.
   */
  async getAllInfoIsNull(idOfTableInfo) {
    try {
      const connection = await this.pool.connect();
      const result = await connection.request()
        .input('id', sql.Int, idOfTableInfo)
        .query`SELECT * FROM dbo.GetAllRealTimeInfoIsNull(@id)`;

      connection.release();
      return result.recordset;
    } catch (err) {
      console.error(err);
    }
  }
  /**
   * Retrieves information from the database where a specified column is null and the user ID matches.
   *
   * @async
   * @method
   * @param {number} userId - The ID of the user to retrieve information for.
   * @param {number} idOfTableInfo - The ID of the table to retrieve information from.
   * @returns {Array<object>} An array of objects representing the rows from the database.
   */
  async getAllInfoByUserIdIsNull(userId, idOfTableInfo) {
    try {
      const connection = await this.pool.connect();
      const result = await connection.request()
        .input('userId', sql.Int, userId)
        .input('id', sql.Int, idOfTableInfo)
        .query('SELECT * FROM dbo.GetAllRealTimeInfoForUserId(@userId,@id)');
      connection.release();
      return result.recordset;
    } catch (err) {
      console.error(err);
    }
  }
  /**
   * Retrieves the defined message for a specified user ID.
   *
   * @async
   * @method
   * @param {number} userID - The ID of the user to retrieve the defined message for.
   * @returns {object} An object representing the defined message for the specified user.
   */
  async getDefinedMessageByUserId(userID) {
    try {
      const connection = await this.pool.connect();
      const inputParam = { name: 'userID', sqlType: sql.Int, value: userID };
      const request = connection.request();
      request.input(inputParam.name, inputParam.sqlType, inputParam.value);
      const result = await request.execute('GetDefinedMessageByUserID');
      const userInfo = {};
      result.recordset.forEach(record => {
        userInfo.AlertLevel = record.AlertLevel;
        userInfo.ExceededSpeedLimit = record.ExceededSpeedLimit;
        userInfo.ForwardDirections = record.ForwardDirections;
        userInfo.LaneDeparture = record.LaneDeparture;
        userInfo.PedestrianAndCyclistCollision = record.PedestrianAndCyclistCollision;
        userInfo.SuddenBraking = record.SuddenBraking;
      });
      connection.release();
      return userInfo;
    } catch (err) {
      console.error(err);
    }
  }
 /**
   * Retrieves the driver and vehicle information for a specified trip ID.
   *
   * @async
   * @method
   * @param {number} tripId - The ID of the trip to retrieve the information for.
   * @returns {Array<object>} An array of objects representing the driver and vehicle information.
   */
  async getDriverVehicleInfo(tripId) {
    try {
      const connection = await this.pool.connect();
      const result = await connection.query`SELECT * FROM dbo.GetDriverInfoByTripID(${tripId})`;
      connection.release();
      return result.recordset;
    } catch (err) {
      console.error(err);
    }
  }
  /**
   * Inserts a new message into the database for a specified user.
   *
   * @async
   * @method
   * @param {number} userId - The ID of the user to insert the message for.
   * @param {string} subject - The subject of the message.
   * @param {string} body - The body of the message.
   * @param {Date} sentTime -the timestamp when the message was sent.
   * @returns {boolean} True if the message was successfully inserted into the database, false otherwise.
   */
  async insertMessageToTable(userId, subject, body, sentTime) {
    try {
      const connection = await this.pool.connect();
      const result = await connection.request()
        .input('userId', sql.Int, userId)
        .input('subject', sql.NVarChar(100), subject)
        .input('body', sql.NVarChar(sql.MAX), body)
        .input('sentTime', sql.DateTime2(6), sentTime)
        .execute('AddMessageToTable');
      connection.release();
      return result;
    } catch (err) {
      console.error(err);
    }
  }
  /**
   * Retrieves real-time information for a specified trip ID.
   *
   * @async
   * @method
   * @param {number} tripId - The ID of the trip to retrieve information for.
   * @returns {object} An object representing the real-time information for the specified trip.
   */
  async getInfoOfRealTimeByTripID(tripId) {
    try {
      const connection = await this.pool.connect();
      const result = await connection.query`EXEC getInfoOfRealTimeByTripID @tripId=${tripId}`;
      connection.release();
      return result.recordset[0];
    } catch (err) {
      console.error(err);
    }
  }
/**
 * Updating the user's information according to the trip number to know what the data was before
 * @param {number} tripId - The ID of the trip associated with the data.
 * @param {number} suddenBraking - The number of sudden braking events.
 * @param {number} collisionWarning - The number of collision warnings.
 * @param {number} speedWarningLaneDeparture - The number of speed warning lane departure events.
 * @returns {Promise<boolean>} - A boolean indicating whether the data was updated successfully.
 */
  async updateAlertData(tripId, suddenBraking, collisionWarning, speedWarningLaneDeparture) {
    try {
      const connection = await this.pool.connect();
      const result = await connection.request()
        .input('tripId', sql.Int, tripId)
        .input('suddenBraking', sql.Int, suddenBraking)
        .input('collisionWarning', sql.Int, collisionWarning)
        .input('speedWarningLaneDeparture', sql.Int, speedWarningLaneDeparture)
        .execute('updateDataOfAlertServer');
      connection.release();
      return result.rowsAffected[0] === 1;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
/**
 * Inserts the user's information according to the trip number to know what the data was before
 * @param {number} tripId - The trip ID associated with the data.
 * @param {number} suddenBraking - The number of sudden braking events.
 * @param {number} collisionWarning - The number of collision warnings.
 * @param {number} speedWarningLaneDeparture - The number of speed warning lane departure events.
 * @returns {Promise<boolean>} - True if the data was inserted successfully, false otherwise.
 */
  async insertAlertData(tripId, suddenBraking, collisionWarning, speedWarningLaneDeparture) {
    try {
      const connection = await this.pool.connect();
      const result = await connection.request()
        .input('tripId', sql.Int, tripId)
        .input('suddenBraking', sql.Int, suddenBraking)
        .input('collisionWarning', sql.Int, collisionWarning)
        .input('speedWarningLaneDeparture', sql.Int, speedWarningLaneDeparture)
        .execute('insertDataOfAlertServer');
      connection.release();
      return result.rowsAffected[0] === 1;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

}
/**
 * Freezing the instance of the Database class prevents any modifications to the instance.
 * This is done to ensure that the singleton instance remains consistent throughout the 
 * application and cannot be accidentally modified by other parts of the code.
 */
const instance = new SingletonDatabase();
Object.freeze(instance);

module.exports = instance;