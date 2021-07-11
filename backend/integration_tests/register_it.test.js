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

//Successful registration saves a user document into the database
test("POST /api/register success", async done => {
	const data = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question:
          "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const res = await request.post("/api/register").send(data);
    // Check the data in the database
	const registeredUser = await User.findOne({username:"johndoe"});
	expect(registeredUser).toBeTruthy();
    expect(registeredUser.username).toBe(data.username);
    done()
})

//Unsuccessful registration does not save a user document into the database
test("POST /api/register success", async done => {
	const data = {
        firstname: "John",
        lastname: "Doe",
        username: "",
        password: "12345678",
        security_question:
          "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const res = await request.post("/api/register").send(data);
    // Check the data in the database
	const registeredUser = await User.findOne({username:"johndoe"});
	expect(registeredUser).toBeFalsy();
    done()
})