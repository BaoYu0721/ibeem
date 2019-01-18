'use strict';

const Service = require('egg').Service;

class IndexService extends Service {
    async getDeviceDataCountList(){
        var dataList = null;
        try {
            dataList = await this.app.mysql.query('SELECT name,num FROM (SELECT COUNT(1) num ,device_id deviceid FROM device_data GROUP BY device_id ORDER BY num DESC LIMIT 100) d,device  WHERE d.deviceid = id');
        } catch (error) {
            return -1;
        }
        const xAxis = [];
        const yAxis = [];
        for(var key in dataList){
            xAxis.push(dataList[key].name),
            yAxis.push(dataList[key].num)
        }

        return {
            xAxis: xAxis,
            yAxis: yAxis
        };
    }

    async getCount(){
        const { app } = this;
        try {
            const mysqlSize = await app.mysql.query('SELECT (SUM(DATA_LENGTH)+SUM(INDEX_LENGTH))/(1024*1024*1024) FROM information_schema.tables WHERE table_schema="ibeem_test"');
            const mongodbSize = '...';
            const deviceDataCount = await app.mysql.query('select count(1) from device_data');
            const surveyCount = await app.mysql.query('select count(1) from survey');
            const deviceCount = await app.mysql.query('select count(1) from device');
            const buildingCount = await app.mysql.query('select count(1) from building');
            const userCount = await app.mysql.query('select count(1) from user');
            const resData = {
                mysqlSize: Object.values(mysqlSize[0])[0],
                mongodbSize: mongodbSize,
                deviceDataCount: deviceDataCount[0]['count(1)'],
                surveyCount: surveyCount[0]['count(1)'],
                deviceCount: deviceCount[0]['count(1)'],
                buildingCount: buildingCount[0]['count(1)'],
                userCount: userCount[0]['count(1)']
            };
            return resData;
        } catch (error) {
            return -1;
        }
    }
}

module.exports = IndexService;