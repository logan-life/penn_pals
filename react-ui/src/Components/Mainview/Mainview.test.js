import React from 'react';
import Mainview from './Mainview';
import {BrowserRouter} from "react-router-dom";
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
test('Mainview view matches snapshot', () => {
const component = renderer.create(<BrowserRouter>
          <Mainview />
        </BrowserRouter>
      );
let tree = component.toJSON();
expect(tree).toMatchSnapshot();
});