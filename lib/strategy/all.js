'use strict';

const Strategy = require('./base');

module.exports = class AllStrategy extends Strategy {
  start() {
    this.sendAll();
  }
};
