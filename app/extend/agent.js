'use strict';

const Strategy = require('../../lib/strategy/base');
const Job = require('../../lib/job');
// const Timer = require('../../lib/timer');

const JOB = Symbol('agent#job');
// const TIMER = Symbol('agent#scheduleTimer');

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
   * @member agent#scheduleTimer
   */
  get scheduleTimer() {
    if (!this[TIMER]) {
      this[TIMER] = new Timer(this);
      this.beforeClose(() => {
        return this[TIMER].close();
      });
    }
    return this[TIMER];
  },
};
