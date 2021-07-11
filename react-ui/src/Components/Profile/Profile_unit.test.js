import getUser from "./getUser";
import changePasswordFunct from "./changePasswordFunction";
import Profile from "./Profile";
import ChangePassword from "./ChangePassword";
import React, { useState } from "react";
import { mount, shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import TestRenderer from 'react-test-renderer';
import ReactTestUtils from 'react-dom/test-utils'; // ES6

import {BrowserRouter} from "react-router-dom";


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
    // document.body.removeChild(container);
    container = null;
  });

  test('Return user', async () => {
    fetch.mockResponseOnce(JSON.stringify({     
          username: 'John Doe',
          firstname: "John",
          lastname: "Doe",
          email: "email@gmail.com",
    }));
    let res = await getUser();
    res.json().then(async function (json) {
        expect(json.username).toEqual( 'John Doe' );
        expect(fetch.mock.calls.length).toEqual(1);
        // container =  await renderer.create(<BrowserRouter><Profile /></BrowserRouter>,true);
        // const root = container.root;
        // const wrapper = mount(<BrowserRouter><Profile /></BrowserRouter>);
        // wrapper.setState({isLoggedIn:true});
        const loginComponent = shallow(<BrowserRouter><Profile /></BrowserRouter>);
        loginComponent.setState({isLoggedIn:true});
        loginComponent.update();
        expect(loginComponent.find({ id: "alertContactViewNotLoggedIn" })).not.toBeNull();
        expect(loginComponent.find({ id: "userProf" })).not.toBeNull();
        expect(loginComponent.state().isLoggedIn).toEqual(true);
        loginComponent.setState({userName:json.username});
        loginComponent.setState({email:json.email});
        loginComponent.setState({fName:json.firstname});
        loginComponent.setState({lName:json.lastname});
        loginComponent.update();
        expect(loginComponent.state().userName).toEqual("John Doe");
        expect(loginComponent.state().fName).toEqual("John");
        expect(loginComponent.state().lName).toEqual("Doe");
        expect(loginComponent.state().email).toEqual("email@gmail.com");

    });
    
  });

  test('Change password', async () => {
    fetch.mockResponseOnce(JSON.stringify({     
          username: 'John Doe',
          firstname: "John",
          lastname: "Doe",
          email: "email@gmail.com",
    }));
    const passwordData = Object.freeze({
        password: "password",
        newPassword:"password"
    });
    let res = await changePasswordFunct(passwordData);
    expect(res.status).toEqual( 200 );
    // res.json().then(async function (json) {
    // });
    // let component = TestRenderer.create(<ChangePassword />);
    // let testInstance = component.root;
    // const test4 =   renderer.create(<BrowserRouter><ChangePassword /></BrowserRouter>);
    container =  renderer.create(<BrowserRouter><ChangePassword /></BrowserRouter>);
    const changePasswordComponent = shallow(<BrowserRouter><ChangePassword /></BrowserRouter>);
    const root = changePasswordComponent.root;
    const instance = root.instance;
    expect(changePasswordComponent.find({controlID: "newPassword" })).not.toBeNull();
    expect(changePasswordComponent.find({controlID: "newPasswordCopy" })).not.toBeNull();
    expect(container.root.findByProps({controlID: "newPassword" })).not.toBeNull();
    console.log(container.root.findByProps({controlID: "newPassword" }).children);
    const button = container.root.findByProps({ id: "changePswd" });
    ReactTestUtils.Simulate.click(button);

  });