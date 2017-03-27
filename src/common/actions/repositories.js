import 'isomorphic-fetch';

import { checkStatus, getError } from '../helpers/api';
import { conf } from '../helpers/config';

const BASE_URL = conf.get('BASE_URL');

export const REPOSITORIES_REQUEST = 'REPOSITORIES_REQUEST';
export const REPOSITORIES_SUCCESS = 'REPOSITORIES_SUCCESS';
export const REPOSITORIES_FAILURE = 'REPOSITORIES_FAILURE';


export function setRepositories(repos) {
  return {
    type: REPOSITORIES_SUCCESS,
    payload: repos
  };
}

// XXX rename to fetchGithubRepositories?
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

// XXX move to repository actions?
// could be plural or singular, could be in one module or two, might be clearer in one for now
export const REPOSITORY_TOGGLE_SELECT = 'REPOSITORY_TOGGLE_SELECT';

export function toggleRepositorySelection(id) {
  return {
    type: REPOSITORY_TOGGLE_SELECT,
    payload: id
  };
}

export const REPOSITORY_BUILD = 'REPOSITORY_BUILD';
export const REPOSITORY_SUCCESS = 'REPOSITORY_SUCCESS';
export const REPOSITORY_FAILURE = 'REPOSITORY_FAILURE';

// XXX we need to pass more than a list of ids, so the getSelectedRepositories
// selector could return a cut down array of objects with url, owner and name
export function buildRepositories(repositories) {
  return (dispatch) => {
    const promises = repositories.map(
      (repository) => {

        dispatch(buildRepository(repository));
      }
    );
    return Promise.all(promises);
  };
}

export function buildRepository(repository) {
  const { id, url, owner, name } = repository;

  return async (dispatch) => {
    if (url) {

      dispatch({
        type: REPOSITORY_BUILD,
        payload: id
      });

      try {
        await createWebhook(owner, name);
        const response = await fetch(`${BASE_URL}/api/launchpad/snaps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repository_url: url }),
          credentials: 'same-origin'
        });
        await checkStatus(response);
        dispatch(buildRepositorySuccess(name));
      } catch (error) {
        dispatch(buildRepositoryError(name, error));
      }
    }
  };
}

export async function createWebhook(owner, name) {
  const response = await fetch(`${BASE_URL}/api/github/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, name }),
    credentials: 'same-origin'
  });
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const json = await response.json();
    if (json.payload && json.payload.code === 'github-already-created') {
      return response;
    }
    throw getError(response, json);
  }
}

function buildRepositorySuccess(id) {
  return {
    type: REPOSITORY_SUCCESS,
    payload: { id }
  };
}

function buildRepositoryError(id, error) {
  return {
    type: REPOSITORY_FAILURE,
    payload: {
      id,
      error
    },
    error: true
  };
}
