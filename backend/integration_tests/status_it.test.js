const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);
const User = require('../schemas/User.js');
const fsPromises = require('fs').promises; 

mongoose.set('useFindAndModify', false);
const db = 'mongodb+srv://admin:pennpals@cluster0.sf4c7.mongodb.net/status_test?retryWrites=true&w=majority';

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

//API summary: Uploads a status or replaces the existing status for a new user
//test description: Checks whether an uploaded status can be seen in the database
test("PUT /api/status - text status", async done => { 
	const registrationData = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const registerUser = await request.post("/api/register").send(registrationData);
    const loginData = {
        username: "johndoe",
        password: "12345678"
    }
    const loginUser = await agent.post("/api/login").send(loginData);
    const getUserStatus = await agent.put("/api/status").field('type','text').field('text','Busy').field('url','');
    const registeredUser = await User.findOne({username:"johndoe"});
    //Checking if the status is updated in the database
    expect(registeredUser.status.text).toBe("Busy");
    done()
})

//API summary: Uploads a status or replaces the existing status for a new user
//test description: Checks whether an uploaded image status can be seen in the database
test("PUT /api/status - image upload", async done => { 
	const registrationData = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const registerUser = await request.post("/api/register").send(registrationData);
    const loginData = {
        username: "johndoe",
        password: "12345678"
    }
    const loginUser = await agent.post("/api/login").send(loginData);
    const filename = './/integration_tests//small.jpg'
    const testFile = await fsPromises.readFile(filename);
    const getUserStatus = await agent.put("/api/status").field('type','image').attach('image',testFile,{ filename: 'small.jpg' }).field('text','').field('url','');
    const registeredUser = await User.findOne({username:"johndoe"});
    const status = await registeredUser.status;
    expect(registeredUser.status.type).toBe('image');
    done()
})

//API summary: Uploads a status or replaces the existing status for a new user
//test description: Checks whether statuses fetched match the ones in the database
test("GET /api/status", async done => { 
	const John = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const registerJohn = await request.post("/api/register").send(John);
    const Jane = {
        firstname: "Jane",
        lastname: "Doe",
        username: "janedoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "janedoe@fakemail.com",
	}
    const registerJane = await request.post("/api/register").send(Jane);
    const Anne = {
        firstname: "Anne",
        lastname: "Doe",
        username: "annedoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "janedoe@fakemail.com",
	}
    const registerAnne = await request.post("/api/register").send(Anne);
    const janeLogin = {
        username: "janedoe",
        password: "12345678"
    }
    const loginJane = await agent.post("/api/login").send(janeLogin);
    const janeStatus = {
        type:"text",
        text:"This is Jane",
        image:"",
        url:""
    }
    const setJaneStatus = await agent.put("/api/status").send(janeStatus);
    const anneLogin = {
        username: "annedoe",
        password: "12345678"
    }
    const loginAnne = await agent.post("/api/login").send(anneLogin);
    const anneStatus = {
        type:"text",
        text:"This is Anne",
        image:"",
        url:""
    }
    const setAnneStatus = await agent.put("/api/status").send(anneStatus);
    const janeContact = {
        contactToAdd:"janedoe",
        conversationSid:"002"
    }
    const anneContact = {
        contactToAdd:"annedoe",
        conversationSid:"002"
    }
    const johnLogin = {
        username: "johndoe",
        password: "12345678"
    }
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    const addContactJane = await agent.put("/api/contacts").send(janeContact);
    const addContactAnne = await agent.put("/api/contacts").send(anneContact);
    const getStatus = await agent.get("/api/status").send();
    const registeredUser = await User.findOne({username:"janedoe"});
    //converting the database output to string
    const id = registeredUser.status._id+'';
    expect(getStatus.body[1]._id).toEqual(id);
    done()
})
