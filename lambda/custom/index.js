/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

const RatingIntentHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'RatingIntent';
  },
  async handle(handlerInput){
    const intentName = handlerInput.requestEnvelope.request.intent.name;

    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
    const slotValues = getSlotValues(filledSlots);

    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    
    console.log("Rating Intent Handler: " + sessionAttributes);
    attributesManager.setPersistentAttributes(sessionAttributes);
    await attributesManager.savePersistentAttributes();

    let currentAssignment = sessionAttributes.currentAssignment;
    let ratingResponse;

    const reprompt = 'From one through five, how would you rate the ' + currentAssignment.school.name;

    if (slotValues.rating_number.value > 3 || slotValues.rating_sentiment.id > 3) {
        ratingResponse = 'Great! Sounds like you liked the ' + currentAssignment.school.name;
    } else if (slotValues.rating_number.value <= 3 || slotValues.rating_sentiment.id <= 3) {
        ratingResponse = 'Ok. We\'ll find better matches for you next time. ';
    } else {
        ratingResponse = 'Sorry, I\'m not sure what ' + slotValues.rating_sentiment.id
        + ' means. ' + reprompt;
    }

    ratingResponse += getNextSearchRefinement();

    return handlerInput.responseBuilder
      .speak(ratingResponse)
      .reprompt(reprompt)
      .getResponse();
  }
};

const InProgressProfileIntentHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ProfileIntent' &&
            handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput){
    const intentName = handlerInput.requestEnvelope.request.intent.name;
    //TODO: Echo the Slots
    return handlerInput.responseBuilder
      .speak('In Progress: ' + intentName)
      .reprompt('Reprompt Text')
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
    console.log(" Can Handle attributes Manager ");
    const sessionAttributes = attributesManager.getSessionAttributes();
    console.log("sessionAttributes from HasAssignment: " + JSON.stringify(sessionAttributes));

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

    //TODO: Create a Join Function for Adding Spaces between Sentence Fragments
    const speechOutput = getGreeting() + getStreak() + 'Your assignment from last time was to' + ' ' 
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

const RequestHandlerChainErrorHandler = {
  canHandle(handlerInput, error) {
    console.log('~~~~~~~~~')
    console.log(error.message)
    console.log('~~~~~~~~~')
    return error.message === 'RequestHandlerChain not found!';
  },
  handle(handlerInput, error) {
    console.log('Error handled: ' + error.message);

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
    console.log('Error handled: ' + error.message);

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
            isValidated: true
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            value: filledSlots[item].value,
            id: null,
            isValidated: false,
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
        isValidated: false
      };
    }
  }, this);

  return slotValues;
}

//** Interceptors */

const InitializeSession = {
  process (handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

      if (Object.keys(sessionAttributes).length === 0) {
          sessionAttributes.currentAssignment = {};
          sessionAttributes.currentAssignment.school = {name: "Colorado School of Mines"};
          sessionAttributes.currentAssignment.task = "look at ";
        }
        
        attributesManager.setSessionAttributes(sessionAttributes);
      } 
  }


const skillBuilder = Alexa.SkillBuilders.standard();

//TODO: streak system
//TODO: time-based assignment system with reprompts
//TODO: ratingIntentHandlers

exports.handler = skillBuilder
  .addRequestHandlers(
    RatingIntentHandler,
    InProgressProfileIntentHandler,
    CompleteProfileIntentHandler,
    DenyProfileIntentHandler,
    IntentReflectorHandler,
    HasAssignmentLaunchRequestHandler,
    LaunchRequestHandler
  )
  .addErrorHandlers(
    RequestHandlerChainErrorHandler,
    ErrorHandler
  )
  .withTableName('CollegeCoach_Cust')
  .withAutoCreateTable(true)
  .addRequestInterceptors(
    InitializeSession
  )
  .lambda();