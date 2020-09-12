import { applyMiddleware, compose, createStore } from 'redux';

import { createBrowserHistory } from 'history';
import createRootReducer from '../reducers';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';

export const history = createBrowserHistory();

const store = createStore(
  createRootReducer(history), // root reducer with router state
  {},
  compose(
    applyMiddleware(
      thunk,
      routerMiddleware(history) // for dispatching history actions
    )
  ),
);

export default store;