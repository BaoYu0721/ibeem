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

    async userChangePassword(userId, password){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var resource = "ibeem_test:user";
        var ttl = 1000;
        try {
            var res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        const user = await app.mysql.get('user', {id: userId});
                        if(user){
                            await app.mysql.update('user', {
                                id: userId,
                                password: password
                            });
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return 0;
                        }else{
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return null;
                        }
                    } catch (error) {
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                }
                return transation();
            });
            return res;
        }
        catch (error) {
            return -1;
        }
    }
}

module.exports = UserService;