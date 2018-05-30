# Mock Data Tables

### Profile Table
Customer Specific Data

```
userId: string (HashKey)
currentAssignment.taskId: number
currentAssignment.school: string
currentAssignment.timedTask: boolean
currentAssignment.timedTaskId: number
searchRefinements[0]: object (paramKey, paramValue, slotName, refinementId)
streak: number
applicationDate: number
```

### Task Table
Meta Information about each task

```
taskId: number (HashKey)
reprompt: string
taskMessage: string
```

### Timed Table
Meta Time sensitive tasks e.g.: SATs, submission dates

```
timedTask: boolean
timedTaskId: number (HashKey)
taskMessage: string
reprompt: string
```

### Ratings Table
Customer Specific entries on schools that have been reviewed

```
userId: string (HashKey)
schoolRatingsMap[0].school: string
schoolRatingsMap[0].averageRating: number
schoolRatingsMap[0].lastRatingDate: number
```

### Search Refinement Table
Meta refinements to help surface schools based on customer preference

```
refinementId: string (HashKey)
message: string
```

