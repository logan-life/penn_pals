const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);
const User = require('../schemas/User.js');

mongoose.set('useFindAndModify', false);
const db = 'mongodb+srv://admin:pennpals@cluster0.sf4c7.mongodb.net/login_test?retryWrites=true&w=majority';

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

//Successful login sets the user document to have lockout attempts as 0
test("POST /api/login success", async done => {
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
    const loginUser = await request.post("/api/login").send(loginData);
    // Check the data in the database
	const registeredUser = await User.findOne({username:"johndoe"});
    expect(registeredUser.attempts_with_wrong_password).toBe(0);
    done()
})

//Missing username does not affect number of incorrect attempts
test("POST /api/login success", async done => {
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
        username: "",
        password: "12345678"
	}
    const loginUser = await request.post("/api/login").send(loginData);
    // Check the data in the database
	const registeredUser = await User.findOne({username:"johndoe"});
    expect(registeredUser.attempts_with_wrong_password).toBe(0);
    done()
})

//Incorrect passwords increase incorrect attempt count
test("POST /api/login failure - user locked out", async done => {
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
    const incorrectLoginData = {
        username: "johndoe",
        password: "12345679"
    }
    let loginUser;
    loginUser = await request.post("/api/login").send(incorrectLoginData);
    loginUser = await request.post("/api/login").send(incorrectLoginData);
    loginUser = await request.post("/api/login").send(incorrectLoginData);
    // Check the data in the database
	const registeredUser = await User.findOne({username:"johndoe"});
    expect(registeredUser.attempts_with_wrong_password).toBe(3);
    done()
},10000)


test("GET /api/login", async done => { 
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
    const getUserData = await agent.get("/api/login");
    // Check the data in the database
	const registeredUser = await User.findOne({username:"johndoe"});
	expect(registeredUser.username).toBe("johndoe");
    done()
})
