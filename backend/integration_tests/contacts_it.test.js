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
//test description: Adding a contact and validating the presence of the contact in the database, and validating the presence of a shadow contact
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
    let addContact;
    let johnDocument;
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    //Adding a user that does not exist is not possible
    //It will have no impact on the database
    addContact = await agent.put("/api/contacts").send({contactToAdd:"noone",conversationSid:"002"});
    johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.contacts.length).toBe(0);
    addContact = await agent.put("/api/contacts").send(contactUsername);
    // Check the data in the database
    // Direct contact add
    johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.contacts[0].username).toBe("janedoe");
    expect(johnDocument.contacts[0].username).toBe("janedoe");
    expect(johnDocument.contacts[0].hidden).toBe(false);
    // Hidden contact add
    const janeDocument = await User.findOne({username:"janedoe"});
    expect(janeDocument.contacts[0].username).toBe("johndoe");
    expect(janeDocument.contacts[0].hidden).toBe(true);
    done()
})

//API summary: Deletes a contact from the user's contact list
//test description: Validate that the status of a contact that is deleted has been changed to hidden

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
    const loginJohn = await agent.post("/api/login").send(johnLogin);
    const addContact = await agent.put("/api/contacts").send(contactUsername);
    const deleteContactUsername = {
        contactToRemove:"janedoe"
    }
    let deleteContact;
    let johnDocument;
    //No effect if the name of the contact to delete is not provided
    deleteContact = await agent.delete("/api/contacts").send({contactToRemove:""});

    johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.contacts[0].username).toBe("janedoe");
    expect(johnDocument.contacts[0].hidden).toBe(false);
 
    deleteContact = await agent.delete("/api/contacts").send(deleteContactUsername);
    //The contact will be set to hidden
    johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.contacts[0].username).toBe("janedoe");
    expect(johnDocument.contacts[0].hidden).toBe(true);
    done()
})

//API summary: Gets the full list of the current user's contacts
//test description: Validate that the list of contacts returned by the API call matches the list of contacts in the database
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
    const getContacts = await agent.get("/api/contacts").send();
    //contact list returned by get contacts matches the contact list in the database
    const johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.contacts[0].username).toBe(getContacts.body[0].username);
    console.log(getContacts.body[0].username);
    done()
})

//API summary: Returns details of user contact if contact exists  
//test description: Validate that the contact details returned by searching for a contact matches the contact details in the database
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
    const getContact = await agent.post("/api/contacts").send(searchContactUsername);
    //Contact returned by search matches the contact in the database
    const johnDocument = await User.findOne({username:"johndoe"});
    expect(johnDocument.contacts[0].username).toBe(getContact.body.username);
    console.log(getContact.body.username);
    done()
})