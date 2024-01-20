const Alexa = require('ask-sdk-core');
const Util = require('./util.js');
const mpdapi = require('mpd-api');
const config = {
  port: 6600,
  host: 'my.publicmpdhost.com',
  streaming: 'https://radio.publicmpdhost.com/'
};
const controlIntents = {
    'AMAZON.NextIntent' : "next",
    'AMAZON.PreviousIntent' : "prev",
    'AMAZON.ResumeIntent' : "play",
    'AMAZON.PauseIntent' : "pause",
    'AMAZON.StopIntent' : "stop"
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to my Jukebox. What would you like to do?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ControlIntentHandler = {
    canHandle(handlerInput) {
        const controlIntent = controlIntents[Alexa.getIntentName(handlerInput.requestEnvelope)]
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' && controlIntent !== undefined;
    },
    async handle(handlerInput) {
        const controlIntent = controlIntents[Alexa.getIntentName(handlerInput.requestEnvelope)]
        const client = await mpdapi.connect(config);
        const response = await client.api.playback[controlIntent]();
        await client.disconnect()

        return handlerInput.responseBuilder
            .addAudioPlayerPlayDirective('REPLACE_ALL', config.streaming, "1", 0)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const PlayAlbumIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayAlbum'
    },
    async handle(handlerInput) {

        const album = handlerInput.requestEnvelope.request.intent.slots.AlbumName.value;
        const query = "(Album contains '" + album + "')"

        const client = await mpdapi.connect(config);
        const tracks = await client.api.db.search(query)
        let speakOutput;

        if (tracks.length > 1) {
            await client.api.queue.clear();
            await client.api.db.searchadd(query)
            await client.api.playback.play();
            speakOutput = 'Playing the album ' + tracks[0].album;
        } else {
            speakOutput = "Couldn't find the album " + album;
        }
        await client.disconnect();

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const PlaySixMusicIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlaySixMusic'
    },
    async handle(handlerInput) {
        await playStream("http://stream.live.vc.bbcmedia.co.uk/bbc_6music")
        const speakOutput = 'Playing Six Music';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const PlayOneFMIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayOneFM'
    },
    async handle(handlerInput) {
        await playStream("http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one")
        const speakOutput = 'Playing BBC Radio One F M';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

async function playStream(stream) {
    const client = await mpdapi.connect(config);
    await client.api.queue.clear();
    await client.api.queue.add(stream)
    await client.api.playback.play();
    await client.disconnect();
}

const UnsupportedAudioIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOffIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOnIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOffIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOnIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent'
                );
    },
    async handle(handlerInput) {
        const speakOutput = 'Sorry, I can\'t support that yet.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say "play audio" to start playing music! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);
        console.log(`~~~~ Error Input: ${JSON.stringify(handlerInput)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ControlIntentHandler,
        PlayAlbumIntentHandler,
        PlaySixMusicIntentHandler,
        PlayOneFMIntentHandler,
        UnsupportedAudioIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('stengland/mpd-control-nodejs/v0.1')
    .lambda();
