/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

const Scorecard = require('./scorecard.js');
const States = require('./states.js');
const UserSchools = require('./userSchools.js');

const RatingIntentHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'RatingIntent';
  },
  async handle(handlerInput){
    const intentName = handlerInput.requestEnvelope.request.intent.name;

    console.log(intentName);

    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
    const slotValues = getSlotValues(filledSlots);

    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    attributesManager.setSessionAttributes(sessionAttributes);
    persistentAttributes = await attributesManager.getPersistentAttributes();

    let currentAssignment = sessionAttributes.currentAssignment;
    let ratingResponse;

    const reprompt = 'From one through five, how would you rate the ' + currentAssignment.school.name;

    userSchools = new UserSchools();

    const userId = handlerInput.requestEnvelope.context.System.user.userId;

    // TODO: move saving schools to where we assign a school/assignment
    // userSchools.saveSchoolsForUser(userId, [sessionAttributes.currentAssignment.school.name], function(err, result) {
    //  if(err) {
    //    console.log(err);
    //   } else {
    //     console.log('saveSchoolsForUser', result);
    //   }      
    // });

    let isValidRating = true;

    console.log('slot values: ', JSON.stringify(slotValues));
    console.log('rating number <= 3', slotValues.rating_number.value <= 3);
    console.log('rating sentiment id <= 3',slotValues.rating_sentiment.id <= 3);

    if (slotValues.rating_number.value > 3 || slotValues.rating_sentiment.id > 3) {
        ratingResponse = 'Great! Sounds like you liked the ' + currentAssignment.school.name;
    } else if (slotValues.rating_number.value <= 3 || ( slotValues.rating_sentiment.isValidated && slotValues.rating_sentiment.id <= 3)) {
        ratingResponse = 'Ok. We\'ll find better matches for you next time. ';
    } else {
        let misunderstoodValue = 'that'
        if (!slotValues.rating_sentiment.isValidated) {
          misunderstoodValue = slotValues.rating_sentiment.value;
        }

        ratingResponse = 'Sorry, I\'m not sure what ' + misunderstoodValue
        + ' means. ' + reprompt;

        isValidRating = false;
    }

    if (isValidRating) {
      let rating = slotValues.rating_number.value;
      if(!rating) {
        rating = slotValues.rating_sentiment.id;
      }
  
      rating = parseInt(rating);
      
      console.log('userId:', userId);
  
      console.log('school assignment:', sessionAttributes.currentAssignment.school.name);
  
      userSchools.updateRatingForSchool(userId, sessionAttributes.currentAssignment.school.name, rating, function(err, result) {
        if(err) {
          console.log(err);
        } else {
          console.log('updateRatingForSchool',result);
        }
      } );
      
      // TODO: add sentence join function
      ratingResponse += ' ' + getNextSearchRefinement();
    }

    return handlerInput.responseBuilder
      .speak(ratingResponse)
      .reprompt(reprompt)
      .getResponse();
  }
};

// const CFIRAboutSchoolIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'CanFulfillIntentRequest'
//       && handlerInput.requestEnvelope.request.intent.name === 'AboutSchoolIntent'
//   },
//   handle(handlerInput) {
//     console.log("in CFIRAboutSchoolIntentHandler");
//     const slotValues = getSlotValues(handlerInput.requestEnvelope.request.intent.slots);

//     console.log('slot values:', JSON.stringify(slotValues));
//     const school = slotValues.school;

//     console.log("school", school.value);

//     console.log('isValidated', school.isValidated);

//     if (school.isValidated) {
//       console.log('valid!!');
//       handlerInput.responseBuilder
//       .withCanFulfillIntent({
//         "canFulfill": "YES",
//         "slots": {
//           "school": {
//             "canUnderstand": "YES",
//             "canFulfill": "YES"
//           }
//         }
//       });
//     } else {
//       console.log('invalid');
//       handlerInput.responseBuilder
//         .withCanFulfillIntent({
//           "canFulfill": "YES",
//           "slots": {
//             "school": {
//               "canUnderstand": "NO",
//               "canFulfill": "MAYBE"
//             }
//           }
//         });
//     }

//     console.log('response: ', JSON.stringify(handlerInput.responseBuilder.getResponse()));

//     return handlerInput.responseBuilder
//         //.speak("About School Intent " + school)
//         .getResponse();
//   }
// };

const AboutSchoolIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      || handlerInput.requestEnvelope.request.type === 'CanFulfillIntentRequest')
      && handlerInput.requestEnvelope.request.intent.name === 'AboutSchoolIntent'
  },
  async handle(handlerInput) {
    console.log('AboutSchoolIntentHandler');
    
    // const response = disambiguateSlot(handlerInput);

    // if (response) {
    //   return response;
    // }

    const slotValues = getSlotValues(handlerInput.requestEnvelope.request.intent.slots);

    const attributesManager = handlerInput.attributesManager;
    let attributes = attributesManager.getSessionAttributes();
    attributes.slotValues = slotValues;
    attributesManager.setSessionAttributes(attributes);

    const school = slotValues.school;

    var parameterMap = {
      'school.name' : school.value,
      'school.operating' : '1' ,
    };
    const scorecard = new Scorecard();
    
    let speechOutput = await scorecard.getSchoolInformation(parameterMap).then(function(jsonResponse) {

      console.log('response:', JSON.stringify(jsonResponse));

      // TODO: sort the array of results based upon 2015.student.size
      // TODO: In our training data for every item that has a dash, add a top level entry for a flavor with no dash.

      let schoolName = jsonResponse.results[0]['school.name'].split('-')[0];
      let schoolCity = jsonResponse.results[0]['school.city'];
      let schoolState = States[jsonResponse.results[0]['school.state']];
      let schoolSize = jsonResponse.results[0]['2015.student.size'];
      let schoolCompletionRate = Math.round(jsonResponse.results[0]['2015.completion.rate_suppressed.overall'] * 100);
      let schoolAvgNetPrice = Math.round(jsonResponse.results[0]['2015.cost.avg_net_price.overall'] / 1000) * 1000;

      let speechOutput = schoolName + " is located in " + schoolCity + ', ' + schoolState + '. ';
      speechOutput += schoolCompletionRate + '% of students complete their degree. With an annual cost of $';
      speechOutput += schoolAvgNetPrice + '.';

      console.log('AboutSchoolIntent:', schoolName, schoolCity, schoolState, schoolSize, schoolCompletionRate, schoolAvgNetPrice);

      return speechOutput;
    });

    return handlerInput.responseBuilder
    .speak(speechOutput)
    .getResponse();
  }
};

const InProgressProfileIntentHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ProfileIntent' &&
            handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
  },
  async handle(handlerInput){
    const intentName = handlerInput.requestEnvelope.request.intent.name;

    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
    const slotValues = getSlotValues(filledSlots);

    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    attributesManager.setSessionAttributes(sessionAttributes);
    persistentAttributes = await attributesManager.getPersistentAttributes();

    let profile = sessionAttributes.profile;

    //TODO: Loop through slotValues object to add key,value to profile.searchRefinement

    for(key in slotValues) {
      console.log('~~~~~~~~~~~~~~~~SLOT~~~~~~~~~~~~~~');
      console.log(key);
      console.log(slotValues[key]);
      if (slotValues[key].id) {
        // save the attribute
      }
    }
    //TODO: Save/PersistentAttributes
    //TODO: Update Search based on new searchRefinements
    //TODO: Prompt with next school + task

    let speechOutput;
    let reprompt;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  }
};

const CompleteProfileIntentHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ProfileIntent' &&
            handlerInput.requestEnvelope.request.dialogState === 'COMPLETED' &&
            handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
  },
  handle(handlerInput){
    const intentName = handlerInput.requestEnvelope.request.intent.name;
    //TODO: Echo the Slots
    //[Greeting]. Here’s your next assignment, [School]. [School Fact]. Today, evaluate the [Assigned Task]. [Direction].
    return handlerInput.responseBuilder
      .speak('Complete: ' + intentName)
      .getResponse();
  }
};

const DenyProfileIntentHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ProfileIntent' &&
            //handlerInput.requestEnvelope.request.dialogState === 'COMPLETED' &&
            handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
  },
  handle(handlerInput){
    const intentName = handlerInput.requestEnvelope.request.intent.name;
    //TODO: Echo the Slots
    return handlerInput.responseBuilder
      .speak('Denied: ' + intentName)
      .reprompt('Reprompt Text')
      .getResponse();
  }
};

const IntentReflectorHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'IntentRequest';
  },
  handle(handlerInput){
    const intentName = handlerInput.requestEnvelope.request.intent.name;
    return handlerInput.responseBuilder
      .speak(intentName)
      .getResponse();
  }
};

const HasAssignmentLaunchRequestHandler = {
  canHandle(handlerInput){
    const attributesManager = handlerInput.attributesManager;
    // console.log(" Can Handle attributes Manager ");
    const sessionAttributes = attributesManager.getSessionAttributes();
    // console.log("sessionAttributes from HasAssignment: " + JSON.stringify(sessionAttributes));

    return handlerInput.requestEnvelope.request.type === 'LaunchRequest' &&
            sessionAttributes &&
            sessionAttributes.currentAssignment &&
            sessionAttributes.currentAssignment.school;
  },
  handle(handlerInput){
    console.log("Yes this works!");
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    let currentAssignment = sessionAttributes.currentAssignment;
    var parameterMap = {
      'school.state' : 'CO',
      'school.operating' : '1' ,
      '2015.academics.program.degree.engineering' : '1',
      '2015.academics.program_available.assoc_or_bachelors' : 'true'
    };
    const scorecard = new Scorecard();
    
    scorecard.listAllSchools(parameterMap).then(function(jsonResponse) {
      console.log(JSON.stringify(jsonResponse));
    });

    console.log('HasAssignmentLaunchRequestHandler:', JSON.stringify(currentAssignment.school));

    //TODO: Create a Join Function for Adding Spaces between Sentence Fragments
    let speechOutput = getGreeting() + getStreak() + 'Your assignment from last time was to' + ' ' 
                        + currentAssignment.task +  ' ' + currentAssignment.school.name + '. ';
    //TODO: Make this Random
    const ratingPrompt = 'On a scale of one through five, what did you think?';                   
    const reprompt = currentAssignment.prompt;

    speechOutput += ratingPrompt;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest' ;
  },
  handle(handlerInput){
    const requestType = handlerInput.requestEnvelope.request.type;
    return handlerInput.responseBuilder
      .speak(requestType)
      .getResponse();
  }
};

const SessionEndedReflectorHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput){
    const requestType = handlerInput.requestEnvelope.request.type;
    const sessionEndedReason = handlerInput.requestEnvelope.request.reason;
    console.log('~~~~~~~~~~~~~~~~~~~');
    console.log(requestType+ ' '+sessionEndedReason);
    console.log('~~~~~~~~~~~~~~~~~~~');
  }
};

const CFIRError = {
  canHandle(handlerInput, error) {
    return handlerInput.requestEnvelope.request.type === 'CanFulfillIntentRequest';
  },
  handle(handlerInput, error) {
    console.log('CFIRError', error.message);
    return handlerInput.responseBuilder
      .withCanFulfillIntent({
        "canFulfill": "NO",
        "slots": {
          "school": {
            "canUnderstand": "NO",
            "canFulfill": "NO"
          }
        }
      })
      .getResponse();
  }
};

const CFIRResponseInterceptor = {
  process(handlerInput) {

    console.log('in CFIRResponseInterceptor');

    console.log('type:', handlerInput.requestEnvelope.request.type);
    //console.log('intent:', handlerInput.requestEnvelope.request.intent.name)


    if (handlerInput.requestEnvelope.request.type === 'CanFulfillIntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AboutSchoolIntent') {
      const attributesManager = handlerInput.attributesManager;
      const attributes = attributesManager.getSessionAttributes();

      if (!attributes.slotValues) {
        console.log('no slots');
        handlerInput.responseBuilder
          .withCanFulfillIntent({
            "canFulfill": "NO",
            "slots": {
              "school": {
                "canUnderstand": "NO",
                "canFulfill": "NO"
              }
            }
          });
      } else {
        console.log('have slots');
        let canFulfillIntent = {
          "canFulfill": "YES",
          "slots": {

          }
        };
        const slotValues = attributes.slotValues;
        for (slot in slotValues) {
          canFulfillIntent.slots[slot] = {
            "canUnderstand": slotValues[slot].canUnderstand,
            "canFulfill": slotValues[slot].canFulfill
          }
        }
        handlerInput.responseBuilder.withCanFulfillIntent(canFulfillIntent);
      }
      return handlerInput.responseBuilder.getResponse();
    }
  }
};

const RequestHandlerChainErrorHandler = {
  canHandle(handlerInput, error) {
    console.log('~~~~~~~~~')
    console.log(error.message)
    console.log('~~~~~~~~~')
    return error.message === 'RequestHandlerChain not found!';
  },
  handle(handlerInput, error) {
    console.log('Error handled: ' + error.message 
      + ' intent: ' + (handlerInput.requestEnvelope.request.type == 'IntentRequest' ? handlerInput.requestEnvelope.request.intent.name : "LaunchRequest" ) );

    return handlerInput.responseBuilder
      .speak('Oops! Looks like you forgot to register a handler again')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log('Error handled: '  
    + ' intent: ' + (handlerInput.requestEnvelope.request.type == 'IntentRequest' ? handlerInput.requestEnvelope.request.intent.name : "LaunchRequest" ) 
    + ' message: ' + error.message
  );

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

//** Helper Functions */

function getGreeting() {
  return "Welcome back! ";
};

function getStreak(){
  return "Love the dedication! ";
};

function getNextSearchRefinement() {
  const data = [
      'Do you think you would prefer a small, medium, or large school? ',
      'Would you prefer a rural, suburban, or urban campus setting? ',
      'This is a placeholder for another refinement? ',
      'This is another placeholder for ANOTHER refinement? '
    ];
  
  return data[0];
};

//** Cookbook */

function disambiguateSlot(handlerInput) {
  let currentIntent = handlerInput.requestEnvelope.request.intent;
  for (const slotName in currentIntent.slots) {
    if (Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
      const currentSlot = currentIntent.slots[slotName];
      if (currentSlot.confirmationStatus !== 'CONFIRMED'
        && currentSlot.resolutions
        && currentSlot.resolutions.resolutionsPerAuthority[0]) {
        if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
          if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
            prompt = 'Which would you like';
            const length = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;

            currentSlot.resolutions.resolutionsPerAuthority[0].values
              .forEach((element, index) => {
                prompt += ` ${(index === length - 1) ? ' or' : ' '} ${element.value.name}`;
              });

            prompt += '?';

            return handlerInput.responseBuilder
              .speak(prompt)
              .reprompt(prompt)
              
              .getResponse();
          }
        } else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
          if (requiredSlots.indexOf(currentSlot.name) > -1) {
            prompt = `What ${currentSlot.name} are you looking for`;

            return handlerInput.responseBuilder
              .speak(prompt)
              .reprompt(prompt)
              .getResponse();
          }
        }
      }
    }
  } 
  return null;
}

function getSlotValues(filledSlots) {
  const slotValues = {};

  console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            value: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            id: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.id,
            isValidated: true,
            canUnderstand: "YES",
            canFulfill: "YES",
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            value: filledSlots[item].value,
            id: null,
            isValidated: false,
            canUnderstand: "NO",
            canFulfill: "MAYBE",            
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        value: filledSlots[item].value,
        id: filledSlots[item].id,
        isValidated: false,
        canUnderstand: "NO",
        canFulfill: "NO",        
      };
    }
  }, this);

  return slotValues;
}

//** Interceptors */

const InitializeSession = {
  async process (handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

      if (Object.keys(sessionAttributes).length === 0) {
        sessionAttributes.profile = {};
          sessionAttributes.profile.counter = 1;

          //https://collegescorecard.ed.gov/search/?major=engineering_technology&state=CO&sort=advantage:desc
          sessionAttributes.profile.searchRefinements = { 
                                                          major: 'engineering_technology',
                                                          state: 'CO'
                                                        }

          sessionAttributes.currentAssignment = {};
          sessionAttributes.currentAssignment.school = {
                                                          name: "Colorado School of Mines"
                                                       };
          sessionAttributes.currentAssignment.task = "look at ";
        }
        

      } 
  }

const skillBuilder = Alexa.SkillBuilders.standard();

//TODO: streak system
//TODO: time-based assignment system with reprompts
//TODO: ratingIntentHandlers

exports.handler = skillBuilder
  .addRequestHandlers(
    RatingIntentHandler,
    //CFIRAboutSchoolIntentHandler,
    AboutSchoolIntentHandler,
    InProgressProfileIntentHandler,
    CompleteProfileIntentHandler,
    DenyProfileIntentHandler,
    IntentReflectorHandler,
    HasAssignmentLaunchRequestHandler,
    LaunchRequestHandler
  )
  .withTableName('CollegeCoach_Cust')
  .withAutoCreateTable(true)
  .addErrorHandlers(
    CFIRError,
    RequestHandlerChainErrorHandler,
    ErrorHandler
  )
  .addRequestInterceptors(
    InitializeSession,
  )
  .addResponseInterceptors(
    CFIRResponseInterceptor,
  )
  .lambda();