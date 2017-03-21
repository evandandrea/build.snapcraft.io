import { schema } from 'normalizr';

export const repo = new schema.Entity('repos', {}, {
  idAttribute: 'full_name'
});
export const repoList = new schema.Array(repo);

// get github, or source, repos
// indexed on id
// actionCreators use id
// slice for 'snaps', calls to lp api merge response merge to this:
// id: {
//   name: {String},
//   builds: {Array},
//   status: {String}
// }
// so when you 'select' a repo in the form, you merely add an object of that id
// to this slice
// how do we map build
