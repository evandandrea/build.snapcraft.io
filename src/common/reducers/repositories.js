import merge from 'lodash/merge';
import union from 'lodash/union';
import without from 'lodash/without';


import * as ActionTypes from '../actions/repositories';

// XXX move to entities.js
export function entities(state = { snaps: {}, repos: {} }, action) {
  if (action.payload && action.payload.entities) {
    return merge({}, state, action.payload.entities);
  }

  return state;
}

export function repositories(state = {
  isFetching: false,
  //success: false, // implicit in !!error
  error: false,
  ids: [],
  selected: [],
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
        ids: union(state.ids, action.payload.result)
        //TODO handle pagination nextPageUrl: action.response.nextPageUrl
      };
    case ActionTypes.REPOSITORIES_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.payload,
      };
    case ActionTypes.REPOSITORIES_SELECT: {
      const isSelected = state.selected.indexOf(action.payload) !== -1;

      // if is in selected list remove it, if not add it
      return {
        ...state,
        selected: isSelected
        ? without(state.selected, action.payload)
        : state.selected.concat(action.payload)
      };
    }
    case ActionTypes.REPOSITORIES_SELECT_CLEAR:
      return {
        ...state,
        selected: []
      };
    default:
      return state;
  }
}
