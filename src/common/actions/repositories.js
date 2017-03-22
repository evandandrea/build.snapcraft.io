import 'isomorphic-fetch';

import { checkStatus, getError } from '../helpers/api';
import { conf } from '../helpers/config';

const BASE_URL = conf.get('BASE_URL');

export const REPOSITORIES_REQUEST = 'REPOSITORIES_REQUEST';
export const REPOSITORIES_SUCCESS = 'REPOSITORIES_SUCCESS';
export const REPOSITORIES_FAILURE = 'REPOSITORIES_FAILURE';

export const REPOSITORIES_SELECT = 'REPOSITORIES_SELECT';

/**
export const FETCH_REPOSITORIES = 'FETCH_ALL_REPOSITORIES';
export const FETCH_REPOSITORIES_ERROR = 'FETCH_REPOSITORIES_ERROR';
export const SET_REPOSITORIES = 'SET_REPOSITORIES';
// not an action, should be part of SUCCESS reducer
export const SET_REPOSITORY_PAGE_LINKS = 'SET_REPOSITORY_PAGE_LINKS';
 **/

export function selectRepository(id) {
  return {
    type: REPOSITORIES_SELECT,
    payload: id
  };
}

export function setRepositories(repos) {
  return {
    type: REPOSITORIES_SUCCESS,
    payload: repos
  };
}

export function fetchUserRepositories(pageNumber) {
  return async (dispatch) => {
    let urlParts = [BASE_URL, 'api/github/repos'];

    dispatch({
      type: REPOSITORIES_REQUEST
    });

    if (pageNumber) {
      urlParts.push('page/' + pageNumber);
    }

    try {
      const response = await fetch(urlParts.join('/'), {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
      });
      await checkStatus(response);
      const result = await response.json();
      if (result.status !== 'success') {
        throw getError(response, result);
      }

      // XXX deleted chunk should be handled in reducer?
      dispatch(setRepositories(result));
    } catch (error) {
      // TODO: Replace with logging helper
      console.warn(error); // eslint-disable-line no-console
      dispatch(fetchRepositoriesError(error));
    }
  };
}

export function fetchRepositoriesError(error) {
  return {
    type: REPOSITORIES_FAILURE,
    payload: error,
    error: true
  };
}
