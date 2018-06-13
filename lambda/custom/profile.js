/**
 * 	This class is used to perform basic crud operations on users profile
	such as saveUserProfile, getUserProfile and updateUserProfile.
 *  @author: ankjain
 * 
 * 	INTERNAL: Methods tagged as INTERNAL should not be used from lambda handlers.
	EXPOSED	: Methods tagged as EXPOSED can be used from the lambda handlers
 */

'use strict'
var DynamoDB  = require('./dynamoDbClient');
var UserProfilePojo = require('pojo/userProfilePojo');
var tableName = "Profile";

function Profile() {
	this.dynamoDBClient = new DynamoDB();
}

//save the user profile with current task and school.
/* @INTERNAL */
Profile.prototype.saveUserProfile = function(params, callback) {
	var searchParams = {
        TableName: tableName,
        Item: params
	};
	console.log('saveUserProfile:', JSON.stringify(searchParams));
	this.dynamoDBClient.insertRecord(searchParams, callback);
}

// Get the user profile pojo.
/* @INTERNAL */
Profile.prototype.getUserProfilePojo = function(userId, callback) {
	var params = {
        TableName: tableName,
        Key: {
        	"userId" : userId
        }
	};
	this.dynamoDBClient.getRecord(params, function(err, result) {
		if(err) {
			callback(err);
		} else {
			var record = result.Item;
			if(record != 'undefined' && record) {
				var userProfilePojo = new UserProfilePojo(record.userId, record.applicationFormDate, 
					record.taskId, record.currentSchoolName, record.timedTask, record.timedTaskId, 
					record.streak);
				callback(null, userProfilePojo);
			} else {
				callback('NO_RECORD_FOUND_FOR_USER');
			}
				
		}
	});
}


//update the user with a new taskId and school.
/* @INTERNAL */
Profile.prototype.updateTaskIdAndSchoolForUser = function(userId, taskId, schoolName, timedTask, 
	timedTaskId, streak, callback) {
	var params = {
		TableName: tableName,
		Key: {
			 "userId" : userId
		},
		UpdateExpression: "set taskId = :taskId, currentSchoolName = :schoolName, " 
		+ "timedTask = :timedTask, timedTaskId = :timedTaskId, streak = :streak",
		ExpressionAttributeValues: {
			":taskId" : taskId,
			":schoolName" : schoolName,
			":timedTask" : timedTask,
			":timedTaskId" : timedTaskId,
			":streak" : streak
		},
		ReturnValues:"UPDATED_NEW"
	}
	this.dynamoDBClient.updateRecord(params, callback);
}

module.exports = Profile;