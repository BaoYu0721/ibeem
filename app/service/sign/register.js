'use strict';

const Service = require('egg').Service;

class ResisterService extends Service {
    async userRegister(user){
        var existUser = null;
        try {
            existUser = await this.app.mysql.get('user', { user_name: user.username});
        } catch (error) {
            return -1;
        }
        if(existUser){
            return -2;
        }
        try {
            const result = await this.app.mysql.insert('user', {
                user_name: user.userName,
                password: user.password,
                email: user.email,
                workplace: user.workplace,
                position: user.position,
                mobile_phone: user.mobilePhone,
                portrait: user.portrait,
                name: user.name,
                created_on: new Date(),
                updated_on: new Date(),
                deleted: 0
            });
            if(result.affectedRows != 1){
                return -1;
            }
        } catch (error) {
            return -1;
        }
        return 0;
    }
}

module.exports = ResisterService;