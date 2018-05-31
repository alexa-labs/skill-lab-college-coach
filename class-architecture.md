# Class Architecture
This readme includes the high level architecture of the application.

## User Profile Class
Manipulate a User specific profile.

```
getUserProfile(userId, callback)
saveUserProfile(userId, profile object, callback)
```

## User Schools Class
Save and retrieve a list of schools, their respective ratings for a particular user.

```
saveSchoolsForUser(userId, list of schools, callback)
updateRatingForSchool(userId, school name, rating, callback)
getRatingForSchool(userId, school name, orderby, limit, callback)
getSchoolsByRating(userId, orderby, limit, rating, callback)
getNextSchoolForUser(userId, callback)
deleteSchoolsForUser(userId, callback)
```

## Search Refinements Class
Save and retrieve a list of search refinements for a particular user.

```
getNextRefinementForUser(userId, callback)
deleteRefinementsForUser(userId, callback)
```

## User Tasks Class
Interface with tasks that are not on a strict time e.g. "Check out the Social Life at..."

```
getRandomTask(callback)
```

## Scheduled Tasks Class
Interface with tasks that are scheduled based on a timedTaskId

```
getScheduledTaskMessage(timedTaskId, callback)
getNextScheduledTask(timedTaskId, callback)
```



#### Notes
* Activerecord Design Pattern from Ruby on Rails is something to consider for the design of these classes.
* Observer/Mediator