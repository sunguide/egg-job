'use strict';

const Strategy = require('../../lib/strategy/base');
const Job = require('../../lib/job');
const Subscribe = require('../../lib/subscribe');

const JOB = Symbol('agent#job');
const SUBSCRIBE = Symbol('agent#jobSubscribe');

module.exports = {
  /**
   * @member agent#ScheduleStrategy
   */
  JobStrategy: Strategy,

  /**
   * @member agent#job
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
   * @member agent#jobSubscribe
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
};
