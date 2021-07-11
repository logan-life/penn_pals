const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);
const User = require("../schemas/User.js");

mongoose.set('useFindAndModify', false);
const db = 'mongodb+srv://admin:pennpals@cluster0.sf4c7.mongodb.net/outgoing_test?retryWrites=true&w=majority';

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

//API summary: Determines if the callee has declined to answer a call request
//Test description: Outgoing call details in the database are confirmed to have been returned
test("GET /api/outgoingcall", async done => { 
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
    const registerUser = await request.post("/api/register").send(registrationData);
    const loginData = {
        username: "johndoe",
        password: "12345678"
    }
    const loginUser = await agent.post("/api/login").send(loginData);
    const getCall = await agent.get("/api/outgoingcall").send();
    const johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.outgoing_call_active).toBe(getCall.body.outgoing_call_active);
    done()
})

//API summary: Looks up the contact's user document and checks the online and outgoing_call_active fields
//Test description: Outgoing call details of the specified user in the database are confirmed to have been returned
test("POST /api/outgoingcall", async done => { 
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
    const getCall = await agent.post("/api/outgoingcall").send({contactName: "janedoe"});
    const johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.outgoing_call_active).toBe(getCall.body.outgoing_call_active);
    const getCallError = await agent.post("/api/outgoingcall").send();
    done()
})

//API summary: Sets currentUser's outgoing_call_active boolean to true
//Test description: Confirm that outgoing_call_active has been set to true in the database
test("PUT /api/outgoingcall", async done => { 
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
    const johnLogin = {
        username: "johndoe",
        password: "12345678"
    }
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    const setState = await agent.put("/api/outgoingcall").send({username:"johndoe"});
    const johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.outgoing_call_active).toBe(true);
    done()
})

//API summary: Sets currentUser's outgoing_call_active boolean to true
//Test description: Confirm that outgoing_call_active has been set to false in the database
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
    const johnLogin = {
        username: "johndoe",
        password: "12345678"
    }
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    const setState = await agent.delete("/api/outgoingcall").send({username:"johndoe"});
    const johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.outgoing_call_active).toBe(false);
    done()
})