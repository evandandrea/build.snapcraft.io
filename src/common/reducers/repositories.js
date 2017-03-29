import merge from 'lodash/merge';
import union from 'lodash/union';

import * as ActionTypes from '../actions/repositories';

// XXX move to entities.js
// XXX should we be handling snaps here too?
// no, because it's not part of the normalized result from github
// so this should really be called github_entities
// no, decompose instead ...
export function entities(state = { snaps: {}, repos: {} }, action) {
  if (action.payload && action.payload.entities) {
    return merge({}, state, action.payload.entities);
  }


  const reposInitialState = {
    __isSelected: false,
    __isFetching: false,
    __error: null
  };

  switch(action.type) {
    case ActionTypes.REPOSITORY_TOGGLE_SELECT: {
      const wasSelected = state.repos[action.payload.id].__isSelected;

      return {
        ...state,
        repos: {
          ...state.repos,
          [action.payload.id]: {
            ...state.repos[action.payload.id] || {},
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
          [action.payload.id]: {
            ...state.repos[action.payload.id] || {},
            ...reposInitialState,
            __isFetching: true,
            __isSelected: true
          }
        }
      };
    }
    case ActionTypes.REPOSITORY_SUCCESS:
    case ActionTypes.REPOSITORY_RESET: {
      return {
        ...state,
        repos: {
          ...state.repos,
          [action.payload.id]: {
            ...state.repos[action.payload.id] || {},
            ...reposInitialState
          }
        }
      };
    }
    case ActionTypes.REPOSITORY_FAILURE: {
      return {
        ...state,
        repos: {
          ...state.repos,
          [action.payload.id]: {
            ...state.repos[action.payload.id] || {},
            ...reposInitialState,
            __error: action.payload.error.json
          }
        }
      };
    }
  }

  return state;
}

export function repositories(state = {
  isFetching: false,
  error: null,
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
        error: null,
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
