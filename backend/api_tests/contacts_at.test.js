const app = require("../server");
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const agent = supertest.agent(app);
const User = require("../schemas/User.js");

mongoose.set('useFindAndModify', false);
const db = 'mongodb+srv://admin:pennpals@cluster0.sf4c7.mongodb.net/contacts_test?retryWrites=true&w=majority';

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

//API summary: Adds a contact to the current user's contact list
test("PUT /api/contacts", async done => { 
	const currentUser = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const registerCurrentUser = await request.post("/api/register").send(currentUser);
    const contactToAdd = {
        firstname: "Jane",
        lastname: "Doe",
        username: "janedoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "janedoe@fakemail.com",
	}
    const registerContact = await request.post("/api/register").send(contactToAdd);
    const contactUsername = {
        contactToAdd:"janedoe",
        conversationSid:"001"
    }
    const johnLogin = {
        username: "johndoe",
        password: "12345678"
    }
    let addContact
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    //Trying to unhide a contact that does not exist
    addContact = await agent.put("/api/contacts").send({contactToAdd:"janedoe",conversationSid:""}).expect(400);
    expect(addContact.text).toBe("Not a hidden contact");
    //Adding a new contact
    addContact = await agent.put("/api/contacts").send({contactToAdd:"janedoe",conversationSid:"001"}).expect(200);
    expect(addContact.text).toBe("Contact added!");
    //Trying to add a contact that is not a user
    addContact = await agent.put("/api/contacts").send({contactToAdd:"noone",conversationSid:"002"}).expect(404);
    expect(addContact.text).toBe("No contact with that username exists");
    
    done()
})

//API summary: Deletes a contact from the user's contact list
test("DELETE /api/contacts", async done => { 
	const currentUser = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const registerCurrentUser = await request.post("/api/register").send(currentUser);
    const contactToAdd = {
        firstname: "Jane",
        lastname: "Doe",
        username: "janedoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "janedoe@fakemail.com",
	}
    const registerContact = await request.post("/api/register").send(contactToAdd);
    const contactUsername = {
        contactToAdd:"janedoe",
        conversationSid:"001"
    }
    const johnLogin = {
        username: "johndoe",
        password: "12345678"
    }
    let deleteContact;
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    deleteContact = await agent.delete("/api/contacts").send({contactToRemove:"janedoe"}).expect(400);
    expect(deleteContact.text).toBe("Contact does not exist");
    const addContact = await agent.put("/api/contacts").send(contactUsername);
    deleteContact = await agent.delete("/api/contacts").send({contactToRemove:"janedoe"}).expect(200);
    expect(deleteContact.text).toBe("Contact deleted (made hidden)!");
    done()
})

//API summary: Gets the full list of the current user's contacts
test("GET /api/contacts", async done => { 
	const currentUser = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const registerCurrentUser = await request.post("/api/register").send(currentUser);
    const contactToAdd = {
        firstname: "Jane",
        lastname: "Doe",
        username: "janedoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "janedoe@fakemail.com",
	}
    const registerContact = await request.post("/api/register").send(contactToAdd);
    const contactUsername = {
        contactToAdd:"janedoe",
        conversationSid:"001"
    }
    const johnLogin = {
        username: "johndoe",
        password: "12345678"
    }
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    const addContact = await agent.put("/api/contacts").send(contactUsername);
    const getContacts = await agent.get("/api/contacts").send().expect(200);
    done()
})


//API summary: Returns details of user contact if contact exists  
test("POST /api/contacts", async done => { 
	const currentUser = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "johndoe@fakemail.com",
	}
    const registerCurrentUser = await request.post("/api/register").send(currentUser);
    const contactToAdd = {
        firstname: "Jane",
        lastname: "Doe",
        username: "janedoe",
        password: "12345678",
        security_question: "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
        security_answer: "January 2000",
        email: "janedoe@fakemail.com",
	}
    const registerContact = await request.post("/api/register").send(contactToAdd);
    const contactUsername = {
        contactToAdd:"janedoe",
        conversationSid:"001"
    }
    const johnLogin = {
        username: "johndoe",
        password: "12345678"
    }
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    const addContact = await agent.put("/api/contacts").send(contactUsername);
    const searchContactUsername = {
        contactToSearch:"janedoe"
    }
    const getContact = await agent.post("/api/contacts").send(searchContactUsername).expect(200);
    done()
})