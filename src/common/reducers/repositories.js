import merge from 'lodash/merge';
import union from 'lodash/union';


import * as ActionTypes from '../actions/repositories';

export function entities(state = { snaps: {}, repos: {} }, action) {
  if (action.payload && action.payload.entities) {
    return merge({}, state, action.payload.entities);
  }

  return state;
}

export function errorMessage(state = null, action) {
  const { type, error } = action;

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null;
  } else if (error) {
    return error;
  }

  return state;
}

export function repositories(state= {
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
        ids: union(state.ids, action.payload.result)
        //TODO handle pagination nextPageUrl: action.response.nextPageUrl
      };
    case ActionTypes.REPOSITORIES_FAILURE:
      return {
        ...state,
        isFetching: false
      };
    default:
      return state;
  }
}

/**
export function repositories(state = {
  isFetching: false,
  success: false,
  error: null,
  repos: [],
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
        success: true,
        error: null,
        repos: action.payload.repos.map((repo) => {
          return {
            // parse repository info to keep consistent data format
            ...parseGitHubRepoUrl(repo.full_name),
            // but keep full repo data from API in the store too
            repo
          };
        }),
        pageLinks: action.payload.links
      };
    case ActionTypes.REPOSITORIES_FAILURE:
      return {
        ...state,
        isFetching: false,
        success: false,
        error: action.payload
      };
    default:
      return state;
  }
}
**/
