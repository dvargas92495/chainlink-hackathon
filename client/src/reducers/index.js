import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import flights from './flightReducer';

const createRootReducer = history => combineReducers({
  router: connectRouter(history),
  flights
});

export default createRootReducer;