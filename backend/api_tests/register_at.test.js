const app = require("../server")
const supertest = require('supertest')
const request = supertest(app)
const User = require('../schemas/User.js');
const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);
const db = 'mongodb+srv://admin:pennpals@cluster0.sf4c7.mongodb.net/reg_test?retryWrites=true&w=majority';

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

//Successful registration returns a 201 and the message "Success"
test("POST /api/register success", async done => {
	const regData = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question:
          "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
  }
  //Checking http status code
  const res = await request.post("/api/register").send(regData).expect(201);
  //Checking response
  expect(res.body.msg).toBe("Success");
  done()
})

//Validation error returns a 400
test("POST /api/register failure - validation error", async done => {
	const regData = {
        firstname: "John",
        lastname: "Doe",
        username: "",
        password: "12345678",
        security_question:
          "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
    }
    //validation error expected since username is empty
    const res = await request.post("/api/register").send(regData).expect(400);
    done()
})

//409 status code expected when we attempt to register a duplicate username
test("POST /api/register failure - user already exists", async done => {
	const regData = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question:
          "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
    }
    let res;
    res = await request.post("/api/register").send(regData);
    //409 expected since this is a duplicate registration
    res = await request.post("/api/register").send(regData).expect(409);
    done()
})


