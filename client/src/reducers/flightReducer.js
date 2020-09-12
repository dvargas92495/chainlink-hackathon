import initialState from './initialState';

export default function flightReducer(state = initialState.flights, action = {}) {
  switch (action.type) {
    case 'LOAD_FLIGHTS':
      return action.flights;
    default:
      return state;
  }
}
