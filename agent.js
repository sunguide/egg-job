'use strict';

const WorkerStrategy = require('./lib/strategy/worker');
const AllStrategy = require('./lib/strategy/all');

module.exports = agent => {
  // register built-in strategy
  agent.job.use('worker', WorkerStrategy);
  agent.job.use('all', AllStrategy);

  // wait for other plugin to register custom strategy
  agent.beforeStart(() => {
    agent.job.init();
  });

  agent.messenger.once('egg-ready', () => {
    // start job after worker ready
    agent.job.start();
  });
};
