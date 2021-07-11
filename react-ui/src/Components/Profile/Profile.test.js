import Profile from './Profile';
import Deactivate from './Deactivate';
import ChangePassword from './ChangePassword';
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
test('Profile view matches snapshot', () => {
const component = renderer.create(<BrowserRouter><Profile /></BrowserRouter>);
let tree = component.toJSON();
expect(tree).toMatchSnapshot();
});

// snapshot testing
test('Deactivate view matches snapshot', () => {
const component = renderer.create(<BrowserRouter><Deactivate /></BrowserRouter>);
let tree = component.toJSON();
expect(tree).toMatchSnapshot();
});

// snapshot testing
test('ChangePassword view matches snapshot', () => {
const component = renderer.create(<BrowserRouter><ChangePassword /></BrowserRouter>);
let tree = component.toJSON();
expect(tree).toMatchSnapshot();
});