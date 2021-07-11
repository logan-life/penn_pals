import React, { useState } from "react";
import { mount, shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import getContactStatus from "./getContactStatus";
import {BrowserRouter} from "react-router-dom";
import StatusView from "./Status";
import postText from "./postStatus";


import fetchMock from "jest-fetch-mock";
configure({ adapter: new Adapter() });
global.fetch = require('jest-fetch-mock');
const renderer = require('react-test-renderer');

let container;
// fetchMock.enableMocks();
// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     json: () => Promise.resolve({ rates: { CAD: 1.42 } }),
//   })
// );

// beforeEach(() => {
//   fetch.mockClear();
// });

// it("finds exchange", async () => {
//   const rate = await getUser();
//     console.log(rate);
//   expect(rate).toEqual(1.42);
//   expect(fetch).toHaveBeenCalledTimes(1);
// });


beforeEach(() => {
    fetch.mockClear();
    fetch.resetMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
  });
afterEach(() => {
    fetch.mockReset();
  container = null;
  });
  test('getContactStatus', async () => {
    fetch.mockResponseOnce(JSON.stringify({     
          username: 'johnd',
          firstname: "John",
          lastname: "Doe",
          email: "email@gmail.com",
          status:"This is status",
    }));
    let res = await getContactStatus();
    res.json().then(async function (json) {
        expect(json.status).toEqual( "This is status" );
        expect(fetch.mock.calls.length).toEqual(1);
        const loginComponent = shallow(<BrowserRouter><StatusView /></BrowserRouter>);
        loginComponent.setState({isLoggedIn:true});
        loginComponent.update();
        expect(loginComponent.find({ id: "userProfInfo" })).not.toBeNull();
        loginComponent.setState({userName:json.username});
        loginComponent.setState({myStatusText:json.status});
        loginComponent.update();
        expect(loginComponent.state().userName).toEqual("johnd");
        expect(loginComponent.state().myStatusText).toEqual("This is status");

    });
    
  });

  test('postStatus', async () => {
    fetch.mockResponseOnce(JSON.stringify({     
        contact_name: "johnd",
        status_id: 1, 
        type: "text", 
        text: "I have updated my status", 
        image: "",
        url: "",
    }));
    let res = await postText();
    res.json().then(async function (json) {
        expect(json.text).toEqual( "I have updated my status" );
        expect(fetch.mock.calls.length).toEqual(1);
        const loginComponent = shallow(<BrowserRouter><StatusView /></BrowserRouter>);
        loginComponent.setState({isLoggedIn:true});
        loginComponent.update();
        expect(loginComponent.find({ id: "userProfInfo" })).not.toBeNull();
        loginComponent.setState({myStatusText:json.text});
        loginComponent.update();
        expect(loginComponent.state().myStatusText).toEqual("I have updated my status");

    });
    
  });