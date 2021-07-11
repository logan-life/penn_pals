import React from 'react';
import Register from './Register';
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
test('Register view matches snapshot', () => {
const component = renderer.create(<Register />);
let tree = component.toJSON();
expect(tree).toMatchSnapshot();
});