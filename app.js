'use strict';
const kue = require("kue");
const loadJob = require('./lib/load_job');

module.exports = app => {
  console.log('app.config.env =', app.config.env);

  const jobs = loadJob(app);
  app.addSingleton('job', createJob);

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

    if (!schedule) {
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
};

/**
 * @param  {Object} config   框架处理之后的配置项
 * @param  {Application} app 当前的应用
 * @return {Object}          返回创建的 Job 实例
 */
function createJob(config, app) {
  const { redis } = config;
  assert(redis && redis.host && redis.port && config.queuePrefix);

  const jobQueue = kue.createQueue({
    prefix: config.queuePrefix,
    redis,
  });

  app.beforeStart(function* () {
    const count = yield new Promise((resolve, reject) => {
      Job.client.zcard(Job.client.getKey('jobs'), (err, count) => {
        if (err) {
          reject(err);
        }
        resolve(count);
      });
    });
    app.coreLogger.info(`[egg-job] instance status OK, current job count is ${count}`);
  });
  return jobQueue;
}
