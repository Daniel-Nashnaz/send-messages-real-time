class TripRecord {
    constructor(userID = null, tripID = null, timeFromStart = null, distanceTraveledMile = null, latitude = null, longitude = null, exceededSpeedLimit = 0, forwardDirections = 0, laneDeparture = 0, pedestrianAndCyclistCollision = 0, suddenBraking = 0) {
        this._userID = userID;
        this._tripID = tripID;
        this._timeFromStart = timeFromStart;
        this._distanceTraveledMile = distanceTraveledMile;
        this._latitude = latitude;
        this._longitude = longitude;
        this._exceededSpeedLimit = exceededSpeedLimit;
        this._forwardDirections = forwardDirections;
        this._laneDeparture = laneDeparture;
        this._pedestrianAndCyclistCollision = pedestrianAndCyclistCollision;
        this._suddenBraking = suddenBraking;
    }

    get userID() {
        return this._userID;
    }

    set userID(value) {
        if (typeof value !== 'number') {
            throw new TypeError('UserID must be a number');
        }
        if (!Number.isInteger(value) || value < 1) {
            throw new RangeError('UserID must be a positive integer');
        }
        this._userID = value;
    }

    get tripID() {
        return this._tripID;
    }

    set tripID(value) {
        if (typeof value !== 'number') {
            throw new TypeError('UserID must be a number');
        }
        if (!Number.isInteger(value) || value < 1) {
            throw new RangeError('UserID must be a positive integer');
        }
        this._tripID = value;
    }

    get timeFromStart() {
        return this._timeFromStart;
    }

    set timeFromStart(value) {
        if (typeof value !== 'string') {
            throw new TypeError('TimeFromStart must be a string');
        }
        this._timeFromStart = value;
    }

    get distanceTraveledMile() {
        return this._distanceTraveledMile;
    }

    set distanceTraveledMile(value) {
        if (typeof value !== 'number' && value !== null) {
            throw new TypeError('DistanceTraveledMile must be a number or null');
        }
        if (value !== null && value < 0) {
            throw new RangeError('DistanceTraveledMile must be a non-negative number or null');
        }
        this._distanceTraveledMile = value;
    }

    get latitude() {
        return this._latitude;
    }

    set latitude(value) {
        if (typeof value !== 'number') {
            throw new TypeError('Latitude must be a number');
        }
        this._latitude = value;
    }

    get longitude() {
        return this._longitude;
    }


    set longitude(value) {
        if (typeof value !== 'number') {
            throw new TypeError('Longitude must be a number');
        }
        this._longitude = value;
    }

    get exceededSpeedLimit() {
        return this._exceededSpeedLimit;
    }

    set exceededSpeedLimit(value) {
        this._exceededSpeedLimit = value;
    }

    get forwardDirections() {
        return this._forwardDirections;
    }

    set forwardDirections(value) {
        this._forwardDirections = value;
    }

    get laneDeparture() {
        return this._laneDeparture;
    }

    set laneDeparture(value) {
        this._laneDeparture = value;
    }

    get pedestrianAndCyclistCollision() {
        return this._pedestrianAndCyclistCollision
    }

    set pedestrianAndCyclistCollision(value) {
        this._pedestrianAndCyclistCollision = value;
    }

    get suddenBraking() {
        return this._suddenBraking;
    }

    set suddenBraking(value) {
        this._suddenBraking = value;
    }


}
module.exports = TripRecord;



