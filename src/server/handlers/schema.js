import { schema } from 'normalizr';

export const repo = new schema.Entity('repos', {}, {
  idAttribute: 'full_name'
});

export const repoList = new schema.Array(repo);
