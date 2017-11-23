'use strict';
const loadJob = require('./lib/load_job');
const assert = require('assert');
const qs = require('querystring');
const path = require('path');

const Strategy = require('../../lib/strategy/base');
const Job = require('../../lib/job');
const Subscribe = require('../../lib/subscribe');

const JOB = Symbol('app#job');
const SUBSCRIBE = Symbol('app#jobSubscribe');

module.exports = {
  /**
   * @member app#JobStrategy
   */
  JobStrategy: Strategy,

  /**
   * @member app#job
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
    /**
     * @member app#jobSubscribe
     */
    get jobSubscribe() {
        if (!this[SUBSCRIBE]) {
            this[SUBSCRIBE] = new Subscribe(this);
            this.beforeClose(() => {
                return this[SUBSCRIBE].close();
            });
        }
        return this[SUBSCRIBE];
    },
};
