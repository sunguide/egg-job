'use strict';

const request = require('supertest');
const mm = require('egg-mock');

describe('test/job.test.js', () => {
  let app;
  before(() => {
    app = mm.app({
      baseDir: 'apps/job-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mm.restore);

  it('should GET /', () => {
    return request(app.callback())
      .get('/')
      .expect('hi, job')
      .expect(200);
  });
});
