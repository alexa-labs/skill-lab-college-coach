'use strict'
/**
 * This pojo is used a model object for task.
 * @author: ankjain
 */

 //Constructor
function TaskPojo(taskId, taskMessage, rePrompt, proximity, timedTask) {
    this.taskId = taskId;
    this.taskMessage = taskMessage;
    this.rePrompt = rePrompt;
    this.proximity = proximity;
    this.timedTask = timedTask;
}

//Setters
TaskPojo.prototype.setTaskId = function(taskId) {
    this.taskId = taskId;
} 
TaskPojo.prototype.setTaskMessage = function(taskMessage) {
    this.taskMessage = taskMessage;
} 
TaskPojo.prototype.setRePrompt = function(rePrompt) {
    this.rePrompt = rePrompt;
} 
TaskPojo.prototype.setProximity = function(proximity) {
    this.proximity = proximity;
} 
TaskPojo.prototype.settimedTask = function(timedTask) {
    this.timedTask = timedTask;
}
//Getters
TaskPojo.prototype.getTaskId = function() {
    return this.taskId;
} 
TaskPojo.prototype.getTaskMessage = function() {
    return this.taskMessage;
} 
TaskPojo.prototype.getRePrompt = function() {
    return this.rePrompt;
} 
TaskPojo.prototype.getProximity = function() {
    return this.proximity;
} 
TaskPojo.prototype.isTimedTask = function() {
    return this.timedTask;
}

module.exports = TaskPojo;