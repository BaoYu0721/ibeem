'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1541388383012_5541';

  // cookies
  config.auth_cookie_name = 'ibeem';
  config.auth_cookie_admin = 'admin';
  config.admin = {
    name: "admin",
    password: "21232f297a57a5a743894a0e4a801fc3"
  };

  // add your config here
  config.middleware = [];

  // csrf
  config.security = {
    csrf: {
      enable: false
    }
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

  exports.multipart = {
    mode: 'file',
    tmpdir: './tmp',
    fileSize: '50mb',
    cleanSchedule: {
      cron: '0 30 4 * * *'
    },
    fileExtensions: [
      '.xlsx'
    ],
  };

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
      readDeviceDataUrl: "http://dev.coclean.com/Rest/readDeviceData",
      readDeviceRealtimeDataUrl: "http://dev.coclean.com/Rest/readRealtimeData",
      cloudCalibratUrl: "http://dev.coclean.com/Rest/cloudCalibrat",
      readCloudCalibrat: "http://dev.coclean.com/Rest/readCloudCalibrat",
      readDeviceList: "http://dev.coclean.com/Rest/readDeviceList",
      readOnlineRate: "http://dev.coclean.com/Rest/readOnlineRate",
      createExportOrder: "http://dev.coclean.com/Rest/createWorkOrder",
      statusWorkOrder: "http://dev.coclean.com/Rest/statusWorkOrder",
      deviceIsOnline: "http://dev.coclean.com/Rest/deviceIsOnline",
      deviceIsOnlineBatch: "http://api.coclean.com/Rest/deviceIsOnlineBatch"
    }
  };

  // Tencent Map API
  config.tencentMap = {
    url: "http://apis.map.qq.com/ws/location/v1/ip",
    key: "JLWBZ-4353U-5PKVK-4EEN7-27ZKO-64FLV"
  };

  //mysql
  exports.mysql = {
    client: {
      host: '123.57.62.130',
      port: 3306,
      user: 'root',
      password: 'google@0112',
      database: 'ibeem_test',
    },
    app: true,
    agent: false,
  };

  exports.email = {
    host: 'smtp.163.com',
    port: 465,
    secure: 'true',
    auth: {
      user: 'ibeem',
      pass: 'ibeem'
    },
    password: 'tengke1234',
    email: 'kangkanglinux@163.com'
  };

  exports.wexin = {
    token: "ibeem_wechat",
    appId: "wx9e2ae443958122f4",
    appScrect: "9641f187abcc9b61507f7e708958ca2b",
    apiDomain: "https://api.weixin.qq.com/",
    apiUrl: {
      accessTokenApi: "%scgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
      ticketApi: "%scgi-bin/ticket/getticket?access_token=%s&type=jsapi",
      uploadApi: "%scgi-bin/media/get?access_token=%s&media_id=%s",
      oauth2AccessTokenApi: "%ssns/oauth2/accesstoken?appid=%s&secret=%s&code=%s&grant_type=authorization_code",
      oauth2RefreshAccessTokenApi: "%ssns/oauth2/refresh_token?appid=%s&refresh_token=%s&grant_type=refresh_token",
      getUserInfoApi: "%ssns/userinfo?access_token=%s&openid=%s&lang=zh_CN"
    }
  }

  return config;
};
