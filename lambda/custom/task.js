/**
 * 	This class gives the functionality to fetch the task entity from
	Scheduler given the taskId.
 *  @author : ankjain
 *  INTERNAL: Methods tagged as INTERNAL should not be used from lambda handlers.
	EXPOSED	: Methods tagged as EXPOSED can be used from the lambda handlers
 */
'use strict';
var DynamoDB  = require('./dynamoDbClient');
var TaskPojo = require('pojo/taskPojo');
var tableName = "Task";

function Task() {
	this.dynamoDBClient = new DynamoDB();
};

// Get task corresponding to a particular taskId
/* @INTERNAL */
Task.prototype.getTaskPojo = function(taskId, callback) {
	var params = {
        TableName: tableName,
        Key: {
        	"taskId" : taskId
        }
	};
	this.dynamoDBClient.getRecord(params, function(err, result) {
		if(err) {
			callback(err);
		} else {
			var record = result.Item;
			if(record != 'undefined' && record) {
				var taskPojo = new TaskPojo(record.taskId, record.taskMessage, record.rePrompt, record.proximity, record.timedTask);
				callback(null, taskPojo);
			} else {
				callback('NO_RECORD_FOUND_FOR_TASKID');
			}
				
		}
	});
}

module.exports = Task;
