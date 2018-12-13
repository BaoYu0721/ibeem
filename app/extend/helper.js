'use strict';

const crypto = require('crypto');
const moment = require('moment');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx');

exports.crypto = str => {
  return crypto.createHash("md5").update(str).digest('hex');
}

exports.dateFormat = date => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

exports.dateFormatOther = date => {
  return moment(date).format('YYYY-MM-DD');
}

exports.mkdirSync = dirname => {
  if(fs.existsSync(dirname)){
    return true;
  }else{
    if(this.mkdirSync(path.dirname(dirname))){
      try {
        fs.mkdirSync(dirname);
      } catch (error) {
        return false;
      }
      return true;
    }
  }
}

//生成excel
exports.xlsxData = data => {
  return xlsx.build([{data: data}]);
}
//生成二维码
exports.qrcode = id => {
  this.mkdirSync('./app/public/file/qrcode');
  const filename = new Date().getTime() + '.png';
  const path = './app/public/file/qrcode/' + filename;
  const url = 'http://www.ibeem.cn/device/qrcodelogin?token=' + id + "%3c%3d%3d%3e" + crypto.createHash('SHA1').update(id.toString()).digest('hex');
  QRCode.toFile(path, url, {width: 300, height: 300}, function(err){
    if(err) throw err;
  })
  return '/public/file/qrcode/' + filename;
}