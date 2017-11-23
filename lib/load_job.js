'use strict';

const path = require('path');
const assert = require('assert');
const is = require('is-type-of');

module.exports = app => {
  const dirs = app.loader.getLoadUnits().map(unit => path.join(unit.path, 'app/job'));
  const Loader = getJobLoader(app);
  const Jobs = app.Jobs = {};
  new Loader({
    directory: dirs,
    target: Jobs,
    inject: app,
  }).load();
  return Jobs;
};

function getJobLoader(app) {
  return class JobLoader extends app.loader.FileLoader {
    load() {
      const target = this.options.target;
      const items = this.parse();
      for (const item of items) {
        const Job = item.exports;
        const fullpath = item.fullpath;
        assert(Job.job, `Job(${fullpath}): must have Job and task properties`);
        assert(is.class(Job) || is.function(Job.task), `Job(${fullpath}: Job.task should be function or Job should be class`);

        let task;
        if (is.class(Job)) {
          task = ctx => {
            const s = new Job(ctx);
            s.subscribe = app.toAsyncFunction(s.subscribe);
            return s.subscribe();
          };
        } else {
          task = app.toAsyncFunction(Job.task);
        }

        target[fullpath] = {
          job: Job.job,
          task,
          key: fullpath,
        };
      }
    }
  };
}
