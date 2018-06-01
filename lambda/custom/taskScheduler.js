/**
 * 	This class is used to schedule task for a user, 
	update task for the user
 *  @author : ankjain
 *  INTERNAL: Methods tagged as INTERNAL should not be used from lambda handlers.
	EXPOSED	: Methods tagged as EXPOSED can be used from the lambda handlers
 */
'use strict';
var Profile  = require('./profile');
var Task     = require('./task');

var firstTaskNumber = 48;
var firstTimedTaskNumber = 99;
var timedTask = false;

function TaskScheduler() {
	this.profile = new Profile();
	this.task    = new Task();
};

// This would be called for the first time users logs in.
/* @EXPOSED */
TaskScheduler.prototype.assignFirstTask = function(userId, applicationFormDate, schoolName, callback) {
	this.profile.saveUserProfile(userId, applicationFormDate, firstTaskNumber, 
		schoolName, false, firstTimedTaskNumber, 1, callback);
}

//Every subsequent time we would call this to assign a new task
/* @EXPOSED */
TaskScheduler.prototype.assignNextTask = function(userId, schoolName, callback) {
	var obj = this;
	this.profile.getUserProfilePojo(userId, function(err, result) {
		if (err) {
			callback(err);
		} else {
			var taskId = result.getTaskId();
			var timedTaskId = result.getTimedTaskId();
			var streak = result.getStreak();
			if(streak % 5 == 0) {
				//assign every fifth task as a timedTask
				timedTask = true;
				timedTaskId = timedTaskId + 1;
			} else {
				timedTask = false;
				taskId = taskId - 1;
			}

			obj.profile.updateTaskIdAndSchoolForUser(userId, taskId, schoolName, timedTask, 
				timedTaskId, streak + 1, callback);
		}
	});
}

//Call this method to get the current task for the user.
/* @EXPOSED */
TaskScheduler.prototype.getTaskPojoForUser = function(userId, callback) {
	var obj = this;
	this.profile.getUserProfilePojo(userId, function(err, result) {
		if (err) {
			callback(err);
		} else {
			var isTimedTask = result.isTimedTask();
			var applicationFormDate = result.getApplicationFormDate();
			var 
			var taskId;
			if(isTimedTask) {
				taskId = result.getTimedTaskId();
			} else {
				taskId = result.getTaskId();
			}
			obj.task.getTaskPojo(taskId, callback);
		}
	});
} 

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

module.exports = TaskScheduler;