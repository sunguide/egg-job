'use strict';

const Strategy = require('./base');

module.exports = class AllStrategy extends Strategy {
  start() {
    this.agent.jobSubscribe.handler(this.key, this.job, () => this.sendAll());
  }
};
