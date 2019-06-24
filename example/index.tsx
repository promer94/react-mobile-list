import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Thing } from '../dist';
import '../src/style.css';
const App = () => {
  return <Thing />;
};

ReactDOM.render(<App />, document.getElementById('root'));
