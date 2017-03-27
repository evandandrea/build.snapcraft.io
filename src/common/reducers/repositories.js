import merge from 'lodash/merge';
import union from 'lodash/union';

import * as ActionTypes from '../actions/repositories';

// XXX move to entities.js
// XXX should we be handling snaps here too?
// no, because it's not part of the normalized result from github
// so this should really be called github_entities
export function entities(state = { repos: {} }, action) {
  if (action.payload && action.payload.entities) {
    return merge({}, state, action.payload.entities);
  }

  const reposInitialState = {
    __isFetching: false,
    __error: null
  };

  switch(action.type) {
    case ActionTypes.REPOSITORY_TOGGLE_SELECT: {
      const wasSelected = state.repos[action.payload].__isSelected;

      return {
        ...state,
        repos: {
          ...state.repos,
          [action.payload]: {
            ...state.repos[action.payload] || {},
            ...reposInitialState, // clear state from building by deselecting
            __isSelected: !wasSelected
          }
        }
      };
    }
    case ActionTypes.REPOSITORY_BUILD: {
      return {
        ...state,
        repos: {
          ...state.repos,
          [action.payload]: {
            ...state.repos[action.payload] || {},
            ...reposInitialState,
            __isFetching: true,
          }
        }
      };
    }
    case ActionTypes.REPOSITORY_SUCCESS: {
      return {
        ...state,
        repos: {
          ...state.repos,
          [action.payload]: {
            ...state.repos[action.payload] || {},
            ...reposInitialState
          }
        }
      };
    }
    case ActionTypes.REPOSITORY_ERROR: {
      return {
        ...state,
        repos: {
          ...state.repos,
          [action.payload]: {
            ...state.repos[action.payload] || {},
            ...reposInitialState,
            __error: action.payload.error
          }
        }
      };
    }
  }

  return state;
}

export function repositories(state = {
  isFetching: false,
  //success: false, // implicit in !!error
  error: false,
  ids: [],
  pageLinks: {}
}, action) {

  switch(action.type) {
    case ActionTypes.REPOSITORIES_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case ActionTypes.REPOSITORIES_SUCCESS:
      return {
        ...state,
        isFetching: false,
        error: false,
        ids: union(state.ids, action.payload.result),
        pageLinks: action.payload.pageLinks
      };
    case ActionTypes.REPOSITORIES_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.payload,
      };
    case ActionTypes.REPOSITORIES_SELECT_CLEAR:
      return {
        ...state,
        selected: []
      };
    default:
      return state;
  }
}
