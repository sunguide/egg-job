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

## 依赖说明

### 依赖的 egg 版本

egg-job 版本 | egg 1.x
--- | ---
1.x | 😁
0.x | ❌

### 依赖的插件
<!--

如果有依赖其它插件，请在这里特别说明。如

- security
- multipart

-->

## 开启插件

```js
// config/plugin.js
exports.job = {
  enable: true,
  package: 'egg-job',
};
```

## 使用场景
一个带有节点数目控制的分布式任务执行工具。

## 详细配置

请到 [config/config.default.js](config/config.default.js) 查看详细配置项说明。
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

## 简单实用

###发布一个job
```js
this.app.job.publish({
  name:"download",//job name
  nodes:10,//最大执行的节点数，0 不限
  ttl:0, //失效时间s，0永不失效
});
```
###处理job的实例
```js
// {app_root}/app/job/email.js
const Subscription = require('egg').Subscription;

class email extends Subscription {
  //必须
  static get job(){
    return {
      type: 'worker',//worker or all,这个参数同egg-schedule
      name: 'download', //job name
      immediate: false, //是否立即执行
    };
  }
  //必须
  async subscribe() {
      //这里模仿的是处理一个队里消息，执行邮件发送
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

###发布job的实例
```js
// {app_root}/app/controller/email.js

'use strict';
module.exports = app => {
    class emailController extends app.Controller {
        async send(ctx){
            console.log("job start/");

            //发布一个job
            let result = await this.app.job.publish({
              name:"download",
              nodes:10,//节点数
              ttl:12123423,
            });

            //job 要处理的队列增加一条数据
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

## 单元测试

<!-- 描述如何在单元测试中使用此插件，例如 schedule 如何触发。无则省略。-->

## 提问交流

请到 [egg issues](https://github.com/eggjs/egg/issues) 异步交流。

## License

[MIT](LICENSE)
