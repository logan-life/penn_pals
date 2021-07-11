const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);
const User = require("../schemas/User.js");

mongoose.set('useFindAndModify', false);
const db = 'mongodb+srv://admin:pennpals@cluster0.sf4c7.mongodb.net/contactsuggest_test?retryWrites=true&w=majority';

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

//API summary: Get a contact suggestion
//Test description: When there are 2 users in the app, and one of them is logged in and has no contacts, we get a 200 and the other user returned as a suggestion
test("GET /api/contactsuggest - 1 contact to suggest", async done => { 
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
    const johnLogin = {
        username: "johndoe",
        password: "12345678"
    }
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    const getContactSuggestion = await agent.get("/api/contactsuggest").send().expect(200);
    //Jane Doe is the other user in the app and is returned as a contact suggestion
    expect(getContactSuggestion.body.username).toBe("janedoe")
    done()
})

//API summary: Get a contact suggestion
//Test description: When there is 1 user in the app, we get a 200 and no contact suggestion
test("GET /api/contactsuggest - no contact to suggest", async done => { 
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
    const getContactSuggestion = await agent.get("/api/contactsuggest").send().expect(200);
    //There is no contact to suggest
    expect(getContactSuggestion.body.username).toBe("");
    done()
})
