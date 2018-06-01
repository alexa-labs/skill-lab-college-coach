'use strict'
/**
 * This pojo is used a model object for user profile.
 * @author: ankjain
 */

 //Constructor
function UserProfilePojo(userId, applicationFormDate, taskId, 
    currentSchoolName, timedTask, timedTaskId, streak) {
    this.userId = userId;
    this.applicationFormDate = applicationFormDate;
    this.taskId = taskId;
    this.currentSchoolName = currentSchoolName;
    this.timedTask = timedTask;
    this.timedTaskId = timedTaskId;
    this.streak = streak;
}

//Setters
UserProfilePojo.prototype.setUserId = function(userId) {
    this.userId = userId;
} 
UserProfilePojo.prototype.setApplicationFormDate = function(applicationFormDate) {
    this.applicationFormDate = applicationFormDate;
} 
UserProfilePojo.prototype.setTaskId = function(taskId) {
    this.taskId = taskId;
} 
UserProfilePojo.prototype.setCurrentSchoolName = function(currentSchoolName) {
    this.currentSchoolName = currentSchoolName;
}
UserProfilePojo.prototype.settimedTask = function(timedTask) {
    this.timedTask = timedTask;
}
UserProfilePojo.prototype.setTimedTaskId = function(timedTaskId) {
    this.timedTaskId = timedTaskId;
}
UserProfilePojo.prototype.setStreak = function(streak) {
    this.streak = streak;
}

//Getters
UserProfilePojo.prototype.getUserId = function() {
    return this.userId;
} 
UserProfilePojo.prototype.getApplicationFormDate = function() {
    return this.applicationFormDate;
} 
UserProfilePojo.prototype.getTaskId = function() {
    return this.taskId;
} 
UserProfilePojo.prototype.getCurrentSchoolName = function() {
    return this.currentSchoolName;
} 
UserProfilePojo.prototype.isTimedTask = function() {
    return this.timedTask;
}
UserProfilePojo.prototype.getTimedTaskId = function() {
    return this.timedTaskId;
}
UserProfilePojo.prototype.getStreak = function() {
    return this.streak;
}

module.exports = UserProfilePojo;