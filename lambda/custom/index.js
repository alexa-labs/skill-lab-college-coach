/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

const InProgressRatingIntentHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'RatingIntent' &&
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

const CompleteRatingIntentHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'RatingIntent' &&
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

const LaunchRequestHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
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
    console.log('Error handled: ${error.message}');

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
    console.log('Error handled: ${error.message}');

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();

//TODO: streak system
//TODO: time-based assignment system with reprompts
//TODO: ratingIntentHandlers

exports.handler = skillBuilder
  .addRequestHandlers(
    InProgressRatingIntentHandler,
    CompleteRatingIntentHandler,
    InProgressProfileIntentHandler,
    CompleteProfileIntentHandler,
    DenyProfileIntentHandler,
    IntentReflectorHandler,
    LaunchRequestHandler
  )
  .addErrorHandlers(
    RequestHandlerChainErrorHandler,
    ErrorHandler
  )
  .lambda();