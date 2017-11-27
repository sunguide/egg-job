'use strict';

const assert = require('assert');

class Subscribe {
  constructor(agent) {
    this.agent = agent;
  }

  /**
   * start a timer to handler special schedule
   * @param {String} key - job key
   * @param {Object} job - job config `{ name, immediate}`
   * @param {Function} listener - sender handler
   */
  async handler(key, job, listener) {
    const { name, immediate } = job;
    assert(name, '[egg-job] job.name must be present');
    if (immediate) {
      listener();
    } else {
      this.agent.job.sub.subscribe('job');
      const $this = this;
      this.agent.job.sub.on('message', function(channel, message) {
        message = JSON.parse(message);
        if (channel === 'job' && message.job.name === job.name) {
              // 抢夺执行权 worker
          const currentTimeSeconds = Date.now() / 1000;
          if (!message.job.ttl || message.job.ttl > currentTimeSeconds) {
            if (message.job.nodes) {
              const jobWorkersKey = 'job_nodes_' + message.id;
              const workers = $this.agent.job.redis.decr(jobWorkersKey);
              if (workers >= 0) {
                listener();
              }
            } else {
              listener();
            }
          }
        }
      });
    }
  }

  close() {

  }

}

module.exports = Subscribe;
