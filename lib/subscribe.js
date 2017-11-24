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
    assert(name, '[egg-job] job.name must be present');

    const config = this.agent.config.job;

    if (immediate) {
        listener();
    }else{
        this.agent.job.sub.subscribe("job");
        this.agent.job.sub.on('message', function (channel, message) {
          message = JSON.parse(message);
          console.log(message);
          if(channel == "job" && message.job.name == job.name){
              //抢夺执行权 worker
              if(message.job.workers){

              }
              this.agent.job.redis.set()
              listener();
          }
        });
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

}

module.exports = Subscribe;
