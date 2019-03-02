# egg-messager [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

> Messager for egg frame work

## Installation

```sh
$ npm install --save egg-messager
```

## Usage

```js
var messager = require('egg-messager');


// 发送邮件
var config = {
  host: process.env.NN_MAIL_SERVER || 'smtp.126.com',
  port: process.env.NN_MAIL_PORT  || 465,
  secure: 'true',
  password: process.env.NN_MAIL_PASSWORD,
  email: process.env.NN_MAIL_EMAIL
};
var options = {
  type: 'email',                    // 指定类型，如果是短信。 type是sms
  toUser: 'calidion@gmail.com',     // 接收人如果是sms则为手机号
  title: 'title',                   // 如果是短信可以不用填
  options: {                        // 如果是短信不用填
    captcha: 'eeodo'
  },
  path: path.resolve(__dirname, './data'),      // 模板所在的目录
  template: 'email.html'                        // 模板名
};
messager(config, options, function (error, data) {

});

```


## License

 © [calidion](blog.3gcnbeta.com)


[npm-image]: https://badge.fury.io/js/egg-messager.svg
[npm-url]: https://npmjs.org/package/egg-messager
[travis-image]: https://travis-ci.org/calidion/egg-messager.svg?branch=master
[travis-url]: https://travis-ci.org/calidion/egg-messager
[daviddm-image]: https://david-dm.org/calidion/egg-messager.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/calidion/egg-messager
[coveralls-image]: https://coveralls.io/repos/calidion/egg-messager/badge.svg
[coveralls-url]: https://coveralls.io/r/calidion/egg-messager
