import Express from 'express';
import supertest from 'supertest';
import nock from 'nock';
import expect from 'expect';
import url from 'url';

import auth from '../../../../../src/server/routes/github-auth';
import db from '../../../../../src/server/db';
import { conf } from '../../../../../src/server/helpers/config';

const GITHUB_AUTH_LOGIN_URL = conf.get('GITHUB_AUTH_LOGIN_URL');
const GITHUB_AUTH_CLIENT_ID = conf.get('GITHUB_AUTH_CLIENT_ID');
const GITHUB_AUTH_REDIRECT_URL = conf.get('GITHUB_AUTH_REDIRECT_URL');
const GITHUB_AUTH_VERIFY_URL = conf.get('GITHUB_AUTH_VERIFY_URL');

describe('The login route', () => {
  let app;

  beforeEach(() => {
    app = Express();
    app.use((req, res, next) => {
      req.session = {
        sharedSecret: 'bar'
      };
      next();
    });
    app.use(auth);
    app.use((err, req, res, next) => {
      res.status(500).send();
      next();
    });
  });

  describe('authenticate action', () => {
    it('should redirect to configured auth login page', (done) => {
      supertest(app)
        .get('/auth/authenticate')
        .expect('location', new RegExp(GITHUB_AUTH_LOGIN_URL))
        .expect(302)
        .end(done);
    });

    it('should supply configured GitHub client ID', (done) => {
      supertest(app)
        .get('/auth/authenticate')
        .expect('location', new RegExp(GITHUB_AUTH_CLIENT_ID))
        .end(done);
    });

    it('should supply configured redirect URL', (done) => {
      supertest(app)
        .get('/auth/authenticate')
        .expect('location', new RegExp(GITHUB_AUTH_REDIRECT_URL))
        .end(done);
    });

    it('should supply a shared secret', (done) => {
      supertest(app)
        .get('/auth/authenticate')
        .expect('location', /state/)
        .end(done);
    });

    it('should supply an authorization scope', (done) => {
      supertest(app)
        .get('/auth/authenticate')
        .expect('location', /scope/)
        .end(done);
    });
  });

  describe('verify action', () => {
    let scope;

    context('when token successfully exchanged', () => {
      beforeEach(() => {
        const { protocol, host, path } = url.parse(GITHUB_AUTH_VERIFY_URL);
        scope = nock(`${protocol}//${host}`)
          .post(path)
          .reply(200, { access_token: 'baz' });
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('should redirect to /login/failed if received secret doesn\t match shared secret', (done) => {
        supertest(app)
          .get('/auth/verify')
          .query({ code: 'foo', state: 'foo' })
          .send()
          .expect(302)
          .expect('location', new RegExp(/login\/failed/g))
          .end(done);
      });

      context('when user data retrieved from GH', () => {
        beforeEach(async () => {
          nock(conf.get('GITHUB_API_ENDPOINT'))
            .get('/user')
            .reply(200, { id: 123, login: 'anowner' });
          await db.model('GitHubUser').query('truncate').fetch();
        });

        it('should call GitHub API endpoint to get an auth token', (done) => {
          supertest(app)
            .get('/auth/verify')
            .query({ code: 'foo', state: 'bar' })
            .send()
            .end((err) => {
              scope.done();
              done(err);
            }
          );
        });

        it('should save user data in database', async () => {
          await supertest(app)
            .get('/auth/verify')
            .query({ code: 'foo', state: 'bar' })
            .send();
          const dbUser = await db.model('GitHubUser').where({ github_id: 123 })
            .fetch();
          expect(dbUser.serialize()).toMatch({
            github_id: 123,
            login: 'anowner'
          });
        });

        it('should redirect request to the my repos view', (done) => {
          supertest(app)
            .get('/auth/verify')
            .query({ code: 'foo', state: 'bar' })
            .send()
            .end((err, res) => {
              expect(res.statusCode).toEqual(302);
              expect(res.headers.location).toEqual('/user/anowner');
              done(err);
            });
        });
      });
    });

    context('when token exchange fails', () => {
      beforeEach(() => {
        const { protocol, host, path } = url.parse(GITHUB_AUTH_VERIFY_URL);
        scope = nock(`${protocol}//${host}`)
          .post(path)
          .reply(500);
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('should redirect to /login/failed', (done) => {
        supertest(app)
          .get('/auth/verify')
          .query({ code: 'foo', state: 'bar' })
          .send()
          .expect(302)
          .expect('location', new RegExp(/login\/failed/g))
          .end(done);
      });
    });
  });
});
