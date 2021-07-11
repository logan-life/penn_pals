const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);
const User = require('../schemas/User.js');

mongoose.set('useFindAndModify', false);
//make sure to use a different database for each test (else another test might close the connection we need)
const db = 'mongodb+srv://admin:pennpals@cluster0.sf4c7.mongodb.net/changepwd_test?retryWrites=true&w=majority';

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

// API summary: Change password of a user
// test description: Ensuring that the password stored in the database is getting changed / not changed based on the data sent
test("PUT /api/changePassword", async done => { 
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
    const newPasswordData1 = {
        password: "12345678",
        newPassword: "12345679"
    }
    const newPasswordData2 = {
        password: "87654321",
        newPassword: "password"
    }
    const loginUser = await agent.post("/api/login").send(loginData);
    let registeredUser;
    registeredUser = await User.findOne({username:"johndoe"});
    const oldPassword = registeredUser.password;

    //send correct password data
    const getUserData1 = await agent.put("/api/changePassword").send(newPasswordData1);
    registeredUser = await User.findOne({username:"johndoe"});
    const newPassword1 = registeredUser.password;
    //current password has been changed
    expect(newPassword1).toEqual(expect.not.stringMatching(oldPassword));

    //send incorrect password data
    const getUserData2 = await agent.put("/api/changePassword").send(newPasswordData2);
    registeredUser = await User.findOne({username:"johndoe"});
    const newPassword2 = registeredUser.password;
    //current password has not been changed
    expect(newPassword2).toEqual(newPassword1);
    done()
})