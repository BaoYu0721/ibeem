'use strict';

const Service = require('egg').Service;

class SingleService extends Service {
    async projectInfo(userId, projectId){
        var project = null;
        var userProjectCount = null;
        try {
            project = await this.app.mysql.get('project', {id: projectId});
            userProjectCount = await this.app.mysql.query('select count(id) from user_project where project_id = ?', [projectId]);
        } catch (error) {
            return -1;
        }
        if(project == null){
            return -2;
        }
        const projectMap = {
            name: project.name,
            id: project.id,
            image: project.image,
            describe: project.des,
            peopleCount: userProjectCount[0]['count(id)'] + 1,
            isCreator: userId == project.creator_id
        };
        return projectMap;
    }

    async buildingInfo(projectId){
        var ibeemBuilding = null;
        var topBuilding = null;
        var project = null;
        try {
            project = await this.app.mysql.get('project', {id: projectId});
        } catch (error) {
            return -1;
        }
        if(project == null){
            return -2;
        }
        try {
            ibeemBuilding = await this.app.mysql.select('building', {where: {project_id: projectId}});
            topBuilding = await this.app.mysql.select('top_building', {where: {project_id: projectId}});
        } catch (error) {
            return -1;
        }
        const buildingList = [];
        for(var key in ibeemBuilding){
            const buildingMap = {
                name: ibeemBuilding[key].name,
                id: ibeemBuilding[key].id,
                city: ibeemBuilding[key].city,
                longitude: ibeemBuilding[key].longitude,
                latitude: ibeemBuilding[key].latitude,
                type: 'ibeem'
            };
            buildingList.push(buildingMap);
        }
        for(var key in topBuilding){
            const buildingMap = {
                name: topBuilding[key].name,
                id: topBuilding[key].id,
                city: '',
                longitude: '',
                latitude: '',
                type: 'top'
            };
            buildingList.push(buildingMap);
        }
        return buildingList;
    }

    async surveyInfo(projectId){
        var surveyIds = null;
        var project = null;
        try {
            project = await this.app.mysql.get('project', {id: projectId});
            surveyIds = await this.app.mysql.query('select survey_id from project_survey where project_id = ?', [projectId]);
        } catch (error) {
            return -1;
        }
        if(project == null){
            return -2;
        }
        const surveyList = [];
        for(var key in surveyIds){
            var survey = null;
            var answerCount = null;
            var creator = null;
            try {
                survey = await this.app.mysql.get('survey', {id: surveyIds[key].survey_id});
                answerCount = await this.app.mysql.query('select count(id) from answer where survey_id = ? and survey_relation_id in(select id from survey_relation where survey_id = ?)', [surveyIds[key].survey_id, surveyIds[key].survey_id]);
                creator = await this.app.mysql.get('user', {id: survey.creator_id});
            } catch (error) {
                return -1;
            }
            const surveyMap = {
                id: surveyIds[key].survey_id,
                title: survey.title,
                introduction: survey.introduction,
                name: creator.name,
                count: answerCount[0]['count(id)']
            };
            surveyList.push(surveyMap);
        }
        return surveyList;
    }

    async deviceInfo(projectId){
        var device = null;
        var project = null;
        try {
            project = await this.app.mysql.get('project', {id: projectId});
        } catch (error) {
            return -1;
        }
        if(project == null){
            return -2;
        }
        try {
            device = await this.app.mysql.select('device', {where: {project_id: projectId}});
        } catch (error) {
            return -1;
        }
        const deviceList = [];
        for(var key in device){
            var user = null;
            try {
                user = await this.app.mysql.get('user', {id: device[key].owner_id});
            } catch (error) {
                return -1;
            }
            const deviceMap = {
                pname: device[key].pname,
                gname: device[key].gname,
                cname: device[key].cname,
                bname: device[key].bname,
                ownerName: device[key].uname != null ? device[key].uname : '',
                id: device[key].id,
                name: device[key].name,
                userName: user.name != null ? user.name : '',
                latitude: device[key].latitude,
                longitude: device[key].longitude,
                type: device[key].type,
                address: device[key].address,
                status: device[key].Online_status,
                warning: device[key].warning_sign,
                description: device[key].des,
                memo: device[key].memo
            }
            deviceList.push(deviceMap);
        }
        return deviceList;
    }

    async memberInfo(projectId){
        var userProject = null;
        var project = null;
        try {
            project = await this.app.mysql.get('project', {id: projectId});
        } catch (error) {
            return -1;
        }
        if(project == null){
            return -2;
        }
        try {
            userProject = await this.app.mysql.query('select * from user_project where project_id = ?', [projectId]);
        } catch (error) {
            return -1;
        }
        const memberList = [];
        for(var key in userProject){
            var user = null;
            try {
                user = await this.app.mysql.get('user', {id: userProject[key].user_id});
            } catch (error) {
                console.log(error);
                return -1;
            }
            if(user != null){
                const memberMap = {
                    id: user.id,
                    name: user.name,
                    portrait: user.portrait,
                    role: userProject[key].role
                };
                memberList.push(memberMap);
            }
        }
        var user = null;
        try {
            user = await this.app.mysql.query('select * from user where id in(select creator_id from project where id = ?)', [projectId]);
        } catch (error) {
            return -1;
        }
        if(user != null){
            const memberMap = {
                id: user[0].id,
                name: user[0].name,
                portrait: user[0].portrait,
                role: 0
            };
            memberList.push(memberMap);
        }
        return memberList;
    }

    async projectUpdate(projectId, name, describe, image){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:project";
        var ttl = 1000;
        try {
            const res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    var result = null;
                    try {
                        result = await app.mysql.update('project', {id: projectId, name: name, des: describe, image: image});
                    } catch (error) {
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                    if(result.affectedRows == 1){
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

    async projectDelete(projectId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const conn = await app.mysql.beginTransaction();
        var ttl = 10000;
        var project = null;
        try {
            project = await app.mysql.get('project', {id: projectId});
        } catch (error) {
            return -1;
        }
        if(project == null) return null;
        try {
            var resource = "ibeem_test:top_element";
            var res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.query('delete from top_element where top_room_id in(select id from top_room where top_building_id in(select id from top_building where project_id = ?))', [projectId]);
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:top_room";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.query('delete from top_room where top_building_id in(select id from top_building where project_id = ?)', [projectId]);
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:top_building";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('top_building', {project_id: projectId});
                    } catch (error) {
                        conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                    lock.unlock();
                    return 0;
                }
                return transation();
            });
            if(res == -1) return res;
            resource = "ibeem_test:device";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.query('update device set project_id = ? where project_id = ?', [null, projectId]);
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:building_point_survey";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.query('delete from building_point_survey where building_point_id in(select id from building_point where building_id in(select id from building where project_id = ?))', [projectId]);
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:survey_relation";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('survey_relation', {project_id: projectId});
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:building_survey";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.query('delete from building_survey where building_id in(select id from building where project_id = ?)', [projectId]);
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:energy_consumption";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.query('delete from energy_consumption where building_id in(select id from building where project_id = ?)', [projectId]);
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:building_point";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.query('delete from building_point where building_id in(select id from building where project_id = ?)', [projectId]);
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:building";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('building', {project_id: projectId});
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:project_survey";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('project_survey', {project_id: projectId});
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:device_attention";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.query('delete from device_attention where device_id in(select id from device where project_id = ?) and user_id in(select user_id from user_project where project_id = ?)', [projectId, projectId]);
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:user_project";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('user_project', {project_id: projectId});
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:device";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        const device = await conn.select('device', {project_id: projectId});
                        for(var key in device){
                            await conn.update('device', {id: device[key].id, project_id: null})
                        }
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:device";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('project', {id: projectId});
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            await conn.commit();
            return res;
        } catch (error) {
            return -1;
        }
    }
}

module.exports = SingleService;