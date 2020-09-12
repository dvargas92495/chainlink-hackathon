import { push } from 'connected-react-router';

export function redirect(link) {
  return dispatch => {
    dispatch(push(link));
  };
}