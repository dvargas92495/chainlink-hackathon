import './index.css';
import App from './pages/App';
import React from 'react';
import { render } from 'react-dom';
import { unregister } from './serviceWorker';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';

import store, { history } from './store/configureStore';

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister();
