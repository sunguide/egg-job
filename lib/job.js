'use strict';

const STRATEGY = Symbol('strategy');
const STRATEGY_INSTANCE = Symbol('strategy_instance');
const loadJob = require('./load_job');

module.exports = class Job {
  constructor(agent) {
    this.agent = agent;
    this[STRATEGY] = new Map();
    this[STRATEGY_INSTANCE] = new Map();
    this.closed = false;
  }

  /**
   * register a custom Job Strategy
   * @param {String} type - strategy type
   * @param {Strategy} clz - Strategy class
   */
  use(type, clz) {
    this[STRATEGY].set(type, clz);
  }

  init() {
    const jobItems = loadJob(this.agent);

    for (const k of Object.keys(jobItems)) {
      const { key, job } = jobItems[k];
      console.log(jobItems[k]);
      const type = job.type;
      if (job.disable) continue;

      const Strategy = this[STRATEGY].get(type);
      if (!Strategy) {
        const err = new Error(`schedule type [${type}] is not defined`);
        err.name = 'EggJobError';
        throw err;
      }

      const instance = new Strategy(job, this.agent, key);
      this[STRATEGY_INSTANCE].set(key, instance);
    }
  }

  start() {
    this.closed = false;
    for (const instance of this[STRATEGY_INSTANCE].values()) {
      instance.start();
    }
  }

  close() {
    this.closed = true;
  }
};
