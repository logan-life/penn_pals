import ContactView from './ContactView';
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
test('ContactView view matches snapshot', () => {
const component = renderer.create(<ContactView />);
let tree = component.toJSON();
expect(tree).toMatchSnapshot();
});
