'use strict';

const Service = require('egg').Service;

class ProjectService extends Service {
    async projectList(){
        var project = null;
        try {
            project = await this.app.mysql.select('project');
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in project){
            const resultMap = {
                id: project[key].id,
                name: project[key].name,
                decribe: project[key].des,
                image: project[key].image
            }
            resultList.push(resultMap);
        }
        return resultList;
    }

    async singleInfo(projectId){
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
            peopleCount: userProjectCount[0]['count(id)'] + 1
        };
        return projectMap;
    }

    async singleDeviceInfo(projectId){
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

    async singleSurveyInfo(projectId){
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
                id: surveyIds[key],
                title: survey.title,
                introduction: survey.introduction,
                name: creator.name,
                count: answerCount[0]['count(id)']
            };
            surveyList.push(surveyMap);
        }
        return surveyList;
    }

    async singleBuildingInfo(projectId){
        var building = null;
        try {
            building = await this.app.mysql.select('building', {where: {project_id: projectId}});
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in building){
            const resultMap = {
                name: building[key].name,
                id: building[key].id,
                city: building[key].city,
                longitude: building[key].longitude,
                latitude: building[key].latitude
            };
            resultList.push(resultMap);
        }
        return resultList;
    }

    async singleEdit(projectId, name, describe, image){
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

    async singleDelete(projectId){
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

    async singleBuilding(projectId){
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

    async singleDevice(projectId){
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

    async singleSurvey(projectId){
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
                id: surveyIds[key],
                title: survey.title,
                introduction: survey.introduction,
                name: creator.name,
                count: answerCount[0]['count(id)']
            };
            surveyList.push(surveyMap);
        }
        return surveyList;
    }

    async singleMember(projectId){
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

    async ibeemBuildingAdd(projectId,
        buildingName, buildingClass, city, longitude, latitude, climatic){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:building";
        var ttl = 1000;
        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await app.mysql.insert('building', {
                            source: 0, 
                            city: city,
                            created_on: new Date(),
                            updated_on: new Date(),
                            name: buildingName,
                            longitude: longitude,
                            latitude: latitude,
                            project_id: projectId,
                            type: '办公',
                            level: '无星级',
                            climatic_province: climatic,
                            building_class: buildingClass
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

    async topBuildingAdd(projectId, buildingName){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:top_building";
        var ttl = 1000;
        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await app.mysql.insert('top_building', {
                            project_id: projectId,
                            name: buildingName,
                            created_on: new Date(),
                            updated_on: new Date(),
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

    async singleBuildingDelete(buildingId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 2000;
        try {
            var resource = "ibeem_test:building";
            const conn = await app.mysql.beginTransaction();
            var res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('key_parameter', {building_id: buildingId});
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
            resource = "ibeem_test:technology";
            res = await redlock.lock(resource, ttl).then(function(lock){
                async function transation(){
                    try {
                        await conn.delete('technology', {building_id: buildingId});
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
            resource = "ibeem_test:project_building";
            res = await redlock.lock(resource, ttl).then(function(lock){
                async function transation(){
                    try {
                        await conn.delete('project_building', {building_id: buildingId});
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
            res = await redlock.lock(resource, ttl).then(function(lock){
                async function transation(){
                    try {
                        await conn.delete('building_survey', {building_id: buildingId});
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
            resource = "ibeem_test:survey";
            res = await redlock.lock(resource, ttl).then(function(lock){
                async function transation(){
                    try {
                        await conn.query('update survey set building_id = ? where building_id = ?', [null, buildingId]);
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
            res = await redlock.lock(resource, ttl).then(function(lock){
                async function transation(){
                    try {
                        await conn.query('update survey_relation set building_id = ? where building_id = ?', [null, buildingId]);
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
            res = await redlock.lock(resource, ttl).then(function(lock){
                async function transation(){
                    try {
                        await conn.query('update device set building_id = ? where building_id = ?', [null, buildingId]);
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
            res = await redlock.lock(resource, ttl).then(function(lock){
                async function transation(){
                    try {
                        await conn.delete('building', {id: buildingId});
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
            await conn.commit();
            return res;
        } catch (error) {
            return -1;
        }
    }

    async singleBuildingView(buildingId){
        var building = null;
        try {
            building = await this.app.mysql.get('building', {id: buildingId});
        } catch (error) {
            return -1;
        }
        if(building != null){
            var design_indicators = null;
            if(building.design_indicators_id != null){
                try {
                    design_indicators = await this.app.mysql.get('design_indicators', {id: building.design_indicators_id});
                } catch (error) {
                    return -1;
                }
            }
            var energy_conservation_measure = null;
            if(building.energy_conservation_measure_id != null){
                try {
                    energy_conservation_measure = await this.app.mysql.get('energy_conservation_measure', {id: building.energy_conservation_measure_id});
                } catch (error) {
                    return -1;
                }
            }
            var imageUrl = [];
            if(building.image != null){
                imageUrl = building.image.split(',');
            }
            var buildingPointCount = null;
            var energy_consumption = null;
            var evaluationCount = null;
            try {
                buildingPointCount = await this.app.mysql.query('select count(id) from building_point where building_id = ?', [buildingId]);
                energy_consumption = await this.app.mysql.query('select sum(aeu) from energy_consumption where building_id = ?', [buildingId]);
                evaluationCount = await this.app.mysql.query('select count(id) from answer where survey_id in(select survey_id from survey_relation where relation=2 and building_id = ?) and survey_relation_id in(select id from survey_relation where building_id = ?)', [buildingId, buildingId]);
            } catch (error) {
                return -1;
            }
            console.log(energy_consumption);
            const buildingMap = {
                name: building.name,
                id: building.id,
                city: building.city,
                area: design_indicators == null ? '' : design_indicators,
                height: building.height == null ? '' : building.height,
                wwr: energy_conservation_measure == null ? '' : energy_conservation_measure,
                imageList: imageUrl,
                bpCount: buildingPointCount[0]['count(id)'],
                aeu: energy_consumption[0]['sum(aeu)'] == null ? 0.0 : energy_consumption[0]['sum(aeu)'],
                evaluationCount: evaluationCount[0]['count(id)']
            }
            return buildingMap;
        }else{
            return null;
        }
    }

    async singleBuildingInformation(buildingId){
        var building = null;
        var designIndicators = null;
        var energyConservationMeasure = null;
        var indoorEnvironment = null;
        var indoorEnvParaDesign = null;
        var waterSaveDesign = null;
        var buildingMap = null;
        var designIndicatorsMap = null;
        var energyConservationMeasureMap = null;
        var indoorEnvironmentMap = null;
        var indoorEnvParaDesignMap = null;
        var waterSaveDesignMap = null;
        try {
            building = await this.app.mysql.get('building', {id: buildingId});
        } catch (error) {
            return -1;
        }
        if(building == null){
            return null;
        }
        try {
            designIndicators = await this.app.mysql.get('design_indicators', {id: building.design_indicators_id});
            energyConservationMeasure = await this.app.mysql.get('energy_conservation_measure', {id: building.energy_conservation_measure_id});
            indoorEnvironment = await this.app.mysql.get('indoor_environment', {id: building.indoor_environment_id});
            indoorEnvParaDesign = await this.app.mysql.get('indoor_environment_parameter_design', {id: building.indoor_environment_parameter_design_id});
            waterSaveDesign = await this.app.mysql.get('water_saving_design', {id: building.water_saving_design_id});
        } catch (error) {
            return -1;
        }
        if(designIndicators != null){
            designIndicatorsMap = {
                id: designIndicators.id,
                landArea: designIndicators.land_area,
                buildingArea: designIndicators.building_area,
                subsurfaceArea: designIndicators.subsurface_area,
                groundFloorArea: designIndicators.ground_floor_area,
                gas: designIndicators.gas,
                municipalHeating: designIndicators.municipal_heating,
                electricPower: designIndicators.electric_power,
                coal: designIndicators.coal,
                ubadtec: designIndicators.ubadtec,
                deer: designIndicators.design_energy_efficiency_ratio,
                tpi: designIndicators.thermal_performance_improvement,
                hvaacsdec: designIndicators.hvaacsdec,
                hvaacsdectr: designIndicators.hvaacsdectr,
                totalWater: designIndicators.total_water,
                ncw: designIndicators.non_conventional_water,
                ntwa: designIndicators.non_traditional_water_availability,
                blhw: designIndicators.building_life_hot_water,
                rhc: designIndicators.renewable_heat_capacity,
                tpohwgbre: designIndicators.tpohwgbre,
                bec: designIndicators.building_electric_consumption,
                renewableCapacity: designIndicators.renewable_capacity,
                rege: designIndicators.renewable_energy_generates_electricity
            };
        }
        if(energyConservationMeasure != null){
            energyConservationMeasureMap = {
                id: energyConservationMeasure.id,
                owccbo: energyConservationMeasure.owccbo,
                ehr: energyConservationMeasure.exhaust_heat_recovery,
                awr: energyConservationMeasure.adjustable_wind_ratio,
                pces: energyConservationMeasure.partial_condition_energy_saving,
                erStandard: energyConservationMeasure.er_standard,
                wsStandard: energyConservationMeasure.ws_standard,
                whwhu: energyConservationMeasure.whwhu,
                itemizedMetering: energyConservationMeasure.itemized_metering,
                cchp: energyConservationMeasure.cchp,
                reu: energyConservationMeasure.renewable_energy_use,
                ltv: energyConservationMeasure.lighting_target_value,
                lightingControl: energyConservationMeasure.lighting_control,
                egceas: energyConservationMeasure.egceas,
                esee: energyConservationMeasure.energy_saving_electrical_equipment,
                csf: energyConservationMeasure.cold_source_form,
                tfotds: energyConservationMeasure.tfotds,
                endSystem: energyConservationMeasure.end_system,
                totalCapacity: energyConservationMeasure.total_capacity,
                rqi: energyConservationMeasure.refrigerating_quantity_indicator,
                totalHeat: energyConservationMeasure.total_heat,
                ci: energyConservationMeasure.calorimetric_index,
                cop: energyConservationMeasure.cop,
                eer: energyConservationMeasure.eer,
                iplv: energyConservationMeasure.iplv,
                bte: energyConservationMeasure.boiler_thermal_efficiency,
                ws: energyConservationMeasure.ws,
                ewK: energyConservationMeasure.exterior_wall_K,
                rk: energyConservationMeasure.roof_K,
                exteriorWindowK: energyConservationMeasure.exterior_window_K,
                exteriorWindowSC: energyConservationMeasure.exterior_window_SC,
                buildingOrientation: energyConservationMeasure.building_orientation,
                owcoar: energyConservationMeasure.owcoar,
                tcwcoar: energyConservationMeasure.tcwcoar,
                dohss: energyConservationMeasure.dohss,
                ehrf: energyConservationMeasure.exhaust_heat_recovery_form,
                nwats: energyConservationMeasure.nwats,
                potwcesm: energyConservationMeasure.potwcesm,
                whwhsd: energyConservationMeasure.whwhsd,
                cchpSystemDesign: energyConservationMeasure.cchp_system_design,
                reuf: energyConservationMeasure.renewable_energy_use_form,
                acscwst: energyConservationMeasure.acscwst,
                accwrt: energyConservationMeasure.accwrt,
                achawst: energyConservationMeasure.achawst,
                achwrt: energyConservationMeasure.achwrt,
                csh: energyConservationMeasure.cool_storage_heatstorage,
                vvf: energyConservationMeasure.ventilation_ventilation_form,
                sk: energyConservationMeasure.skylight_K,
                ssc: energyConservationMeasure.skylight_SC,
                wwr: energyConservationMeasure.wwr,
                sp: energyConservationMeasure.skylight_proportion
            };
        }
        if(indoorEnvironment != null){
            indoorEnvironmentMap = {
                id: indoorEnvironment.id,
                naturalVentilation: indoorEnvironment.natural_ventilation,
                naturalLighting: indoorEnvironment.natural_lighting,
                shade: indoorEnvironment.shade,
                improvedNaturalLighting: indoorEnvironment.improved_natural_lighting,
                aeoa: indoorEnvironment.adjustable_end_of_air,
                airQualityControl: indoorEnvironment.air_quality_control,
                accessibilityFacilities: indoorEnvironment.accessibility_facilities,
                nlsar: indoorEnvironment.natural_lighting_standard_area_ratio,
                shadingForm: indoorEnvironment.shading_form,
                inlm: indoorEnvironment.improve_natural_lighting_measures,
                actcm: indoorEnvironment.air_conditioning_terminal_control_means,
                aqcd: indoorEnvironment.air_quality_control_design,
                voaarfar: indoorEnvironment.voaarfar,
                nvm: indoorEnvironment.natural_ventilation_measures
            };
        }
        if(indoorEnvParaDesign != null){
            indoorEnvParaDesignMap = {
                id: indoorEnvParaDesign.id,
                functionRoom: indoorEnvParaDesign.function_room,
                st: indoorEnvParaDesign.summer_temperature,
                sh: indoorEnvParaDesign.summer_temperature,
                wt: indoorEnvParaDesign.winter_temperature,
                wh: indoorEnvParaDesign.winter_humidity,
                fav: indoorEnvParaDesign.fresh_air_volume,
                svoi: indoorEnvParaDesign.standard_values_of_illumination,
                ugr: indoorEnvParaDesign.ugr,
                u0: indoorEnvParaDesign.u0,
                ra: indoorEnvParaDesign.ra
            };
        }
        if(waterSaveDesign != null){
            waterSaveDesignMap = {
                id: waterSaveDesign.id,
                rainWaterSavings: waterSaveDesign.rain_water_savings,
                rainwaterRecycling: waterSaveDesign.rainwater_recycling,
                municipalWater: waterSaveDesign.municipal_water,
                homemadeWater: waterSaveDesign.homemade_water,
                com: waterSaveDesign.classification_of_measurement,
                waterSavingIrrigation: waterSaveDesign.water_saving_irrigation,
                coolingWaterConservation: waterSaveDesign.cooling_water_conservation,
                rainwaterSavingMeasure: waterSaveDesign.rainwater_saving_measure,
                uorfr: waterSaveDesign.use_of_rainwater_for_reuse,
                usow: waterSaveDesign.unconventional_sources_of_water,
                ntsowu: waterSaveDesign.non_traditional_sources_of_water_use,
                fowsi: waterSaveDesign.form_of_water_saving_irrigation,
                rainWaterReturn: waterSaveDesign.rain_water_return,
                wawc: waterSaveDesign.water_and_water_consumption,
                ntwa: waterSaveDesign.non_traditional_water_availability
            };
        }
        buildingMap = {
            aca: building.air_conditioning_area,
            address: building.address,
            adoptionStandard: building.adoption_standard,
            applicationUnit: building.application_unit,
            buildingArea: building.building_area,
            buildingClass: building.building_class,
            buildingOrientation: building.building_orientation,
            buildingProperty: building.building_property,
            city: building.city,
            climaticProvince: building.climatic_province,
            completionTime: building.completion_time,
            contact: building.contact,
            countNumber: building.count_number,
            createdOn: building.created_on,
            cun: building.construction_use_number,
            d2: building.D2,
            d9: building.D9,
            d13: building.D13,
            d15: building.D15,
            d16: building.D16,
            d17: building.D17,
            d21: building.D21,
            d22: building.D22,
            d25: building.D25,
            d27: building.D27,
            designIndicators: designIndicatorsMap,
            ecm: energyConservationMeasureMap,
            height: building.height,
            id: building.id,
            identifying: building.identifying,
            iepd: indoorEnvParaDesignMap,
            image: building.image,
            indoorEnvironment: indoorEnvironmentMap,
            latitude: building.latitude,
            level: building.level,
            longitude: building.longitude,
            name: building.name,
            number: building.number,
            participantOrganization: building.participant_organization,
            people: building.people,
            projectTime: building.project_time,
            province: building.province,
            remark: building.remark,
            serviceTime: building.service_time,
            subject: building.subject,
            time: building.time,
            type: building.type,
            unit: building.unit,
            updatedOn: building.updated_on,
            waterSavingDesign: waterSaveDesignMap
        };
        return buildingMap;
    }

    async singleBuildingPoint(buildingId){
        var buildingPoint = null;
        try {
            buildingPoint = await this.app.mysql.select('building_point', { where: {building_id: buildingId}});
        } catch (error) {
            return -1;
        }
        const buildingPointList = [];
        for(var key in buildingPoint){
            var sTime = buildingPoint[key].device_start_time;
            var eTime = buildingPoint[key].device_end_time;
            var survey = null;
            var answer = null;
            var device = null;
            try {
                survey = await this.app.mysql.query('select * from building_point_survey where survey_id is not null and building_point_id = ?', [buildingPoint[key].id]);
                if(survey.length != 0){
                    answer = await this.app.mysql.query('select * from answer where survey_id = ? and survey_relation_id in(select id from survey_relation where survey_id = ? and building_point_id = ?) order by created_on desc', [survey[0].id, survey[0].id, buildingPoint[key].id]);
                }
                device = await this.app.mysql.get('device', {id: buildingPoint[key].device_id});
            } catch (error) {
                console.log(error);
                return -1;
            }
            const buildingPointMap = {
                name: buildingPoint[key].name,
                id: buildingPoint[key].id,
                positionDesc: buildingPoint[key].position_desc,
                deviceName: device != null? device.name: '',
                deviceId: device != null? device.id: '',
                surveyTitle: survey.length != 0? survey.title != null? survey.title: '': '',
                surveyID: survey.length != 0? survey.id != null? survey.id: '': '',
                answerTime: answer != null? answer.created_on: '',
                startTime: sTime != null? this.ctx.helper.dateFormatOther(sTime): '',
                endTime: eTime != null? this.ctx.helper.dateFormatOther(eTime): '',
                image: buildingPoint[key].image,
                deviceStatus: device != null? device.Online_status == 'true'? true: false: '',
            };
            buildingPointList.push(buildingPointMap);
        }
        return buildingPointList;
    }

    async singleBuildingPointData(deviceId){
        var device = null;
        var data = null;
        var status = false;
        var tem  = '';
        var hum  = '';
        var pm   = '';
        var co2  = '';
        var lightIntensity = '';
        try {
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        if(device != null){
            if(device.type == 'coclean'){
                const param = {
                    deviceId: deviceId
                };
                const result = await this.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.readDeviceRealtimeDataUrl, param);
                if(result.result == 'success'){
                    status = true;
                    const dataBuf = result.data;
                    data = dataBuf.split(",");
                    tem = data[1];
                    hum = data[2];
                    pm = data[3];
                    co2 = data[4];
                    lightIntensity = data[5];
                }   
            }
        }
        const resultMap = {
            status: status,
            tem: tem,
            co2: co2,
            pm: pm,
            hum: hum,
            lightIntensity: lightIntensity,
        }
        return resultMap;
    }

    async singleBuildingSurvey(buildingId){
        var surveyIds = null;
        try {
            surveyIds = await this.app.mysql.select('building_survey', {where: {building_id: buildingId}});
        } catch (error) {
            return -1;
        }
        const surveyList = [];
        for(var key in surveyIds){
            var survey = null;
            var creator = null;
            var count = null;
            try {
                survey = await this.app.mysql.get('survey', {id: surveyIds[key].survey_id});
                creator = await this.app.mysql.get('user', {id: survey.creator_id});
                count = await this.app.mysql.query('select count(id) from answer where survey_id = ? and survey_relation_id in(select id from survey_relation where survey_id = ? and building_id = ?)', [survey.id, survey.id, buildingId]);
            } catch (error) {
                return -1;
            }

            const surveyMap = {
                id: survey.id,
                title: survey.title,
                introduction: survey.introduction,
                name: creator.name,
                count: count[0]['count(id)']
            }
            surveyList.push(surveyMap);
        }
        return surveyList;
    }

    async singleBuildingEnergy(buildingId){
        var energyConsumption = null;
        try {
            energyConsumption = await this.app.mysql.get('energy_consumption', {building_id: buildingId});
        } catch (error) {
            return -1;
        }
        const energyConsumptionMap = {
            id: energyConsumption != null? energyConsumption.id? energyConsumption.id: '': '',
            aeu: energyConsumption != null? energyConsumption.aeu? energyConsumption.aeu: '': '',
            elecDs: energyConsumption != null? energyConsumption.elec_ds? energyConsumption.elec_ds: '': '',
            elecComment: energyConsumption != null? energyConsumption.elec_comment? energyConsumption.elec_comment: '': '',
            secEs: energyConsumption != null? energyConsumption.sec_es? energyConsumption.sec_es: '': '',
            secAu: energyConsumption != null? energyConsumption.sec_au? energyConsumption.sec_au: '': '',
            secDs: energyConsumption != null? energyConsumption.sec_ds? energyConsumption.sec_ds: '': '',
            secComment: energyConsumption != null? energyConsumption.sec_comment? energyConsumption.sec_comment: '': '',
            thiEs: energyConsumption != null? energyConsumption.thi_es? energyConsumption.thi_es: '': '',
            thiAu: energyConsumption != null? energyConsumption.thi_au? energyConsumption.thi_au: '': '',
            thiDs: energyConsumption != null? energyConsumption.thi_ds? energyConsumption.thi_ds: '': '',
            thiCommen: energyConsumption != null? energyConsumption.thi_commen? energyConsumption.thi_commen: '': '',
            fouEs: energyConsumption != null? energyConsumption.fou_es? energyConsumption.fou_es: '': '',
            fouAu: energyConsumption != null? energyConsumption.fou_au? energyConsumption.fou_au: '': '',
            fouDs: energyConsumption != null? energyConsumption.fou_ds? energyConsumption.fou_ds: '': '',
            fouComment: energyConsumption != null? energyConsumption.fou_comment? energyConsumption.fou_comment: '': '',
            siteSource: energyConsumption != null? energyConsumption.site_source? energyConsumption.site_source: '': '',
            siteAu: energyConsumption != null? energyConsumption.site_au? energyConsumption.site_au: '': '',
            siteSd: energyConsumption != null? energyConsumption.site_sd? energyConsumption.site_sd: '': '',
            siteDs: energyConsumption != null? energyConsumption.site_ds? energyConsumption.site_ds: '': '',
            siteComment: energyConsumption != null? energyConsumption.site_comment? energyConsumption.site_comment: '': '',
            siteChpMm: energyConsumption != null? energyConsumption.site_chp_mm? energyConsumption.site_chp_mm: '': '',
            siteChpFs: energyConsumption != null? energyConsumption.site_chp_fs? energyConsumption.site_chp_fs: '': '',
            siteChpRp: energyConsumption != null? energyConsumption.site_chp_rp? energyConsumption.site_chp_rp: '': '',
            siteChpAfc: energyConsumption != null? energyConsumption.site_chp_afc? energyConsumption.site_chp_afc: '': '',
            siteChpAeg: energyConsumption != null? energyConsumption.site_chp_age? energyConsumption.site_chp_age: '': '',
            siteChpAhg: energyConsumption != null? energyConsumption.site_chp_ahg? energyConsumption.site_chp_ahg: '': '',
            siteChpComment: energyConsumption != null? energyConsumption.site_chp_comment? energyConsumption.site_chp_comment: '': '',
            seuDesc: energyConsumption != null? energyConsumption.seu_desc? energyConsumption.seu_desc: '': '',
            seuPs: energyConsumption != null? energyConsumption.seu_ps? energyConsumption.seu_ps: '': '',
            seuAeu: energyConsumption != null? energyConsumption.seu_aeu? energyConsumption.seu_aeu: '': '',
            seuComment: energyConsumption != null? energyConsumption.seu_comment? energyConsumption.seu_comment: '': '',
            ohWd: energyConsumption != null? energyConsumption.oh_wd? energyConsumption.oh_wd: '': '',
            nwd: energyConsumption != null? energyConsumption.nwd? energyConsumption.nwd: '': '',
            ohHd: energyConsumption != null? energyConsumption.oh_hd? energyConsumption.oh_hd: '': '',
            nhd: energyConsumption != null? energyConsumption.nhd? energyConsumption.nhd: '': '',
        };
        return energyConsumptionMap;
    }

    async singleBuildingSaveBaseInfo(data){
        const { app } = this;
        var image = '';
        if(data.image != ''){
            const images = data.image.split(',');
            for(var i = 0; i < images.length; ++i){
                if(i == images.length - 1){
                    image += images[i];
                    break;
                }
                image += images[i] + ',';
            }
        }
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 2000;
        try {
            var resource = "ibeem_test:building";
            const conn = await app.mysql.beginTransaction();
            var res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.update('building', {
                            id: data.id,
                            climatic_province: data.climaticProvince,
                            image: image,
                            latitude: data.latitude,
                            longitude: data.longitude,
                            building_class: data.buildingClass,
                            unit: data.unit,
                            subject: data.subject,
                            people: data.people,
                            contact: data.contact,
                            name: data.name,
                            type: data.type,
                            address: data.address,
                            province: data.province,
                            application_unit: data.applicationUnit,
                            participant_organization: data.participantOrganization,
                            time: data.time == ''? null: new Date(data.time),
                            adoption_standard: data.adoptionStandard,
                            level: data.level,
                            identifying: data.identifying,
                            project_time: new Date(data.projectTime),
                            completion_time: new Date(data.completionTime),
                            service_time: new Date(data.serviceTime),
                            building_area: data.buildingArea == ''? null: data.buildingArea,
                            building_orientation: data.buildingOrientation,
                            remark: data.remark,
                            air_conditioning_area: data.aca == ''? null: data.aca,
                            height: data.height == ''? null: data.height,
                            building_property: data.buildingProperty,
                            construction_use_number: data.cun == ''? null: data.cum,
                            count_number: data.countNumber == ''? null: data.countNumber,
                            number: data.number == ''? null: data.number,
                            updated_on: new Date()
                        });
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
            res = await redlock.lock(resource, ttl).then(function(lock){
                async function transation(){
                    try {
                        const buildingPoint = await app.mysql.select('building_point', { where:{building_id: data.id}});
                        for(var i in buildingPoint){
                            const result = await app.mysql.select('building_point', { where: {device_id: buildingPoint[i].device_id}});
                            var cname = '';
                            var bname = '';
                            for(var j in result){
                                const building = await app.mysql.get('building', {id: result[j].building_id});
                                if(j == result.length - 1){
                                    cname += result[j].name;
                                    bname += building.name;
                                    break;
                                }
                                cname += result[j].name + ',';
                                bname += building.name + ',';
                            }
                            await conn.update('device', {
                                id: buildingPoint[i].device_id,
                                cname: cname,
                                bname: bname,
                            });
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
            await conn.commit();
            return res;
        } catch (error) {
            return -1;
        }
    }

    async singleBuildingSaveDesignInfo(data){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 1000;
        var designIndicatorsId = null;
        try {
            designIndicatorsId = await app.mysql.query('select design_indicators_id from building where id = ?', [data.buildingID]);
        } catch (error) {
            return -1;
        }
        const row = {
            land_area: data.landArea == ''? null: data.landArea,
            building_area: data.buildingArea == ''? null: data.buildingArea,
            subsurface_area: data.subsurfaceArea == ''? null: data.subsurfaceArea,
            ground_floor_area: data.groundFloorArea == ''? null: data.groundFloorArea,
            gas: data.gas == ''? null: data.gas,
            municipal_heating: data.municipalHeating == ''? null: data.municipalHeating,
            electric_power: data.electricPower == ''? null: data.electricPower,
            coal: data.coal == ''? null: data.coal,
            ubadtec: data.ubadtec == ''? null: data.ubadtec,
            design_energy_efficiency_ratio: data.deer == ''? null: data.deer,
            thermal_performance_improvement: data.tpi == ''? null: data.tpi,
            hvaacsdec: data.hvaacsdec == ''? null: data.hvaacsdec,
            total_water: data.totalWater == ''? null: data.totalWater,
            non_conventional_water: data.ncw == ''? null: data.ncw,
            non_traditional_water_availability: data.ntwa == ''? null: data.ntwa,
            building_life_hot_water: data.blhw == ''? null: data.blhw,
            renewable_heat_capacity: data.rhc == ''? null: data.rhc,
            tpohwgbre: data.tpohwgbre == ''? null: data.tpohwgbre,
            building_electric_consumption: data.bec == ''? null: data.bec,
            renewable_capacity: data.renewableCapacity == ''? null: data.renewableCapacity,
            renewable_energy_generates_electricity: data.rege == ''? null: data.rege,
            deleted: 0,
            updated_on: new Date()
        };
        var resource = "ibeem_test:design_indicators";
        var res = null;
        try {
            if(designIndicatorsId[0].design_indicators_id){
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            row.id = designIndicatorsId[0].design_indicators_id;
                            await app.mysql.update('design_indicators', row);
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

            }else{
                const conn = await app.mysql.beginTransaction();
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            row.created_on = new Date();
                            const result = await conn.insert('design_indicators', row);
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return result;
                        } catch (error) {
                            conn.rollback();
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return -1;
                        }
                    }
                    return transation();
                });
                if(res == -1) return res;
                resource = "ibeem_test:building";
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            if(res.insertId){
                                await conn.update('building', {
                                    id: data.buildingID,
                                    design_indicators_id: res.insertId
                                });
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
                await conn.commit();
            }
            return res;
        } catch (error) {
            return -1;
        }
    }

    async singleBuildingSaveEnergyInfo(data){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 1000;
        var energyConservationMeasureId = null;
        try {
            energyConservationMeasureId = await app.mysql.query('select energy_conservation_measure_id from building where id = ?', [data.buildingID]);       
        } catch (error) {
            return -1;
        }
        const row = {
            owccbo: data.owccbo == ''? null: data.owccbo,
            exhaust_heat_recovery: data.ehr == ''? null: data.ehr,
            adjustable_wind_ratio: data.awr == ''? null: data.awr,
            partial_condition_energy_saving: data.pces == ''? null: data.pces,
            er_standard: data.erStandard == ''? null: data.erStandard,
            ws_standard: data.wsStandard == ''? null: data.wsStandard,
            whwhu: data.whwhu == ''? null: data.whwhu,
            itemized_metering: data.itemizedMetering == ''? null: data.itemizedMetering,
            cchp: data.cchp == ''? null: data.cchp,
            renewable_energy_use: data.reu == ''? null: data.reu,
            lighting_target_value: data.ltv == ''? null: data.ltv,
            lighting_control: data.lighting_control == ''? null: data.lighting_control,
            egceas: data.egceas == ''? null: data.egceas,
            energy_saving_electrical_equipment: data.esee == ''? null: data.esee,
            cool_storage_heatstorage: data.csh == ''? null: data.csh,
            ventilation_ventilation_form: data.vvf == ''? null: data.vvf,
            cold_source_form: data.csf,
            tfotds: data.tfotds,
            end_system: data.endSystem,
            total_capacity: data.totalCapacity == ''? null: data.totalCapacity,
            refrigerating_quantity_indicator: data.rqi == ''? null: data.rqi,
            total_heat: data.totalHeat == ''? null: data.totalHeat,
            calorimetric_index: data.ci == ''? null: data.ci,
            cop: data.cop == ''? null: data.cop,
            eer: data.eer == ''? null: data.eer,
            iplv: data.iplv,
            boiler_thermal_efficiency: data.bte == ''? null: data.bte,
            ws: data.ws,
            exterior_wall_K: data.ewK == ''? null: data.ewK,
            roof_K: data.rk == ''? null: data.rk,
            exterior_window_K: data.exteriorWindowK == ''? null: data.exteriorWindowK,
            exterior_window_SC: data.exteriorWindowSC == ''? null: data.exteriorWindowSC,
            building_orientation: data.buildingOrientation,
            owcoar: data.owcoar == ''? null: data.owcoar,
            tcwcoar: data.tcwcoar == ''? null: data.tcwcoar,
            dohss: data.dohss,
            exhaust_heat_recovery_form: data.ehrf,
            nwats: data.nwats,
            potwcesm: data.potwcesm,
            whwhsd: data.whwhsd,
            cchp_system_design: data.cchpSystemDesign,
            renewable_energy_use_form: data.reuf,
            skylight_K: data.sk == ''? null: data.sk,
            skylight_SC: data.ssc == ''? null: data.ssc,
            wwr: data.wwr == ''? null: data.wwr,
            skylight_proportion: data.sp == ''? null: data.sp,
            acscwst: data.acscwst == ''? null: data.acscwst,
            accwrt: data.accwrt == ''? null: data.accwrt,
            achawst: data.achawst == ''? null: data.achawst,
            achwrt: data.achwrt == ''? null: data.achwrt,
            deleted: 0,
            updated_on: new Date()
        };
        var resource = "ibeem_test:energy_conservation_measure";
        var res = null;
        try {
            if(energyConservationMeasureId[0].energy_conservation_measure_id){
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            row.id = energyConservationMeasureId[0].energy_conservation_measure_id;
                            await app.mysql.update('energy_conservation_measure', row);
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
            }else{
                const conn = await app.mysql.beginTransaction();
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            row.created_on = new Date();
                            const result = await conn.insert('energy_conservation_measure', row);
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return result;
                        } catch (error) {
                            conn.rollback();
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return -1;
                        }
                    }
                    return transation();
                });
                if(res == -1) return res;
                resource = "ibeem_test:building";
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            if(res.insertId){
                                await conn.update('building', {
                                    id: data.buildingID,
                                    energy_conservation_measure_id: res.insertId
                                });
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
                await conn.commit();
            }
            return res;
        } catch (error) {
            return -1;
        }
    }

    async singleBuildingSaveIndoorInfo(data){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 1000;
        var indoorEnvironmentId = null;
        try {
            indoorEnvironmentId = await app.mysql.query('select indoor_environment_id from building where id = ?', [data.buildingID]);         
        } catch (error) {
            return -1;
        }
        const row = {
            natural_ventilation: data.naturalVentilation,
            natural_lighting: data.naturalLighting,
            shade: data.shade,
            improved_natural_lighting: data.improvedNaturalLighting,
            adjustable_end_of_air: data.aeoa,
            air_quality_control: data.airQualityControl,
            accessibility_facilities: data.accessibilityFacilities,
            natural_ventilation_measures: data.nvm,
            voaarfar: data.voaarfar,
            natural_lighting_standard_area_ratio: data.nlsar == ''? null: data.nlsar,
            shading_form: data.shadingForm,
            improve_natural_lighting_measures: data.inlm,
            air_conditioning_terminal_control_means: data.actcm,
            air_quality_control_design: data.aqcd,
            deleted: 0,
            updated_on: new Date()
        };
        var resource = "ibeem_test:indoor_environment";
        var res = null;
        try {
            if(indoorEnvironmentId[0].indoor_environment_id){
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            row.id = indoorEnvironmentId[0].indoor_environment_id;
                            await app.mysql.update('indoor_environment', row);
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
            }else{
                const conn = await app.mysql.beginTransaction();
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                                row.created_on = new Date();
                                const result = await conn.insert('indoor_environment', row);
                                lock.unlock()
                                .catch(function(err) {
                                    console.error(err);
                                });
                                return result;
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
                resource = "ibeem_test:building";
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            if(res.insertId){
                                await conn.update('building', {
                                    id: data.buildingID,
                                    indoor_environment_id: res.insertId
                                });
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
                await conn.commit();
            }
            return res;
        } catch (error) {
            return -1;
        }
    }

    async singleBuildingSaveParameterInfo(data){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 1000;
        var indoorEenvironmentParameterDesign = null;
        try {
            indoorEenvironmentParameterDesign = await app.mysql.query('select indoor_environment_parameter_design_id from building where id = ?', [data.buildingID]);
        } catch (error) {
            return -1;
        }
        const row = {
            function_room: data.functionRoom,
            summer_temperature: data.st == ''? null: data.st,
            summer_humidity: data.sh == ''? null: data.sh,
            winter_temperature: data.wt == ''? null: data.wt,
            winter_humidity: data.wh == ''? null: data.wh,
            fresh_air_volume: data.fav == ''? null: data.fav,
            standard_values_of_illumination: data.svoi == ''? null: data.svoi,
            ugr: data.ugr == ''? null: data.ugr,
            u0: data.u0 == ''? null: data.u0,
            ra: data.ra == ''? null: data.ra,
            deleted: 0,
            updated_on: new Date()
        };
        var resource = "ibeem_test:indoor_environment_parameter_design";
        var res = null;
        try {
            if(indoorEenvironmentParameterDesign[0].indoor_environment_parameter_design_id){
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            row.id = indoorEenvironmentParameterDesign[0].indoor_environment_parameter_design_id;
                            await app.mysql.update('indoor_environment_parameter_design', row);
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
            }else{
                const conn = await app.mysql.beginTransaction();
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            row.created_on = new Date();
                            const result = await conn.insert('indoor_environment_parameter_design', row);
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return result;
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
                resource = "ibeem_test:building";
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            if(res.insertId){
                                await conn.update('building', {
                                    id: data.buildingID,
                                    indoor_environment_parameter_design_id: res.insertId
                                });
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
                await conn.commit();
            }
            return res;
        } catch (error) {
            return -1;
        }
    }

    async singleBuildingSaveWaterInfo(data){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 1000;
        var waterSavingDesign = null;
        try {
            waterSavingDesign = await app.mysql.query('select water_saving_design_id from building where id = ?', [data.buildingID]);
        } catch (error) {
            return -1;
        }
        const row = {
            rain_water_savings: data.rainWaterSavings,
            rainwater_recycling: data.rainwaterRecycling,
            municipal_water: data.municipalWater,
            homemade_water: data.homemadeWater,
            classification_of_measurement: data.com,
            water_saving_irrigation: data.waterSavingIrrigation,
            cooling_water_conservation: data.coolingWaterConservation,
            rainwater_saving_measure: data.rainwaterSavingMeasure,
            use_of_rainwater_for_reuse: data.uorfr,
            unconventional_sources_of_water: data.usow,
            non_traditional_sources_of_water_use: data.ntsowu,
            form_of_water_saving_irrigation: data.fowsi,
            rain_water_return: data.rainWaterReturn == ''? null: data.rainWaterReturn,
            water_and_water_consumption: data.wawc == ''? null: data.wawc,
            non_traditional_water_availability: data.ntwa == ''? null: data.ntwa,
            updated_on: new Date()
        };
        var resource = "ibeem_test:water_saving_design";
        var res = null;
        try {
            if(waterSavingDesign[0].water_saving_design_id){
                res =  await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            row.id = waterSavingDesign[0].water_saving_design_id;
                            await app.mysql.update('water_saving_design', row);
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
            }else{
                const conn = await app.mysql.beginTransaction();
                res =  await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            row.created_on = new Date();
                            const result = await conn.insert('water_saving_design', row);
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return result;
                        }catch(error){
                            conn.rollback();
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return -1;
                        }
                    }
                    return transation();
                });
                resource = "ibeem_test:building";
                res =  await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            if(res.insertId){
                                await conn.update('building', {
                                    id: data.buildingID,
                                    water_saving_design_id: res.insertId
                                });
                            }
                        }catch(error){
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
            }
            return res;
        } catch (error) {
            return -1;
        }
    }

    async singleBuildingPointDelete(buildingPointId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const conn = await app.mysql.beginTransaction();
        var ttl = 1000;
        var buildingPoint = null;
        try {
            buildingPoint = await app.mysql.get('building_point', { id: buildingPointId });
        } catch (error) {
            return -1;
        }
        try {
            var resource = "ibeem_test:building_point_survey";
            var res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('building_point_survey', {building_point_id: buildingPointId});
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
                        await conn.delete('survey_relation', {building_point_id: buildingPointId});
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
                        await conn.delete('building_point', {id: buildingPointId});
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
                        if(buildingPoint.device_id){
                            const result = await app.mysql.select('building_point', { where: {device_id: buildingPoint.device_id}});
                            var cname = '';
                            var bname = '';
                            for(var j in result){
                                const building = await app.mysql.get('building', {id: result[j].building_id});
                                if(j == result.length - 1){
                                    cname += result[j].name;
                                    bname += building.name;
                                    break;
                                }
                                cname += result[j].name + ',';
                                bname += building.name + ',';
                            }
                            await conn.update('device', {
                                id: buildingPoint.device_id,
                                cname: cname,
                                bname: bname,
                            });
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
            await conn.commit();
            return res;
        } catch (error) {
            return -1;
        }
    }

    async singleBuildingPointDeviceDetail(deviceId, sTime, eTime){
        var device = null;
        try {
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        if(device == null){
            return null;
        }
        const daviceDataList = [];
        const resultList = [];
        const dayTime = 24 * 60 * 60;
        if(device.type == "coclean"){
            sTime = parseInt(sTime);
            eTime = parseInt(eTime);
            while(sTime < eTime){
                var tempTime = sTime + dayTime;
                if(tempTime > eTime){
                    tempTime = eTime;
                }
                const param = {
                    startTime: sTime,
                    endTime: tempTime,
                    deviceId: deviceId,
                    page: 1,
                    pageSize: 1440
                };
                const result = await this.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.readDeviceDataUrl, param);
                if(result.result == 'success'){
                    for(var key in result.data){
                        const dataMap = {
                            time: parseInt(result.data[key].time),
                            tem: result.data[key].d1,
                            hum: result.data[key].d2,
                            pm: result.data[key].d3,
                            co2: result.data[key].d4,
                            lightIntensity: result.data[key].d5
                        };
                        resultList.push(dataMap);
                    }
                }
                sTime += dayTime;
            }
            for(var key in resultList){
                daviceDataList.push(resultList[key]);
            }
        }else if(device.type == "ibeem"){
            const param = "q=" + deviceId + "&s=" + this.ctx.helper.dateFormat(new Date(sTime * 1000)) + "&e=" + this.ctx.helper.dateFormat(new Date(eTime * 1000));
            const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceData, param);
            for(var key in result.data){
                for(var i in result.data[key].dev_data){
                    const resultMap = {
                        tem: result.data[key].dev_data[i].wd,
                        hum: result.data[key].dev_data[i].sd,
                        pm:  result.data[key].dev_data[i].pm25,
                        co2: result.data[key].dev_data[i].co2,
                        lightIntensity: result.data[key].dev_data[i].zd,
                        time: parseInt(result.data[key].dev_data[i].time)
                    }
                    resultList.push(resultMap);
                }
            }
        }
        const resData = {
            deviceData: daviceDataList,
            deviceName: device.name
        };
        return resData;
    }

    async singleBuildingPointUpdate(data){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const conn = await app.mysql.beginTransaction();
        var ttl = 1000;
        try {
            var resource = "ibeem_test:building_point";
            var res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.update('building_point', {
                            id: data.buildingPointID,
                            updated_on: new Date(),
                            device_id: data.deviceID == undefined || data.deviceID == ''? null: data.deviceID,
                            name: data.name,
                            position_desc: data.positionDesc,
                            image: data.image,
                            device_start_time: data.startTime == -1? null: new Date(data.startTime),
                            device_end_time: data.endTime == -1? null: new Date(data.endTime)
                        });
                    } catch (error) {
                        console.log(error);
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
                        if(data.surveyID != ''){
                            const buildingPointSurvey = await conn.get('building_point_survey', {building_point_id: data.buildingPointID});
                            if(buildingPointSurvey){
                                await conn.update('building_point_survey', {
                                    id: buildingPointSurvey.id,
                                    survey_id: data.surveyID,
                                    updated_on: new Date()
                                });
                            }else{
                                await conn.insert('building_point_survey', {
                                    survey_id: data.surveyID,
                                    building_point_id: data.buildingPointID,
                                    created_on: new Date(),
                                    updated_on: new Date(),
                                    deleted: 0
                                })
                            }
                        }
                    } catch (error) {
                        console.log(error);
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
            const buildingPoint = await app.mysql.get('building_point', {id: data.buildingPointID});
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        const surveyRelation = await conn.get('survey_relation', {building_point_id: data.buildingPointID});
                        const building = await conn.get('building', {id: buildingPoint.building_id});
                        if(surveyRelation == null){
                            await conn.insert('survey_relation', {
                                survey_id: data.surveyID == ''? null: data.surveyID,
                                project_id: building.project_id,
                                building_id: building.id,
                                building_point_id: buildingPoint.id,
                                relation: 3,
                                created_on: new Date(),
                                updated_on: new Date(),
                                deleted: 0
                            });
                        }else{
                            await conn.update('survey_relation', {
                                id: surveyRelation.id,
                                survey_id: data.surveyID == ''? null: data.surveyID,
                                updated_on: new Date()
                            });
                        }
                    } catch (error) {
                        console.log(error);
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
                        if(data.deviceID){
                            const result = await app.mysql.select('building_point', { where: {device_id: data.deviceID}});
                            var cname = '';
                            var bname = '';
                            for(var j in result){
                                const building = await app.mysql.get('building', {id: result[j].building_id});
                                if(j == result.length - 1){
                                    cname += result[j].name;
                                    bname += building.name;
                                    break;
                                }
                                cname += result[j].name + ',';
                                bname += building.name + ',';
                            }
                            await conn.update('device', {
                                id: buildingPoint.device_id,
                                cname: cname,
                                bname: bname,
                            });
                        }
                    } catch (error) {
                        console.log(error);
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

    async singleBuildingPointInfo(buildingId){
        var buildingPoint = null;
        try {
            buildingPoint = await this.app.mysql.select('building_point', {building_id: buildingId});
        } catch (error) {
            return -1;
        }
        const resultList = [];
        if(buildingPoint.length != 0){
            for(var key in buildingPoint){
                var survey = null;
                var answer = null;
                var device = null;
                try {
                    const buildingPointSurvey = await this.app.mysql.get('building_point_survey', {building_point_id: buildingPoint[key].id});
                    if(buildingPointSurvey && buildingPointSurvey.survey_id){
                        survey = await this.app.mysql.get('survey', {id: buildingPointSurvey.survey_id});
                        answer = await this.app.mysql.query('select * from answer where survey_id = ? and survey_relation_id in(select id from survey_relation where survey_id = ? and building_point_id = ?) order by created_on desc', [survey.id, survey.id, buildingPoint[key].id]);
                    }
                    if(buildingPoint[key].device_id){
                        device = await this.app.mysql.get('device', {id: buildingPoint[key].device_id});
                    }
                } catch (error) {
                    console.log(error);
                    return -1;
                }
                const resultMap = {
                    name: buildingPoint[key].name,
                    id: buildingPoint[key].id,
                    positionDesc: buildingPoint[key].position_desc,
                    deviceName: device == null? null: device.name,
                    deviceID: device == null? null: device.id,
                    surveyTitle: survey == null? '': survey.title,
                    surveyID: survey == null? null: survey.id,
                    answerTime: answer == null? '': this.ctx.helper.dateFormat(answer.created_on),
                    startTime: buildingPoint.device_start_time == null? '': this.ctx.helper.dateFormatOther(buildingPoint.device_start_time),
                    endTime: buildingPoint.device_end_time == null? '': this.ctx.helper.dateFormatOther(buildingPoint.device_end_time),
                    image: buildingPoint.image,
                    deviceStatus: device != null && device.Online_status == 'true'? true: false 
                };
                resultList.push(resultMap);
            }
        }
        return resultList;
    }

    async singleBuildingPointDeviceRelevant(projectId){
        var devices = null;
        try {
            devices = await this.app.mysql.query('select id, name from device where project_id = ? and id not in(select device_id from building_point where device_id is not null)', [projectId]);
        } catch (error) {
            return -1;
        }
        return devices;
    }

    async singleBuildingPointSurveyRelevant(projectId){
        var surveys = null;
        try {
            surveys = await this.app.mysql.query('select * from survey where project_id = ?', [projectId]);
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in surveys){
            const user = await this.app.mysql.get('user', {id: surveys[key].creator_id});
            const answerCount = await this.app.mysql.query('select count(id) from answer where survey_id = ?', [surveys[key].id]);
            const resultMap = {
                id: surveys[key].id,
                title: surveys[key].title,
                introduction: surveys[key].introduction,
                name: user.name,
                count: answerCount[0]['count(id)']
            }
            resultList.push(resultMap);
        }
        return resultList;
    }

    async singleBuildingPointSurveyDetail(surveyId, startTime, endTime, relation, projectId){
        return -1;
    }

    async singleBuildingSurveyAdd(userId, buildingId){
        var survey = null;
        try {
            const building = await this.app.mysql.get('building', {id: buildingId});
            const project = await this.app.mysql.get('project', {id: building.project_id});
            survey = await this.app.mysql.query('select id, title from survey where (creator_id = ? or creator_id = ?) and id not in(select survey_id from building_survey where  building_id = ?)', [userId, project.creator_id, buildingId]);
        } catch (error) {
            console.log(error)
            return -1;
        }
        return survey;
    }

    async singleBuildingSurveyBind(buildingId, surveyId){
        const { app } = this;
        var building = null;
        var survey = null;
        try {
            building = await app.mysql.get('building', {id: buildingId});
            survey = await app.mysql.get('survey', {id: surveyId});
        } catch (error) {
            console.log(error);
            return -1;
        }

        const redlock = this.service.utils.lock.lockInit();
        const conn = await app.mysql.beginTransaction();
        var ttl = 1000;
        try {
            var resource = "ibeem_test:building_survey";
            var res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.insert('building_survey', {
                            building_id: building.id,
                            created_on: new Date(),
                            survey_id: survey.id
                        });
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
                        await conn.insert('survey_relation', {
                            building_id: building.id,
                            created_on: new Date(),
                            project_id: building.project_id,
                            relation: 2,
                            survey_id: survey.id
                        });
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

    async singleBuildingEnergyUpdate(data){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:energy_consumption";
        var ttl = 1000;
        try {
            const res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        const energyConsumption = await app.mysql.get('energy_consumption', {building_id: data.buildingID});
                        const row = {
                            building_id: data.buildingID == ''? null: data.buildingID,
                            aeu: data.aeu == ''? null: data.aeu,
                            elec_ds: data.elecDs,
                            elec_comment: data.elecComment,
                            sec_es: data.secEs,
                            sec_au: data.secAu == ''? null: data.secAu,
                            sec_ds: data.secDs,
                            sec_comment: data.secComment,
                            thi_es: data.thiEs,
                            thi_au: data.thiAu == ''? null: data.thiAu,
                            thi_ds: data.thiDs,
                            thi_comment: data.thiComment,
                            fou_es: data.fouEs,
                            fou_au: data.fouAu == ''? null: data.fouAu,
                            fou_ds: data.fouDs,
                            fou_comment: data.fouComment,
                            site_source: data.siteSource,
                            site_sd: data.siteSd,
                            site_au: data.siteAu == ''? null: data.siteAu,
                            site_ds: data.siteDs,
                            site_comment: data.siteComment,
                            site_chp_mm: data.siteChpMm,
                            site_chp_fs: data.siteChpFs,
                            site_chp_rp: data.siteChpRp == ''? null: data.siteChpRp,
                            site_chp_afc: data.siteChpAfc == ''? null: data.siteChpAfc,
                            site_chp_aeg: data.siteChpAeg == ''? null: data.siteChpAeg,
                            site_chp_ahg: data.siteChpAhg == ''? null: data.siteChpAhg,
                            site_chp_comment: data.siteChpComment,
                            seu_desc: data.seuDesc,
                            seu_ps: data.seuPs,
                            seu_aeu: data.seuAeu == ''? null: data.seuAeu,
                            seu_comment: data.seuComment,
                            oh_wd: data.ohWd == ''? null: data.ohWd,
                            nhd: data.nhd == ''? null: data.nhd,
                            updated_on: new Date(),
                            deleted: 0
                        };
                        if(energyConsumption){
                            row.id = energyConsumption.id;
                            await app.mysql.update('energy_consumption', row);
                        }else{
                            row.created_on = new Date();
                            await app.mysql.insert('energy_consumption', row);
                        }
                    } catch (error) {
                        console.log(error);
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

    async singleMemberSearch(key, projectId){
        var user = null;
        try {
            const keyStr = '%' + key + '%';
            user = await this.app.mysql.query('select id, name, portrait from user where (name like ? or user_name like ?) and id not in(select user_id from user_project where project_id = ?)', [keyStr, key, projectId]);
        } catch (error) {
            return -1;
        }
        return user;
    }

    async singleMemberAdd(userId, projectId){
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

    async singleMemberDelete(userId, projectId){
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

    async singleMemberSetManager(userId, projectId){
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

    async singleMemberManagerRevocation(userId, projectId){
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
                        if(userProject.role == 1){
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

    async singleTopBuilding(buildingId){
        var topBuilding = null;
        try {
            topBuilding = await this.app.mysql.get('top_building', {id: buildingId});
        } catch (error) {
            return -1;
        }
        return topBuilding;
    }

    async singleTopBuildingRoomInfo(buildingId){
        var topRoom = null;
        try {
            topRoom = await this.app.mysql.select('top_room', {where: {top_building_id: buildingId}});
        } catch (error) {
            return -1;
        }
        const topRoomList = [];
        for(var key in topRoom){
            const topRoomMap = {
                rid: topRoom[key].id,
                floorLocation: topRoom[key].floor_location,
                grossInternalArea: topRoom[key].gross_internal_area,
                roomType: topRoom[key].room_type
            };
            const topElementList = [];
            const topElement = null;
            try {
                topElement = await this.app.mysql.select('top_element', {where: {top_room_id: topRoom[key].id}});
            } catch (error) {
                return -1;
            }
            for(var j in topElement){
                const topElementMap = {
                    eid: topElement[j].id,
                    elementArea: topElement[j].element_area,
                    elementType: topElement[j].element_type,
                    elementUValue: topElement[j].element_u_value
                };
                topElementList.push(topElementMap);
            }
            topRoomMap.topElementList = topElementList;
            topRoomList.push(topRoomMap);
        }
        return topRoomList;
    }
}

module.exports = ProjectService;