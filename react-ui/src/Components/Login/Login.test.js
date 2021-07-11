import React from 'react';
import Login from './Login';
import ResetPassword from './ForgotPassword';
const renderer = require('react-test-renderer');

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

// snapshot testing
test('Login view matches snapshot', () => {
const component = renderer.create(<Login />);
let tree = component.toJSON();
expect(tree).toMatchSnapshot();
});

// snapshot testing
test('ResetPassword matches snapshot', () => {
const component = renderer.create(<ResetPassword />);
let tree = component.toJSON();
expect(tree).toMatchSnapshot();
});