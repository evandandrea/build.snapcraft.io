import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import * as repository from './repository';
import * as repositories from './repositories';
import * as authError from './auth-error';
import * as snapBuilds from './snap-builds';
import * as snaps from './snaps';
import * as user from './user';
import * as auth from './auth';
import * as authStore from './auth-store';
import * as registerName from './register-name';

const rootReducer = combineReducers({
  ...repository,
  ...repositories,
  ...authError,
  ...snapBuilds,
  ...snaps,
  ...user,
  ...auth,
  ...authStore,
  ...registerName,
  routing: routerReducer
});

export default rootReducer;
