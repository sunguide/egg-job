const Strategy = require('./base');

module.exports = class WorkerStrategy extends Strategy {
  start() {
    this.agent.jobSubscribe.handler(this.key, this.job, () => this.sendOne());
  }
};
