import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import app from './appReducer';
import flights from './flightReducer';

const createRootReducer = history => combineReducers({
  router: connectRouter(history),
  app,
  flights
});

export default createRootReducer;