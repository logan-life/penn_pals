import ConversationView from './ConversationView';
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
test('ConversationView view matches snapshot', () => {
const component = renderer.create(<ConversationView />);
let tree = component.toJSON();
expect(tree).toMatchSnapshot();
});
