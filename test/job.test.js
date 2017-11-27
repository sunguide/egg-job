'use strict';

const request = require('supertest');
const mm = require('egg-mock');

describe('test/job.test.js', async () => {
  const app = mm.cluster({ baseDir: 'job-test', workers: 2, cache: false });
  // app.debug();
  await app.ready();
  await sleep(2000);
  it('should GET /', () => {

    return request(app.callback())
      .get('/')
      .expect('hi, job')
      .expect(200);
  });
});

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
