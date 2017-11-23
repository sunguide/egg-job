'use strict';
const loadJob = require('./lib/load_job');
const assert = require('assert');
const qs = require('querystring');
const path = require('path');

const Strategy = require('../../lib/strategy/base');
const Job = require('../../lib/job');

const JOB = Symbol('app#job');

module.exports = {
  /**
   * @member app#JobStrategy
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
};
