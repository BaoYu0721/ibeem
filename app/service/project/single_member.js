'use strict';

const Service = require('egg').Service;

class SingleMemberService extends Service {
    async memberSearch(key, projectId){
        var user = null;
        try {
            const keyStr = '%' + key + '%';
            user = await this.app.mysql.query('select id, name, portrait from user where (name like ? or user_name like ?) and id not in(select user_id from user_project where project_id = ?)', [keyStr, key, projectId]);
        } catch (error) {
            return -1;
        }
        return user;
    }

    async memberAdd(userId, projectId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:user_project";
        var ttl = 1000;
        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await app.mysql.insert('user_project', {
                            created_on: new Date(),
                            deleted: 0,
                            project_id: projectId,
                            user_id: userId,
                            role: 2
                        });
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return 0;
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
        } catch (error) {
            return -1;
        }
    }

    async memberDelete(userId, projectId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:user_project";
        var ttl = 1000;
        var project = null;
        var userProject = null;
        try {
            project = await app.mysql.get('project', {id: projectId});
            userProject = await app.mysql.get('user_project', {
                user_id: userId,
                project_id: projectId
            });
        } catch (error) {
            return -1;
        }
        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        if(userProject){
                            if(userProject.role == 2){
                                await app.mysql.delete('user_project', {
                                    user_id: userId,
                                    project_id: projectId
                                });
                            }else if(userProject.role == 1){
                                if(project.creator_id != userId){
                                    lock.unlock()
                                    .catch(function(err) {
                                        console.error(err);
                                    });
                                    return -2;
                                }else{
                                    await app.mysql.delete('user_project', {
                                        user_id: userId,
                                        project_id: projectId
                                    });
                                }
                            }
                        }else{
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return -1;
                        }
                    } catch (error) {
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                    lock.unlock()
                    .catch(function(err) {
                        console.error(err);
                    });
                    return 0;
                }
                return transation();
            });
            return res;
        } catch (error) {
            return -1;
        }
    }

    async memberSetManager(userId, projectId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:user_project";
        var ttl = 1000;
        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        const userProject = await app.mysql.get('user_project', {
                            user_id: userId,
                            project_id: projectId
                        });
                        await app.mysql.update('user_project', {
                            id: userProject.id,
                            role: 1,
                            created_on: new Date()
                        });
                    } catch (error) {
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                    lock.unlock()
                    .catch(function(err) {
                        console.error(err);
                    });
                    return 0;
                }
                return transation();
            });
            return res;
        } catch (error) {
            return -1;
        }
    }

    async memberManagerRevocation(ownerId, userId, projectId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:user_project";
        var ttl = 1000;
        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        const project = await app.mysql.get('project', {id: projectId});
                        const userProject = await app.mysql.get('user_project', {
                            user_id: userId,
                            project_id: projectId
                        });
                        if(userProject.role == 1 && project.creator_id == ownerId){
                            await app.mysql.update('user_project', {
                                id: userProject.id,
                                role: 2,
                                updated_on: new Date()
                            });
                        }else{
                            return -2;
                        }
                    } catch (error) {
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                    lock.unlock()
                    .catch(function(err) {
                        console.error(err);
                    });
                    return 0;
                }
                return transation();
            });
            return res;
        } catch (error) {
            return -1;
        }
    }
}

module.exports = SingleMemberService;