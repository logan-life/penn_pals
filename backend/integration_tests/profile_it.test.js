const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);
const User = require('../schemas/User.js');

mongoose.set('useFindAndModify', false);
const db = 'mongodb+srv://admin:pennpals@cluster0.sf4c7.mongodb.net/profile_test?retryWrites=true&w=majority';

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

// @desc    Retrieves user info by the token from the cookie 
// @route   GET api/profile
// @access  Public
// Test-description: the user document retrieved is the user document in the database
test("GET /api/profile", async done => { 
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
    const getUserData = await agent.get("/api/profile");
	const registeredUser = await User.findOne({username:"johndoe"});
	expect(registeredUser.username).toBe("johndoe");
    done()
})

// @desc    Changes status of users account
// @route   PUT api/profile
// @access  Public
// Test-description: the user status has been modified to inactive in the database
test("PUT /api/profile correct password", async done => { 
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
    const setInactiveData = {
        password: "12345678"
    }
    const loginUser = await agent.post("/api/login").send(loginData);
    const getUserData = await agent.put("/api/profile").send(setInactiveData);
    const registeredUser = await User.findOne({username:"johndoe"});
	expect(registeredUser.active_status).toBe(false);
    done()
})

// @desc    Changes status of users account
// @route   PUT api/profile
// @access  Public
// Test-description: the user status remains active in the database
test("PUT /api/profile incorrect password", async done => { 
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
    const setInactiveData = {
        password: "12345679"
    }
    const loginUser = await agent.post("/api/login").send(loginData);
    const getUserData = await agent.put("/api/profile").send(setInactiveData);
    const registeredUser = await User.findOne({username:"johndoe"});
	expect(registeredUser.active_status).toBe(true);
    done()
})