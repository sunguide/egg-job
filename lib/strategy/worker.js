const Strategy = require('./base');

module.exports = class WorkerStrategy extends Strategy {
  start() {
    this.sendOne();
  }
};
