'use strict';

const parser = require('cron-parser');
const ms = require('humanize-ms');
const safetimers = require('safe-timers');
const assert = require('assert');

class Subscribe {
  constructor(agent) {
    this.agent = agent;
    this.interval = new Map();
    this.timer = new Map();
  }

  /**
   * start a timer to handler special schedule
   * @param {String} key - schedule key
   * @param {Object} schedule - schedule config `{ interval, cron, cronOptions, immediate}`
   * @param {Function} listener - sender handler
   */
  handler(key, job, listener) {
    const { name, cron, cronOptions, immediate } = job;
    assert(name, '[egg-schedule] schedule.interval or schedule.cron or schedule.immediate must be present');


    const config = this.agent.config.job;

    this.agent.kue.process(job.name, function(job, done){
       listener();
       done();
    });

    if (immediate) {
        listener();
    }
  }

  /**
   * clean all timers
   */
  close() {
    for (const tid of this.interval.values()) {
      clearInterval(tid);
    }
    this.interval.clear();

    for (const tid of this.timer.values()) {
      clearTimeout(tid);
    }
    this.timer.clear();
  }

  startCron(key, interval, listener) {
    const now = Date.now();

    this.timer.set(key, tid);
  }

  safeTimeout(handler, delay, ...args) {
    const fn = delay < safetimers.maxInterval ? setTimeout : safetimers.setTimeout;
    return fn(handler, delay, ...args);
  }

  safeInterval(handler, delay, ...args) {
    const fn = delay < safetimers.maxInterval ? setInterval : safetimers.setInterval;
    return fn(handler, delay, ...args);
  }
}

module.exports = Subscribe;
