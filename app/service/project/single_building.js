'use strict';

const Service = require('egg').Service;

class SingleBuildingService extends Service {
    async ibeemBuildingIncrease(userId, projectId,
        buildingName, buildingClass, city, longitude, latitude, climatic){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:ibeemBuilding:add";
        var ttl = 1000;

        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                try {
                    await app.mysql.insert('building', {
                        source: 0, 
                        city: city,
                        created_on: new Date(), 
                        name: buildingName,
                        longitude: longitude,
                        latitude: latitude,
                        project_id: projectId,
                        user_id: userId,
                        type: '办公',
                        level: '五星级',
                        climatic_province: climatic,
                        building_class: buildingClass
                    });
                } catch (error) {
                    lock.unlock();
                    return -1;
                }
                lock.unlock();
                return 0;
            }
            return transation();
        });
    }

    async topBuildingIncrease(projectId, buildingName){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:topBuilding:add";
        var ttl = 1000;

        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                try {
                    await app.mysql.insert('top_building', {
                        project_id: projectId,
                        name: buildingName,
                        created_on: new Date(),
                        updated_on: new Date(),
                    });
                } catch (error) {
                    lock.unlock();
                    return -1;
                }
                lock.unlock();
                return 0;
            }
            return transation();
        });
    }

    async ibeemBuildingDelete(buildingId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:ibeemBuilding:delete";
        var ttl = 2000;

        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                const conn = await app.mysql.beginTransaction();
                try {
                    await conn.delete('key_parameter', {building_id: buildingId});
                    await conn.delete('technology', {building_id: buildingId});
                    await conn.delete('project_building', {building_id: buildingId});
                    await conn.delete('building_survey', {building_id: buildingId});
                    await conn.query('update survey set building_id = ? where building_id = ?', [null, buildingId]);
                    await conn.query('update survey_relation set building_id = ? where building_id = ?', [null, buildingId]);
                    await conn.query('update device set building_id = ? where building_id = ?', [null, buildingId]);
                    await conn.delete('building', {id: buildingId});
                    await conn.commit();
                } catch (error) {
                    conn.rollback();
                    lock.unlock();
                    return -1;
                }
                lock.unlock();
                return 0;
            }
            return transation();
        });
    }

    async topBuildingDelete(buildingId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:topBuilding:delete";
        var ttl = 2000;
        console.log(buildingId);
        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                const conn = await app.mysql.beginTransaction();
                try {
                    const topRoom = await conn.select('top_room', {top_building_id: buildingId});
                    for(var key in topRoom){
                        await conn.delete('top_element', {top_room_id: topRoom[key]});
                    }
                    await conn.delete('top_room', {top_building_id: buildingId});
                    await conn.delete('top_building', {id: buildingId});
                    await conn.commit();
                } catch (error) {
                    conn.rollback();
                    lock.unlock();
                    return -1;
                }
                lock.unlock();
                return 0;
            }
            return transation();
        })
    }
}

module.exports = SingleBuildingService;