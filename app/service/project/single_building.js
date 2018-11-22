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
                        level: '无星级',
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

    async buildingView(buildingId){
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

    async buildingInfomation(projectId){
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
            building = await this.app.mysql.get('building', {id: projectId});
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
                id: indoorEnvironmentMap.id,
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

    async buildingPoint(buildingId){
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
                startTime: sTime != null? sTime: '',
                endTime: eTime != null? eTime: '',
                image: buildingPoint[key].image,
                deviceStatus: device != null? device.Online_status == 'true'? true: false: '',
            };
            buildingPointList.push(buildingPointMap);
        }
        return buildingPointList;
    }

    async buildingPointData(deviceId){
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
                const result = await this.service.utils.http.getCocleanData(deviceId);
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

    async buildingSurvey(buildingId){
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

    async buildingEnergy(buildingId){
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
}

module.exports = SingleBuildingService;