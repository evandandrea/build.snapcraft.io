/* Copyright 2011-2016 Canonical Ltd.  This software is licensed under the
 * GNU Affero General Public License version 3 (see the file LICENSE).
 */

import expect, { assert } from 'expect';
import nock from 'nock';

import { conf } from '../../../../../src/server/helpers/config';
import { Entry } from '../../../../../src/server/launchpad/resources';
import getLaunchpad from '../../../../../src/server/launchpad';

const LP_API_URL = conf.get('LP_API_URL');


/* Check an Authorization header. */
function checkAuthorization(val) {
  if (!val.toString().startsWith('OAuth ')) {
    return false;
  }
  let params = {};
  for (const param of val.toString().slice('OAuth '.length).split(',')) {
    const parts = param.trim().split('=', 2);
    params[parts[0]] = decodeURIComponent(parts[1].replace(/^"(.*)"$/, '$1'));
  }
  return (
    params['oauth_version'] === '1.0' &&
    params['oauth_consumer_key'] === 'consumer key' &&
    params['oauth_signature_method'] === 'PLAINTEXT' &&
    params['oauth_token'] === 'token key' &&
    params['oauth_signature'] === '&token%20secret');
}

describe('Launchpad', () => {
  let lp;

  beforeEach(() => {
    lp = nock(LP_API_URL)
      .defaultReplyHeaders({ 'Content-Type': 'application/json' });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('get', () => {
    it('handles successful response', async () => {
      lp.get('/devel/people')
        .matchHeader('Authorization', checkAuthorization)
        .matchHeader('Accept', /^application\/json$/)
        .reply(200, { entry: { resource_type_link: 'foo' } });

      const result = await getLaunchpad().get('/people');
      expect(result.entry).toBeA(Entry);
      expect(result.entry.resource_type_link).toEqual('foo');
    });

    it('handles failing response', async () => {
      lp.get('/devel/people').reply(503);

      try {
        const result = await getLaunchpad().get('/people');
        assert(false, 'Expected promise to be rejected; got %s instead',
               result);
      } catch (error) {
        expect(error.response.status).toEqual(503);
        expect(error.uri).toEqual(`${LP_API_URL}/devel/people`);
      }
    });
  });

  describe('named_get', () => {
    it('handles successful response', async () => {
      lp.get('/devel/people')
        .query({ 'ws.op': 'getByEmail', 'email': 'foo@example.com' })
        .matchHeader('Authorization', checkAuthorization)
        .matchHeader('Accept', /^application\/json$/)
        .reply(200, {
          resource_type_link: `${LP_API_URL}/devel/#person`,
          name: 'foo'
        });

      const result = await getLaunchpad().named_get('/people', 'getByEmail', {
        parameters: { email: 'foo@example.com' }
      });
      expect(result).toBeA(Entry);
      expect(result.name).toEqual('foo');
    });

    it('handles failing response', async () => {
      lp.get('/devel/people').query({ 'ws.op': 'getByEmail' }).reply(503);

      try {
        const result = await getLaunchpad().named_get('/people', 'getByEmail');
        assert(false, 'Expected promise to be rejected; got %s instead',
               result);
      } catch (error) {
        expect(error.response.status).toEqual(503);
        expect(error.uri).toEqual(
          `${LP_API_URL}/devel/people?ws.op=getByEmail`);
      }
    });
  });

  describe('named_post', () => {
    it('handles successful response', async () => {
      lp.post('/devel/people', { 'ws.op': 'newTeam' })
        .matchHeader('Authorization', checkAuthorization)
        .reply(200, { entry: { resource_type_link: 'foo' } });

      const result = await getLaunchpad().named_post('/people', 'newTeam');
      expect(result.entry).toBeA(Entry);
      expect(result.entry.resource_type_link).toEqual('foo');
    });

    it('handles factory response', async () => {
      lp.post('/devel/people', { 'ws.op': 'newTeam', 'name': 'foo' })
        .matchHeader('Authorization', checkAuthorization)
        .reply(201, '', { 'Location': `${LP_API_URL}/devel/~foo` });
      lp.get('/devel/~foo')
        .reply(200, {
          resource_type_link: `${LP_API_URL}/devel/#team`,
          name: 'foo'
        });

      const result = await getLaunchpad().named_post('/people', 'newTeam', {
        parameters: { name: 'foo' }
      });
      expect(result).toBeA(Entry);
      expect(result.name).toEqual('foo');
    });

    it('handles failing response', async () => {
      lp.post('/devel/people').reply(503);

      try {
        const result = await getLaunchpad().named_post('/people', 'newTeam');
        assert(false, 'Expected promise to be rejected; got %s instead',
               result);
      } catch (error) {
        expect(error.response.status).toEqual(503);
        expect(error.uri).toEqual(`${LP_API_URL}/devel/people`);
      }
    });
  });

  describe('patch', () => {
    it('handles successful response', async () => {
      lp.post('/devel/~foo', { 'display_name': 'Foo' })
        .matchHeader('Authorization', checkAuthorization)
        .matchHeader('Accept', /^application\/json$/)
        .matchHeader('X-HTTP-Method-Override', /^PATCH$/)
        .matchHeader('X-Content-Type-Override', /^application\/json$/)
        .reply(200, {
          resource_type_link: `${LP_API_URL}/devel/#person`,
          name: 'foo',
          display_name: 'Foo'
        });

      const result = await getLaunchpad().patch('/~foo', {
        'display_name': 'Foo'
      });
      expect(result).toBeA(Entry);
      expect(result.display_name).toEqual('Foo');
    });

    it('handles failing response', async () => {
      lp.post('/devel/~foo').reply(503);

      try {
        const result = await getLaunchpad().patch('/~foo', {
          'display_name': 'Foo'
        });
        assert(false, 'Expected promise to be rejected; got %s instead',
               result);
      } catch (error) {
        expect(error.response.status).toEqual(503);
        expect(error.uri).toEqual(`${LP_API_URL}/devel/~foo`);
      }
    });
  });

  describe('delete', () => {
    it('handles successful response', async () => {
      lp.delete('/devel/~foo')
        .matchHeader('Authorization', checkAuthorization)
        .reply(200, 'null');

      const result = await getLaunchpad().delete('/~foo');
      expect(result).toBe(null);
    });

    it('handles failing response', async () => {
      lp.delete('/devel/~foo').reply(503);

      try {
        const result = await getLaunchpad().delete('/~foo');
        assert(false, 'Expected promise to be rejected; got %s instead',
               result);
      } catch (error) {
        expect(error.response.status).toEqual(503);
        expect(error.uri).toEqual(`${LP_API_URL}/devel/~foo`);
      }
    });
  });

  describe('wrap_resource', () => {
    it('produces mappings of plain object literals', () => {
      const result = getLaunchpad().wrap_resource(null, {
        baa: {},
        bar: { baz: { resource_type_link: 'qux' } }
      });
      expect(result.bar.baz).toBeA(Entry);
    });

    it('produces arrays of array literals', () => {
      const result = getLaunchpad().wrap_resource(null, [
        [{ resource_type_link: 'qux' }]
      ]);
      expect(result[0][0]).toBeA(Entry);
    });

    it('creates a new array rather than reusing the existing one', () => {
      let foo = ['a'];
      const bar = getLaunchpad().wrap_resource(null, foo);
      expect(bar).toNotBe(foo);
    });

    it('creates a new object rather than reusing the existing one', () => {
      let foo = { a: 'b' };
      const bar = getLaunchpad().wrap_resource(null, foo);
      expect(bar).toNotBe(foo);
    });

    it('handles null correctly', () => {
      const result = getLaunchpad().wrap_resource(null, { bar: null });
      expect(result.bar).toBe(null);
    });
  });

  describe('wrap_resource_on_success', () => {
    const original_uri = 'https://api.launchpad.net/original_uri';
    const updated_uri = 'https://api.launchpad.net/object_uri';
    const fake_response = {
      headers: {
        get: key => {
          switch (key) {
            case 'Content-Type':
              return 'application/json';
            default:
              return null;
          }
        }
      },
      json: () => {
        return Promise.resolve({
          self_link: updated_uri,
          resource_type_link: 'object'
        });
      }
    };

    it('does not modify URI on PATCH', async () => {
      const result = await getLaunchpad().wrap_resource_on_success(
        fake_response, original_uri, 'PATCH'
      );
      expect(result.uri).toEqual(original_uri);
    });

    it('replaces the URI on POST with the value of self_link', async () => {
      const result = await getLaunchpad().wrap_resource_on_success(
        fake_response, original_uri, 'POST'
      );
      expect(result.uri).toEqual(updated_uri);
    });
  });
});
