'use strict';
const loadJob = require('./lib/load_job');
const assert = require('assert');
const qs = require('querystring');
const path = require('path');

const Strategy = require('../../lib/strategy/base');
const Job = require('../../lib/job');
const Subscribe = require('../../lib/subscribe');

const JOB = Symbol('app#job');
const SUBSCRIBE = Symbol('app#jobSubscribe');

module.exports = {
  /**
   * @member app#JobStrategy
   */
  JobStrategy: Strategy,

  /**
   * @member app#job
   */
  get job() {
    if (!this[JOB]) {
      this[JOB] = new Job(this);
      this.beforeClose(() => {
        return this[JOB].close();
      });
    }
    return this[JOB];
  },
    /**
     * @member app#jobSubscribe
     */
    get jobSubscribe() {
        if (!this[SUBSCRIBE]) {
            this[SUBSCRIBE] = new Subscribe(this);
            this.beforeClose(() => {
                return this[SUBSCRIBE].close();
            });
        }
        return this[SUBSCRIBE];
    },

    runJob(jobPath) {
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

};
