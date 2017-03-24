import { schema } from 'normalizr';

// XXX owner entity, a nod to the future, remove for review
export const owner = new schema.Entity('owners');
export const repo = new schema.Entity('repos', {
  owner: owner
});
export const repoList = new schema.Array(repo);
