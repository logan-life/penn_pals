const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);

mongoose.set('useFindAndModify', false);
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
// test description: Ensuring that a correct API call returns a 200 and an incorrect call returns a 400
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
        password: "12345678",
        newPassword: "12345679"
    }
    const loginUser = await agent.post("/api/login").send(loginData);
    //current password is correct
    const getUserData1 = await agent.put("/api/changePassword").send(newPasswordData1).expect(200);
    //current password is incorrect
    const getUserData2 = await agent.put("/api/changePassword").send(newPasswordData2).expect(400);
    expect(getUserData2.text).toEqual('Incorrect current password');
    done()
})