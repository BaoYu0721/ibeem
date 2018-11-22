'use strict';
const path = require('path');

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1541388383012_5541';

  // cookies
  config.auth_cookie_name = 'ibeem';

  // add your config here
  config.middleware = [];

  // csrf
  config.security = {
    csrf: {
      enable: false
    }
  };

  // passport
  config.passportLocal = {
    usernameField: 'ibeemname',
    passwordField: 'ibeempwd',
  };

  // logger
  exports.logger = {
    dir: path.join(__dirname, '../logs/egg'),
    level: 'DEBUG',
  };

  //ejs
  config.view = {
    defaultViewEngine: 'ejs',
    mapping: {
      '.html': 'ejs',
    },
  };

  //redis
  config.redis = {
    client: {
      host: process.env.EGG_REDIS_HOST || '127.0.0.1',
      port: process.env.EGG_REDIS_PORT || 6379,
      password: process.env.EGG_REDIS_PASSWORD || '',
      db: process.env.EGG_REDIS_DB || '0',
    },
  };

  //http client
  exports.httpclient = {
    request: {
      timeout: 3000
    }
  }

  //httpUrl
  config.deviceDataReqUrl = {
    ibeem: {
      getDeviceData: "http://47.95.148.138:5000/get_ids_data",
      getDeviceOnlineStatus: "http://47.95.148.138:5000/get_dev_status",
      getRealtimeData: "http://47.95.148.138:5000/read_realtime_data"
    },
    coclean: {
      appId: "4",
      appKey: "58da3ecb7e1798103eb78c7f844450dbac05f5ab",
      readDeviceRealtimeDataUrl: "http://dev.coclean.com/Rest/readRealtimeData",
      cloudCalibratUrl: "http://dev.coclean.com/Rest/cloudCalibrat",
      readCloudCalibrat: "http://dev.coclean.com/Rest/readCloudCalibrat",
      readDeviceList: "http://dev.coclean.com/Rest/readDeviceList",
      readOnlineRate: "http://dev.coclean.com/Rest/readOnlineRate",
      createExportOrder: "http://dev.coclean.com/Rest/createWorkOrder",
      statusWorkOrder: "http://dev.coclean.com/Rest/statusWorkOrder",
      deviceIsOnline: "http://dev.coclean.com/Rest/deviceIsOnline"
    }
  };

  //mysql
  exports.mysql = {
    client: {
      host: '192.168.0.188',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'ibeem_test',
    },
    app: true,
    agent: false,
  };
  
  return config;
};
