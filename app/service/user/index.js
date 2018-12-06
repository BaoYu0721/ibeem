'use strict';

const Service = require('egg').Service;

class IndexService extends Service {
    async manageInfo(userId){
        var user = null;
        try {
            user = await this.app.mysql.get('user', { id: userId });
        } catch (error) {
            return -1;
        }
        if(user == null) return null;
        const userInfoMap = {
            createOn: user.created_on,
            deleted: user.deleted,
            email: user.email,
            id: user.id,
            mobilePhone: user.mobile_phone,
            name: user.name,
            oid: user.wechat_oid,
            password: user.password,
            portrait: user.portrait,
            position: user.position,
            qrCode: user.QR_code,
            updateOn: user.update_on,
            userName: user.user_name,
            wechat: user.wechat_name,
            workplace: user.workplace
        };
        return userInfoMap;
    }

    async changePassword(userId, newPassword){
        var user = null;
        try {
            user = await this.app.mysql.get('user', {id: userId});
        } catch (error) {
            return -1;
        }
        if(!user) return null;
        try {
            const result = await this.app.mysql.update('user', {
                id: userId,
                password: newPassword
            });
            if(result.affectedRows != 1) return -1;
        } catch (error) {
            return -1;
        }
        return 0;
    }

    async changeInfo(userId, name, workplace, position, email, mobilePhone, portrait){
        try {
            const user = await this.app.mysql.get('user', {id: userId});
            if(!user) return null;
            const result = await this.app.mysql.update('user', {
                id: userId,
                name: name,
                workplace: workplace,
                position: position,
                mobile_phone: mobilePhone,
                portrait: portrait
            });
            if(result.affectedRows != 1) return -1;
        } catch (error) {
            return -1;
        }
        return 0;
    }
}

module.exports = IndexService;