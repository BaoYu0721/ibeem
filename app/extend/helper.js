'use strict';

const crypto = require('crypto');
const moment = require('moment');

exports.crypto = str => {
  return crypto.createHash("md5").update(str).digest('hex');
}

exports.dateFormat = date => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}