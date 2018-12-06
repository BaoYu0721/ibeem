'use strict';

const Service = require('egg').Service;

class UserService extends Service {
    async userList(){
        var user = null;
        try {
            user = await this.app.mysql.select('user');
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in user){
            const resultMap = {
                id: user[key].id,
                name: user[key].name,
                email: user[key].email,
                phone: user[key].mobile_phone,
                portrait: user[key].portrait,
                position: user[key].position,
                wechat: user[key].wechat,
                username: user[key].user_name
            }
            resultList.push(resultMap);
        }
        return resultList;
    }
}

module.exports = UserService;