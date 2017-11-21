'use strict';

module.exports = class BaseStrategy {
  constructor(job, agent, key) {
    this.agent = agent;
    this.key = key;
    this.job = job;
  }

  start() {}

  sendOne() {
    /* istanbul ignore next */
    if (this.agent.job.closed) {
      this.agent.coreLogger.warn(`[egg-job] message ${this.key} did not sent`);
      return;
    }
    this.agent.coreLogger.info(`[egg-job] send message to random worker: ${this.key}`);
    this.agent.messenger.sendRandom('egg-job', { key: this.key });
  }

  sendAll() {
    /* istanbul ignore next */
    if (this.agent.job.closed) {
      this.agent.coreLogger.warn(`[egg-job] message ${this.key} did not sent`);
      return;
    }
    this.agent.coreLogger.info(`[egg-job] send message to all worker: ${this.key}`);
    this.agent.messenger.send('egg-job', { key: this.key });
  }
};
