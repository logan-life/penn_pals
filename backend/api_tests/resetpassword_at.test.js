const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);

mongoose.set('useFindAndModify', false);
//make sure to use a different database for each test (else another test might close the connection we need)
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
    //sending the correct username returns and 200 and the appropriate security question
    const loginUser = await agent.post("/api/resetPassword").send(resetData).expect(200);
    expect(loginUser.body.security_question).toBe("What is your oldest sibling’s birthday month and year? (e.g., January 1900)");
    done()
})

test("POST /api/resetPassword incorrect username", async done => { 
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
        user: "johnsmith",
    }
    //sending an incorrect username results in a 400 and the message, this user is not registered
    const loginUser = await agent.post("/api/resetPassword").send(resetData).expect(400);
    expect(loginUser.text).toBe('This user is not registered');
    done()
})

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
    const registerUser = await request.post("/api/register").send(registrationData).expect(201);
    const resetData = {
        password: "12345678",
        answer: "January 2000",
        user: "johndoe",
    }
    //sending a correct answer results in a 200
    const loginUser = await agent.put("/api/resetPassword").send(resetData).expect(200);
    done()
})

test("PUT /api/resetPassword incorrect answer", async done => { 
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
        password: "12345678",
        answer: "January 2001",
        user: "johndoe",
    }
    //sending an incorrect answer results in a 400 and an error message
    const loginUser = await agent.put("/api/resetPassword").send(resetData).expect(400);
    expect(loginUser.text).toBe('Incorrect answer to security answer');
    done()
})

test("PUT /api/resetPassword incorrect answer", async done => { 
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
        password: "12345678",
        answer: "January 2001",
        user: "johnsmith",
    }
    //if user doesn't exist we have a server error
    const loginUser = await agent.put("/api/resetPassword").send(resetData).expect(500);
    expect(loginUser.text).toBe('Server Error');
    done()
})