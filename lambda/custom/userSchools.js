/**
 * This class saves the list of schools for a particular user and 
 * store their corresponding ratings as well.
 * @author: ankjain
 * INTERNAL: Methods tagged as INTERNAL should not be used from lambda handlers.
   EXPOSED	: Methods tagged as EXPOSED can be used from the lambda handlers
 */
'use strict'
var DynamoDB  = require('./dynamoDbClient');
var tableName = "UserSchools";

function UserSchools() {
	this.dynamoDBClient = new DynamoDB();
}

// Save schools for user. Everytime a listOfSchools is given the earlier one in overwritten
// but the ratings are preserved. 
/* @EXPOSED */
UserSchools.prototype.saveSchoolsForUser = function(userId, listOfSchools, callback) {
	var dynamoDBClient = this.dynamoDBClient;
	getSchoolRatingMapForUser(userId, dynamoDBClient, function(err, result) {
		if(err && err != 'NO_RECORD_PRESENT_FOR_USER') {
			callback(err);
		} else {
			var oldSchoolRatingMap = {};
			if(err !== 'NO_RECORD_PRESENT_FOR_USER') {
				oldSchoolRatingMap = result;
			}
			var newSchoolRatingMap = {};
			for(var schoolName of listOfSchools) {
				if(oldSchoolRatingMap[schoolName] != 'undefined' 
					&& oldSchoolRatingMap[schoolName]) {
					newSchoolRatingMap[schoolName] = oldSchoolRatingMap[schoolName];
				} else {
					newSchoolRatingMap[schoolName] = -1;
				}
			}
			var params = {
				TableName: tableName,
				Item: {
					"userId" : userId,
					"schoolRatingMap" : newSchoolRatingMap
				}
			}
			dynamoDBClient.insertRecord(params, callback);
		}
	});
}

//update the rating for a particular school by a user.
/* @EXPOSED */
UserSchools.prototype.updateRatingForSchool = function(userId, schoolName, rating, callback) {
	var dynamoDBClient = this.dynamoDBClient;
	getSchoolRatingMapForUser(userId, dynamoDBClient, function(err, result) {
		if(err) {
			callback(err);
		} else {
			var schoolRatingMap = result;
			if(schoolRatingMap[schoolName] == -1) {
				schoolRatingMap[schoolName] = rating;
			} else {
				schoolRatingMap[schoolName] = Math.floor((schoolRatingMap[schoolName] + rating)/2);	
			}
			var params = {
				TableName: tableName,
				Key: {
					"userId" : userId
				},
				UpdateExpression: "set schoolRatingMap = :schoolRatingMap",
				ExpressionAttributeValues: {
             		":schoolRatingMap" : schoolRatingMap
				},
				ReturnValues:"UPDATED_NEW"
			}
			dynamoDBClient.updateRecord(params, callback);
		}
	});
}

//Get rating of a school by the user.
/* @EXPOSED */
UserSchools.prototype.getRatingForSchool = function(userId, schoolname, callback) {
	var params = {
        TableName: tableName,
        Key: {
        	"userId" : userId,
        }
	};
	this.dynamoDBClient.getRecord(params, function(err, result) {
		if(err) {
			callback(err);
		} else {
			if(typeof result != 'undefined' && result) {
				if(typeof result.Item != 'undefined' && result.Item) {
					if(typeof result.Item.schoolRatingMap[schoolname] != 'undefined' && result.Item.schoolRatingMap[schoolname]) {
						callback(err, result.Item.schoolRatingMap[schoolname]);
					} else {
						callback("SCHOOL_NOT_FOUND_FOR_USER");
					}
				} else {
					callback("NO_RECORD_PRESENT_FOR_USER");
				}
			} else {
				callback("NO_RECORD_PRESENT_FOR_USER");
			}	
		}
	});
}

//Get the total number of schools currently for the user.
/* @EXPOSED */
UserSchools.prototype.getNumberOfSchoolsForUser = function(userId, callback) {
	var params = {
        TableName: tableName,
        Key: {
        	"userId" : userId,
        }
	};
	this.dynamoDBClient.getRecord(params, function(err, result) {
		if(err) {
			callback(err);
		} else {
			if(typeof result != 'undefined' && result) {
				if(typeof result.Item != 'undefined' && result.Item) {
					if(typeof result.Item.schoolRatingMap != 'undefined' && result.Item.schoolRatingMap) {
						var listOfSchools = Object.keys(result.Item.schoolRatingMap);
						callback(err, listOfSchools.length);
					} else {
						callback("SCHOOL_NOT_FOUND_FOR_USER");
					}
				} else {
					callback("NO_RECORD_PRESENT_FOR_USER");
				}
			} else {
				callback("NO_RECORD_PRESENT_FOR_USER");
			}	
		}
	});
}

//Get a random school for the user to reserch.
/* @EXPOSED */
UserSchools.prototype.getNextSchoolForUser = function(userId, callback) {
	var params = {
        TableName: tableName,
        Key: {
        	"userId" : userId,
        }
	};
	this.dynamoDBClient.getRecord(params, function(err, result) {
		if(err) {
			callback(err);
		} else {
			if(typeof result != 'undefined' && result) {
				if(typeof result.Item != 'undefined' && result.Item) {
					if(typeof result.Item.schoolRatingMap != 'undefined' && result.Item.schoolRatingMap) {
						var listOfSchools = Object.keys(result.Item.schoolRatingMap);
						var listSize = listOfSchools.length;
						var number = Math.floor(Math.random()*listSize);
						callback(null, listOfSchools[number]);
					} else {
						callback("SCHOOL_RATING_MAP_NOT_FOUND_FOR_USER");
					}
				} else {
					callback("NO_RECORD_PRESENT_FOR_USER");
				}
			} else {
				callback("NO_RECORD_PRESENT_FOR_USER");
			}	
		}
	});
}

// private function to get the school to rating map for the user.
/* @INTERNAL TO THIS CLASS */
function getSchoolRatingMapForUser(userId, dynamoDBClient, callback) {
	var params = {
        TableName: tableName,
        Key: {
        	"userId" : userId,
        }
	};
	dynamoDBClient.getRecord(params, function(err, result) {
		if(err) {
			callback(err);
		} else {
			if(typeof result != 'undefined' && result) {
				if(typeof result.Item != 'undefined' && result.Item) {
					if(typeof result.Item.schoolRatingMap != 'undefined' && result.Item.schoolRatingMap) {
						callback(null, result.Item.schoolRatingMap);
					} else {
						callback("SCHOOL_RATING_MAP_NOT_FOUND_FOR_USER");
					}
				} else {
					callback("NO_RECORD_PRESENT_FOR_USER");
				}
			} else {
				callback("NO_RECORD_PRESENT_FOR_USER");
			}	
		}
	});
}

module.exports = UserSchools;