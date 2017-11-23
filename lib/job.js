'use strict';

const STRATEGY = Symbol('strategy');
const STRATEGY_INSTANCE = Symbol('strategy_instance');
const JOB_QUEUE = Symbol('job_queue');
const PUB = Symbol('pub');
const SUB = Symbol('sub');
const loadJob = require('./load_job');

module.exports = class Job {
    constructor(agent) {
        this.agent = agent;
        this[STRATEGY] = new Map();
        this[STRATEGY_INSTANCE] = new Map();
        this.closed = false;
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
            console.log(jobItems[k]);
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

    static get queue() {
        if (this[JOB_QUEUE]) {
            return this[JOB_QUEUE];
        } else {
            const assert = require('assert');
            console.log(this.agent.config);
            const {redis} = this.agent.config;
            assert(redis && redis.host && redis.port, "[egg-job] config.jo.redis required");

            const jobQueue = kue.createQueue({
                prefix: config.queuePrefix | "job",
                redis,
            });
            return this[JOB_QUEUE] = jobQueue;
        }
    }

    static get pub() {

        if (this[PUB]) {
            return this[PUB];
        } else {
            let Redis = require('ioredis');
            const {redis} = this.agent.config;
            let client = new Redis(redis)
            return this[PUB] = client;
        }

    }

    async publish(job, options) {

        let id = this.queue.create('job', job).priority('high').save();
        return await this.pub.publish('job', {
            id: id,
            job: job
        });
    }

    static get sub(){
        if (this[SUB]) {
            return this[SUB];
        } else {
            let Redis = require('ioredis');
            const {redis} = this.agent.config;
            let client = new Redis(redis)
            return this[SUB] = client;
        }
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
