'use strict';

const STRATEGY = Symbol('strategy');
const STRATEGY_INSTANCE = Symbol('strategy_instance');
const JOB_QUEUE = Symbol('job_queue');
const PUB = Symbol('pub');
const SUB = Symbol('sub');
const REDIS = Symbol('REDIS');

const loadJob = require('./load_job');
const kue = require("kue");

module.exports = class Job {
    constructor(agent) {
        this.agent = agent;
        this.config = agent.config.job.client;
        this[STRATEGY] = new Map();
        this[STRATEGY_INSTANCE] = new Map();
        this.closed = false;
        this.queue = this.getQueue();
        this.sub = this.getSub();
        this.pub = this.getPub();
        this.redis = this.getRedis();
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
            const {key, job} = jobItems[k];
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

    getQueue() {
        if (!this[JOB_QUEUE]) {
            const assert = require('assert');
            const {redis} = this.config;
            assert(redis && redis.host && redis.port, "[egg-job] config.job.redis required");

            const jobQueue = kue.createQueue({
                prefix: this.config.queuePrefix | "job",
                redis,
            });
            this[JOB_QUEUE] = jobQueue;
        }
        return this[JOB_QUEUE];
    }

    getRedis(){
      if (!this[REDIS]) {
          let Redis = require('ioredis');
          const {redis} = this.config;
          let client = new Redis(redis)
          this[REDIS] = client;
      }
      return this[REDIS];
    }
    getPub() {

        if (!this[PUB]) {
            let Redis = require('ioredis');
            const {redis} = this.config;
            let client = new Redis(redis)
            this[PUB] = client;
        }
        return this[PUB];
    }

    getSub(){
        if (!this[SUB]) {
            let Redis = require('ioredis');
            const {redis} = this.config;
            let client = new Redis(redis)
            this[SUB] = client;
        }
        return this[SUB];
    }

    async publish(job, options) {

        let _job = await this.createQueue(job);
        if(_job){
          if(job.nodes){
              job.nodes = parseInt(job.nodes);
              const jobWorkersKey = "job_nodes_"+_job.id;
              let workers = await this.redis.set(jobWorkersKey, job.workers);
              if(!workers){
                 return false;
              }
          }
          return await this.pub.publish('job', JSON.stringify({
              id: _job.id,
              job: job
          }));
        }else{
          return false;
        }
    }
    createQueue(job){
        return new Promise((resolve,reject) => {
          let _job = this.queue.create('job', job).priority('high').save(err =>{
             if( !err ) {
                resolve(_job);
             }else{
                resolve(false);
             }
          });
       });
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
