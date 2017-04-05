import 'isomorphic-fetch';

import { checkStatus, getError } from '../helpers/api';
import { conf } from '../helpers/config';
import { CALL_API } from '../middleware/call-api';

const BASE_URL = conf.get('BASE_URL');

export const FETCH_SNAPS = 'FETCH_SNAP_REPOSITORIES';
export const FETCH_SNAPS_SUCCESS = 'FETCH_SNAPS_SUCCESS';
export const FETCH_SNAPS_ERROR = 'FETCH_SNAPS_ERROR';
export const REMOVE_SNAP = 'REMOVE_SNAP';
export const REMOVE_SNAP_SUCCESS = 'REMOVE_SNAP_SUCCESS';
export const REMOVE_SNAP_ERROR = 'REMOVE_SNAP_ERROR';

export function fetchUserSnaps(owner) {
  return async (dispatch) => {
    const url = `${BASE_URL}/api/launchpad/snaps/list`;
    const query = `owner=${encodeURIComponent(owner)}`;

    dispatch({
      type: FETCH_SNAPS
    });

    try {
      const response = await fetch(`${url}?${query}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
      });
      await checkStatus(response);
      const result = await response.json();
      if (result.status !== 'success') {
        throw getError(response, result);
      }
      // TODO partly changed to deal with repositories refactor, needs further
      // work to remove snaps altogether - sstewart, 03/04/17
      dispatch(fetchSnapsSuccess({
        snaps: result.payload.snaps,
        result: result.result,
        entities: result.entities
      }));
    } catch (error) {
      dispatch(fetchSnapsError(error));
    }
  };
}

export function fetchSnapsSuccess(snaps) {
  return {
    type: FETCH_SNAPS_SUCCESS,
    payload: snaps
  };
}

export function fetchSnapsError(error) {
  return {
    type: FETCH_SNAPS_ERROR,
    payload: error,
    error: true
  };
}

export function removeSnap(repositoryUrl) {
  return {
    payload: { repository_url: repositoryUrl },
    [ CALL_API ]: {
      types: [ REMOVE_SNAP, REMOVE_SNAP_SUCCESS, REMOVE_SNAP_ERROR ],
      path: '/api/launchpad/snaps/delete',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository_url: repositoryUrl }),
        credentials: 'same-origin'
      }
    }
  };
}
