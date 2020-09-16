import initialState from './initialState';

export default function flightReducer(state = initialState.app, action = {}) {
  switch (action.type) {
    case 'UPDATE_APP':
      return { ...state, ...action };
    default:
      return state;
  }
}
