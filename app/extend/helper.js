'use strict';

const crypto = require('crypto');
const moment = require('moment');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx');
const util = require('util');
const adm_zip = require('adm-zip');

exports.crypto = str => {
  return crypto.createHash("md5").update(str).digest('hex');
}

exports.dateFormat = date => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

exports.dateFormatOther = date => {
  return moment(date).format('YYYY-MM-DD');
}

exports.dateDayPre = (date, num) => {
  return moment(date).subtract('day', num).format('YYYY-MM-DD');
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

//解析xlsx文件数据
exports.parseXlsx = filename => {
  return xlsx.parse(filename);
}

//生成xlsx数据
exports.xlsxData = data => {
  return xlsx.build(data);
}

//生成xlsx文件
exports.xlsxWriteFile = (data, filename) => {
  const buffer = xlsx.build([{name: "data", data: data}])
  fs.writeFileSync(filename, buffer);
}

//压缩文件夹
exports.floderToZip = (pathname, flodername) => {
  const zip = new adm_zip();
  const floderpath = './tmp/' + flodername;
  const filename = pathname + flodername + '.zip';
  zip.addLocalFolder(floderpath);
  zip.writeZip(filename);
  const files = fs.readdirSync(floderpath);
  for(var i = 0; i < files.length; ++i){
    const filepath = floderpath + '/' + files[i];
    fs.unlinkSync(filepath);
  }
  fs.rmdirSync(floderpath);
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

//格式化请求基础AccessToken地址
exports.formatBaseAccessToken = (accessTokenApi, apiDomain, appId, appScrect) => {
  return util.format(accessTokenApi, apiDomain, appId, appScrect);
}

//格式化ticket
exports.formatTicket = (ticketApi, apiDomain, accessToken) => {
  return util.format(ticketApi, apiDomain, accessToken);
}

//格式化upload地址
exports.formatUpload = (uploadApi, apiDomain, accessToken, media_id) => {
  return util.format(uploadApi, apiDomain, accessToken, media_id);
}

exports.write_file = (name, data) => {
  const filename = './app/public/file/image/' + name;
  fs.writeFileSync(filename, data);
}

//跟新access_token
exports.updateWeixinJson = data => {
  const filepath = __dirname + '/../../weixin.json';
  fs.writeFile(filepath, JSON.stringify(data), function(err){
    if(err){
      console.log(err);
    }
  });
}