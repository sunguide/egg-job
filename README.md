# egg-job

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-job.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-job
[travis-image]: https://img.shields.io/travis/eggjs/egg-job.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-job
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-job.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-job?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-job.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-job
[snyk-image]: https://snyk.io/test/npm/egg-job/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-job
[download-image]: https://img.shields.io/npm/dm/egg-job.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-job

<!--
Description here.
-->

## Install

```bash
$ npm i egg-job --save
```
## Usage

```js
// {app_root}/config/plugin.js
exports.job = {
  enable: true,
  package: 'egg-job',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.job = {
  client :{
            prefix: 'q',
            redis: {
                port: 6379,
                host: '127.0.0.1',
                password: '',
                db: 9, // if provided select a non-default redis db
                options: {
                    // see https://github.com/mranney/node_redis#rediscreateclient
                }
            }
        }
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example
###create a job
```js
this.app.job.publish({
  name:"download",//job name
  nodes:10,//top nodes，0
  ttl:0, //timeout s，0
});
```
###job process
```js
// {app_root}/app/job/email.js
const Subscription = require('egg').Subscription;

class email extends Subscription {
  //must
  static get job(){
    return {
      type: 'worker',//worker or all, please see egg-schedule
      name: 'download', //job name
      immediate: false,
    };
  }
  //must
  async subscribe() {
      //process email send
      this.ctx.app.kue.process('task_email', function(job, done){
        startDownload(job, done);
      });

      function email(job, done) {
        //....
        //more
        //....
        done("done success");
      }
  }
}

module.exports = email;

```

### job publish
```js
// {app_root}/app/controller/email.js

'use strict';
module.exports = app => {
    class emailController extends app.Controller {
        async send(ctx){
            console.log("job start/");

            //create a job
            let result = await this.app.job.publish({
              name:"download",
              nodes:10,//节点数
              ttl:12123423,
            });

            //job more
            var job = ctx.app.kue.create('task_download', {
                title: 'welcome email for you',
                to: 'sunguide@qq.cn',
                template: 'welcome-email',
                url:"https://www.sunguide.cn"
            }).save( function(err){
               if( !err ) console.log( job.id );
            });
            ctx.body = "task comming";
        }

    }
    return emailController;
};

```


## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
