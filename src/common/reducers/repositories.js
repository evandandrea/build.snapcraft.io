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

  switch(action.type) {
    case ActionTypes.REPOSITORY_SELECT: {
      const wasSelected = state.repos[action.payload].__isSelected;

      return {
        ...state,
        repos: {
          ...state.repos,
          [action.payload]: {
            ...state.repos[action.payload] || {},
            __isSelected: !wasSelected
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
