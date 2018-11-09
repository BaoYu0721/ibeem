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
}

module.exports = IndexService;