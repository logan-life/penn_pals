const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);

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

//Successful login returns a 200 and a token in the response body (in addition to setting a http cookie)
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
    //successful login returns a 200 and a token
    const loginUser = await request.post("/api/login").send(loginData).expect(200);
    expect(loginUser).toBeTruthy();
    done()
})

//Validation errors return a 400
test("POST /api/login failure - incorrect attempts", async done => {
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
    const nopasswordLoginData = {
        username: "johndoe",
        password: ""
    }
    const nousernameLoginData = {
        username: "",
        password: "12345678"
    }
    const incorrectusernameLoginData = {
        username: "johnroe",
        password: "12345678"
    }
    const incorrectpasswordLoginData = {
        username: "johnroe",
        password: "12345678"
    }
    let loginUser;
    //Password field is blank
    loginUser = await request.post("/api/login").send(nopasswordLoginData).expect(400);
    //Username field is blank
    loginUser = await request.post("/api/login").send(nousernameLoginData).expect(400);
    //Username does not exist
    loginUser = await request.post("/api/login").send(incorrectusernameLoginData).expect(400);
    //Password is incorrect
    loginUser = await request.post("/api/login").send(incorrectpasswordLoginData).expect(400);
    done()
})

//3 incorrect passwords lock out a user
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
    const correctLoginData = {
        username: "johndoe",
        password: "12345678"
    }
    let loginUser;
    //3 incorrect attempts
    loginUser = await request.post("/api/login").send(incorrectLoginData).expect(400);
    loginUser = await request.post("/api/login").send(incorrectLoginData).expect(400);
    loginUser = await request.post("/api/login").send(incorrectLoginData).expect(400);
    //user locked out after 3 incorrect attempts
    expect(loginUser.body.errors[0].msg).toBe("That's 3 attempts - you're locked out. Wait 5mins before trying again");
    //user locked out - so correct attempt fails and results in extension of lockout
    loginUser = await request.post("/api/login").send(correctLoginData).expect(400);
    expect(loginUser.body.errors[0].msg).toBe('Please wait 5 mins from now before attempting to log in again');
    done()
},10000)

//Successful request returns a 200 and the user document
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
    const getUserData = await agent.get("/api/login").expect(200);
    //Correct user document is returned
    expect(getUserData.body.username).toBe("johndoe");
    done()
})

//Login attempt without a valid httpCookie/token returns a 401
test("GET /api/login - unauthorized", async done => { 
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
    //Note the user of request instead of agent here - ensures that the correct user document is being returned    
    const getUserData = await request.get("/api/login").expect(401);
    done()
})