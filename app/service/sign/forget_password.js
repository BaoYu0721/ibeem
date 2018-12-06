'use strict';

const messager = require('egg-messager');
const path = require('path');
const Service = require('egg').Service;

class ForgetPasswordService extends Service {
    async findPassword(username, email){
        var user = null;
        try {
            user = await this.app.mysql.get('user', {user_name: username})
        } catch (error) {
            return -1;
        }
        if(!user){
            return -2;
        }
        if(user.email != email){
            return -3;
        }
        const newPassword = Math.random().toString().slice(-8);
        const result = await this.app.mysql.update('user', {id: user.id, password: this.ctx.helper.crypto(newPassword)});
        if(result.affectedRows != 1){
            return -1;
        }
        const options = {
            type: 'email',
            toUser: email,
            title: '新密码: ' + newPassword,
            options: {
                captcha: 'eeodo'
            },
            path: path.resolve(__dirname, '../../../app/view/email'),
            template: 'template.html'
        }
        messager(this.app.config.email, options, function(error, data){
            if(error){
                console.log(error);
            }
        });
    }
}

module.exports = ForgetPasswordService;
