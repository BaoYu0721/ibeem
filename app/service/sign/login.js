'use strict';

const Service = require('egg').Service;

class LoginService extends Service {
    async loginAuth(username, password) {
      var user = null;
      try {
        user = await this.app.mysql.get('user', { user_name: username, password: password });
      } catch (error) {
        console.log(error);
        return -1;
      }
      if(user == null){
        return false;
      }else{
        return user;
      }
    }
}

module.exports = LoginService;