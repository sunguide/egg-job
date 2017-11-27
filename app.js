'use strict';
const loadJob = require('./lib/load_job');
// const assert = require('assert');
const qs = require('querystring');
const path = require('path');
const Job = require('./lib/job');
module.exports = app => {
  const jobs = loadJob(app);
    // app.addSingleton('job', createJob);
    // let jobQueue = createJob(app.config.job.client, app);
  app.job = new Job(app);
    // for test purpose
  app.runJob = jobPath => {
    if (!path.isAbsolute(jobPath)) {
      jobPath = path.join(app.config.baseDir, 'app/job', jobPath);
    }
    jobPath = require.resolve(jobPath);
    let job;

    try {
      job = jobs[jobPath];
      if (!job) {
        throw new Error(`Cannot find job ${jobPath}`);
      }
    } catch (err) {
      err.message = `[egg-job] ${err.message}`;
      return Promise.reject(err);
    }

      // run with anonymous context
    const ctx = app.createAnonymousContext({
      method: 'JOB',
      url: `/__job?path=${jobPath}&${qs.stringify(job.job)}`,
    });

    return job.task(ctx);
  };
    // log job list
  for (const s in jobs) {
    const job = jobs[s];
    if (!job.job.disable) app.coreLogger.info('[egg-job]: register job %s', job.key);
  }

    // register job event
  app.messenger.on('egg-job', data => {
    app.coreLogger.info('[egg-job]: get message: %j', data);
    const key = data.key;
    const job = jobs[key];

    if (!job) {
      app.coreLogger.warn(`[egg-job] unknown task: ${key}`);
      return;
    }
        /* istanbul ignore next */
    if (job.job.disable) return;

        // run with anonymous context
    const ctx = app.createAnonymousContext({
      method: 'JOB',
      url: `/__job?path=${key}&${qs.stringify(job.job)}`,
    });

    const start = Date.now();
    const task = job.task;
    task(ctx)
            .then(() => true) // succeed
            .catch(err => {
              err.message = `[egg-job] ${key} excute error. ${err.message}`;
              app.logger.error(err);
              return false; // failed
            })
            .then(success => {
              const rt = Date.now() - start;
              const status = success ? 'succeed' : 'failed';
              ctx.coreLogger.info(`[egg-job] ${key} excute ${status}, used ${rt}ms`);
            });
  });

  app.beforeStart(function* () {
    app.coreLogger.info('[egg-job] instance status OK');
  });

};
