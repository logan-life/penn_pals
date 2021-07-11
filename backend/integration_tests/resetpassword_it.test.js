const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);
const User = require('../schemas/User.js');

mongoose.set('useFindAndModify', false);
const db = 'mongodb+srv://admin:pennpals@cluster0.sf4c7.mongodb.net/resetpassword_test?retryWrites=true&w=majority';

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

//The security question 
test("POST /api/resetPassword correct username", async done => { 
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
    const resetData = {
        user: "johndoe",
    }
    const loginUser = await agent.post("/api/resetPassword").send(resetData);
    registeredUser = await User.findOne({username:"johndoe"});
    expect(loginUser.body.security_question).toBe(registeredUser.security_question);
    done()
})

//The new password in the database should not match the old password
test("PUT /api/resetPassword correct answer", async done => { 
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
    let registeredUser;
    registeredUser = await User.findOne({username:"johndoe"});
    const oldPassword = registeredUser.password;
    const resetData = {
        password: "12345678",
        answer: "January 2000",
        user: "johndoe",
    }
    //Password is now reset
    const changePassUser = await agent.put("/api/resetPassword").send(resetData);
    registeredUser = await User.findOne({username:"johndoe"});
    const newPassword = registeredUser.password;
    //New password does not match old password
    expect(newPassword).toEqual(expect.not.stringMatching(oldPassword));
    done()
})
