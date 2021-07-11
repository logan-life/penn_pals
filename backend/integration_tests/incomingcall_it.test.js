const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);
const User = require("../schemas/User.js");

mongoose.set('useFindAndModify', false);
const db = 'mongodb+srv://admin:pennpals@cluster0.sf4c7.mongodb.net/incoming_test?retryWrites=true&w=majority';

beforeEach(async(done) => {
    try {
        await mongoose.connect(db, {useNewUrlParser: true, useFindAndModify:false, useCreateIndex:true, useUnifiedTopology:true },() => done());
        jest.setTimeout(30000);
     } catch (error) {
         console.error(error.message);
         process.exit(1);
     }
})

afterEach((done) => {
	mongoose.connection.db.dropDatabase(() => {
		mongoose.connection.close(() => done())
	})
})

//API summary: Polls the currentUser's userDocument for an incoming call
//Test description: Incoming call details in the database are confirmed to have been returned
test("GET /api/incomingcall", async done => { 
	const registrationData = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question:
          "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const registerUser = await request.post("/api/register").send(registrationData).expect(201);
    const loginData = {
        username: "johndoe",
        password: "12345678"
    }
    const loginUser = await agent.post("/api/login").send(loginData);
    const getCall = await agent.get("/api/incomingcall").send();
    const johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.incoming_call).toBe(getCall.body.incoming_call);
    done()
})


//API summary: Looks up the calleeName user document and saves the callerName string
//Test description: Incoming call details in the database are confirmed to have been updated
test("POST /api/incomingcall", async done => { 
    const currentUser = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const registerCurrentUser = await request.post("/api/register").send(currentUser);
    const contactToAdd = {
        firstname: "Jane",
        lastname: "Doe",
        username: "janedoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "janedoe@fakemail.com",
	}
    const registerContact = await request.post("/api/register").send(contactToAdd);
    const contactUsername = {
        contactToAdd:"janedoe",
        conversationSid:"001"
    }
    const johnLogin = {
        username: "johndoe",
        password: "12345678"
    }
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    const addContact = await agent.put("/api/contacts").send(contactUsername);
    const callDetails = {
        callerName: "johndoe",
        calleeName: "janedoe"
    }
    const getCall = await agent.post("/api/incomingcall").send(callDetails);
    const janeDocument = await User.findOne({username:"janedoe"});
    expect(janeDocument.incoming_call).toBe("johndoe");
    const getCallError = await agent.post("/api/incomingcall").send();
    done()
})


//API summary: Looks up the username's user document and clears the incoming_call field
//Test description: Incoming call details in the database are confirmed to have been cleared
test("DELETE /api/incomingcall", async done => { 
    const currentUser = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const registerCurrentUser = await request.post("/api/register").send(currentUser);
    const contactToAdd = {
        firstname: "Jane",
        lastname: "Doe",
        username: "janedoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "janedoe@fakemail.com",
	}
    const registerContact = await request.post("/api/register").send(contactToAdd);
    const contactUsername = {
        contactToAdd:"janedoe",
        conversationSid:"001"
    }
    const johnLogin = {
        username: "johndoe",
        password: "12345678"
    }
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    const addContact = await agent.put("/api/contacts").send(contactUsername);
    const callDetails = {
        callerName: "johndoe",
        calleeName: "janedoe"
    }
    const makeCall = await agent.post("/api/incomingcall").send(callDetails);
    const endCall = {
        userToClear: "janedoe"
    }
    const deleteCall = await agent.delete("/api/incomingcall").send(endCall);
    const janeDocument = await User.findOne({username:"janedoe"});
    expect(janeDocument.incoming_call).toBe("");
    const deleteCallError = await agent.delete("/api/incomingcall").send();
    done()
})