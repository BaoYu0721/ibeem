'use strict';

const crypto = require('crypto');
const moment = require('moment');
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

exports.xlsxData = data => {
  return xlsx.build([{data: data}]);
}