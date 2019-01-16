'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware} = app;

  const userRequired = middleware.userRequired();
  const loginRequired = middleware.loginRequired();
  const adminRequired = middleware.adminRequired();

  // common
  router.get('/common/alert', controller.common.alert);
  router.get('/common/alert_ok',controller.common.alertOk);
  router.get('/common/alert_ok2', controller.common.alertOk2);
  router.get('/common/loading', controller.common.loading);
  router.get('/common/mobilealertOk', controller.common.mobilealertOk);
  router.get('/common/mobileloading', controller.common.mobileloading);
  router.get('/common/leftpanel', userRequired, controller.common.leftpanel);
  router.get('/common/admin/leftpanel', adminRequired, controller.common.adminLeftpanel);
  router.get('/common/team_list_item', controller.common.teamListItem);
  router.get('/common/questionDX', controller.common.questionDx);
  router.get('/common/questionDDX', controller.common.questionDDX);
  router.get('/common/questionTK', controller.common.questionTK);
  router.get('/common/questionLB', controller.common.questionLB);
  router.get('/common/questionZX', controller.common.questionZX);
  router.get('/common/questionDL', controller.common.questionDL);
  router.get('/common/member/list', controller.common.memberList);
  router.post('/common/upload', controller.common.upload);
  router.get('/common/tjDX', controller.common.tjDX);
  router.get('/common/tjHK', controller.common.tjHK);
  router.get('/common/tjLB', controller.common.tjLB);
  router.get('/common/tjTK', controller.common.tjTK);
  router.get('/common/tjTKModal', controller.common.tjTKModal);
  router.get('/common/analysis1', controller.common.analysis1);
  router.get('/common/analysis2', controller.common.analysis2);

  // index
  router.get('/', loginRequired, controller.index.index);
  router.post('/index/building_list', userRequired, controller.index.buildingList);
  router.post('/index/device_list', userRequired, controller.index.deviceList);
  router.post('/index/survey_list', userRequired, controller.index.surveyList);
  
  // login&logout
  router.get('/user', controller.sign.index.index);
  router.post('/user/login', controller.sign.login.loginAuth);
  router.post('/user/logout', loginRequired, controller.sign.logout.index);
  router.post('/user/find_password', controller.sign.forgetPassword.findPassword);
  router.post('/user/register', controller.sign.register.userRegister);
  
  // device
  router.get('/device', userRequired, controller.device.index.index);
  router.post('/device/page_list', userRequired, controller.device.index.pageList);
  router.post('/device/location', userRequired, controller.device.index.location);
  router.post('/device/parameter', userRequired, controller.device.index.parameter);
  router.post('/device/info', userRequired, controller.device.index.deviceInfo);
  router.post('/device/update', userRequired, controller.device.index.deviceUpdate);
  router.post('/device/assessment', userRequired, controller.device.assessment.index);
  router.post('/device/assessment/save', userRequired, controller.device.assessment.save);
  router.post('/device/search', userRequired, controller.device.search.search);
  router.post('/device/download/history', userRequired, controller.device.download.history);
  router.post('/device/download/create_work_order', userRequired, controller.device.download.createWorkOrder);
  router.post('/device/view/on_line_rate', userRequired, controller.device.view.getOnlineRate);
  router.post('/device/view/environment', userRequired, controller.device.view.getEnvironmentData);
  router.post('/device/view/environment_data_align', userRequired, controller.device.view.environmentDataAlign);
  router.post('/device/view/standard_rate', userRequired, controller.device.view.getDeviceComplianceRate);
  router.post('/device/status', userRequired, controller.device.status.getStatus);
  
  // survey
  router.get('/survey', userRequired, controller.survey.index.index);
  router.post('/survey/list', userRequired, controller.survey.index.surveyList);
  router.post('/survey/question_list', userRequired, controller.survey.index.questionList);
  router.post('/survey/getSurveyByID', userRequired, controller.survey.mobile.getSurveyByID);
  router.post('/survey/download/answer', userRequired, controller.survey.download.answer);
  router.post('/survey/download/question', userRequired, controller.survey.download.question);
  router.post('/survey/increase/commit', userRequired, controller.survey.increase.commit);
  router.post('/survey/library/add', userRequired, controller.survey.library.libraryAdd);
  router.post('/survey/statistics', userRequired, controller.survey.statistics.surveyStatistics);
  router.post('/survey/delete', userRequired, controller.survey.delete.surveyDelete);
  router.post('/survey/increase/question/select', userRequired, controller.survey.increase.questionSelect);
  router.get('/survey/mobileSurveySuccess', controller.survey.mobile.mobileSurveySuccess);
  router.get('/survey/mobileSurvey', controller.survey.mobile.index);
  router.post('/survey/answerSurvey', controller.survey.mobile.answerSurvey);
  router.post('/survey/updateSurvey', userRequired, controller.survey.increase.updateSurvey);
  router.post('/survey/getDimension', userRequired, controller.survey.analyze.getDimension);
  router.post('/survey/analysisSurvey', userRequired, controller.survey.analyze.analysisSurvey);

  // project
  router.get('/project', userRequired, controller.project.index.index);
  router.get('/project/building/export', userRequired, controller.project.index.buildingExport);
  router.post('/project/list', userRequired, controller.project.index.projectList);
  router.post('/project/increase', userRequired, controller.project.increase.projectIncrease);
  router.post('/project/single/update', userRequired, controller.project.single.projectUpdate);
  router.post('/project/single/delete', userRequired, controller.project.single.projectDelete);
  router.post('/project/single/info', userRequired, controller.project.single.projectInfo);
  router.post('/project/single/building', userRequired, controller.project.single.buildingInfo);
  router.post('/project/single/building/increase', userRequired, controller.project.singleBuilding.buildingIncrease);
  router.post('/project/single/building/import', userRequired, controller.project.singleBuilding.buildingImport);
  router.post('/project/single/building/delete', userRequired, controller.project.singleBuilding.buildingDelete);
  router.post('/project/single/building/view', userRequired, controller.project.singleBuilding.buildingView);
  router.post('/project/single/building/infomation', userRequired, controller.project.singleBuilding.buildingInfomation);
  router.post('/project/single/building/point', userRequired, controller.project.singleBuilding.buildingPoint);
  router.post('/project/single/building/point_data', userRequired, controller.project.singleBuilding.buildingPointData);
  router.post('/project/single/building/point_image', userRequired, controller.project.singleBuilding.buildingPointImage);
  router.post('/project/single/building/point_add', userRequired, controller.project.singleBuilding.buildingPointAdd);
  router.post('/project/single/building/point_del', userRequired, controller.project.singleBuilding.buildingPointDel);
  router.post('/project/single/building/point_device_relevant', userRequired, controller.project.singleBuilding.buildingPointDeviceRelevant);
  router.post('/project/single/building/point_survey_relevant', userRequired, controller.project.singleBuilding.buildingPointSurveyRelevant);
  router.post('/project/single/building/point_device_detail', userRequired, controller.project.singleBuilding.buildingPointDeviceDetail);
  router.post('/project/single/building/point_survey_detail', userRequired, controller.project.singleBuilding.buildingPointSurveyDetail);
  router.post('/project/single/building/point_update', userRequired, controller.project.singleBuilding.buildingPointUpdate);
  router.post('/project/single/building/point_info', userRequired, controller.project.singleBuilding.buildingPointInfo);
  router.post('/project/single/building/survey', userRequired, controller.project.singleBuilding.buildingSurvey);
  router.post('/project/single/building/survey_add', userRequired, controller.project.singleBuilding.buildingSurveyAdd);
  router.post('/project/single/building/survey_bind', userRequired, controller.project.singleBuilding.buildingSurveyBind);
  router.post('/project/single/building/energy', userRequired, controller.project.singleBuilding.buildingEnergy);
  router.post('/project/single/building/energy_update', userRequired, controller.project.singleBuilding.buildingEnergyUpdate);
  router.post('/project/single/building/save_base_info', userRequired, controller.project.singleBuilding.buildingSaveBaseInfo);
  router.post('/project/single/building/save_design_info', userRequired, controller.project.singleBuilding.buildingSaveDesignInfo);
  router.post('/project/single/building/save_energy_info', userRequired, controller.project.singleBuilding.buildingSaveEnergyInfo);
  router.post('/project/single/building/save_indoor_info', userRequired, controller.project.singleBuilding.buildingSaveIndoorInfo);
  router.post('/project/single/building/save_indoor_parameter_info', userRequired, controller.project.singleBuilding.buildingSaveIndoorParameterInfo);
  router.post('/project/single/building/save_water_info', userRequired, controller.project.singleBuilding.buildingSaveWaterInfo);
  router.post('/project/single/topBuilding', userRequired, controller.project.singleBuilding.topBuildingInfo);
  router.post('/project/single/topBuilding/room_info', userRequired, controller.project.singleBuilding.topBuildingRoomInfo);
  router.post('/project/single/survey', userRequired, controller.project.single.surveyInfo);
  router.post('/project/single/survey/search', userRequired, controller.project.singleSurvey.surveySearch);
  router.post('/project/single/survey/bind', userRequired, controller.project.singleSurvey.surveyBind);
  router.post('/project/single/device', userRequired, controller.project.single.deviceInfo);
  router.post('/project/single/device/search', userRequired, controller.project.singleDevice.deviceSearch);
  router.post('/project/single/device/add', userRequired, controller.project.singleDevice.deviceAdd);
  router.post('/project/single/device/recycle', userRequired, controller.project.singleDevice.deviceRecycle);
  router.post('/project/single/device/attention', userRequired, controller.project.singleDevice.deviceAttention);
  router.post('/project/single/device/relieve', userRequired, controller.project.singleDevice.deviceRelieve);
  router.post('/project/single/member', userRequired, controller.project.single.memberInfo);
  router.post('/project/single/member/search', userRequired, controller.project.singleMember.memberSearch);
  router.post('/project/single/member/add', userRequired, controller.project.singleMember.memberAdd);
  router.post('/project/single/member/delete', userRequired, controller.project.singleMember.memberDelete);
  router.post('/project/single/member/set_manager', userRequired, controller.project.singleMember.memberSetManager);
  router.post('/project/single/member/manager_revocation', userRequired, controller.project.singleMember.memberManagerRevocation);
  
  // user
  router.get('/user/index', userRequired, controller.user.index.index);
  router.post('/user/user_info', userRequired, controller.user.index.userInfo);
  router.post('/user/changhe_password', userRequired, controller.user.index.changePassword);
  router.post('/user/change_info', userRequired, controller.user.index.changeInfo);

  // weixin
  router.get('/weixin/index', controller.weixin.user.index);
  router.get('/weixin/device', userRequired, controller.weixin.device.index);
  router.post('/weixin/getTicket', controller.weixin.index.getTicket);
  router.post('/weixin/login', controller.sign.login.loginAuth);
  router.post('/weixin/device/list', userRequired, controller.weixin.device.deviceList);
  router.post('/weixin/device/realtime_data', userRequired, controller.weixin.device.deviceRealtimeData);
  router.post('/weinxin/device/detail', userRequired, controller.weixin.device.deviceDetail);
  router.post('/weixin/device/history', userRequired, controller.weixin.device.deviceHistory);
  router.post('/weixin/device/evaluation', userRequired, controller.weixin.device.deviceEvaluation);

  // admin & login
  router.get('/admin', controller.admin.login.index);
  router.post('/admin/login', controller.admin.login.adminLogin);
  router.post('/admin/logout', adminRequired, controller.admin.login.adminLogout);

  // admin & index
  router.get('/admin/index', adminRequired, controller.admin.index.index);

  // admin & device
  router.get('/admin/device', adminRequired, controller.admin.device.index);
  router.post('/admin/device/list', adminRequired, controller.admin.device.deviceList);
  router.post('/admin/device/download/history', adminRequired, controller.admin.device.deviceDownloadHistory);
  router.post('/admin/device/download/create_work_order', adminRequired, controller.admin.device.createWorkOrder);
  router.post('/admin/device/view/on_line_rate', adminRequired, controller.admin.device.deviceOnLineRate);
  router.post('/admin/device/view/environment', adminRequired, controller.admin.device.deviceEnvironment);
  router.post('/admin/device/view/environment_data_align', userRequired, controller.admin.device.environmentDataAlign);
  router.post('/admin/device/add', adminRequired, controller.admin.device.deviceAdd);
  router.post('/admin/device/user_list', adminRequired, controller.admin.device.deviceUserList);
  router.post('/admin/device/set_owner', adminRequired, controller.admin.device.deviceSetOwner);
  router.post('/admin/device/del_owner', adminRequired, controller.admin.device.deviceDelOwner);
  router.post('/admin/device/status', adminRequired, controller.admin.device.deviceStatus);

  // admin & survey
  router.get('/admin/survey', adminRequired, controller.admin.survey.index);
  router.post('/admin/survey/list', adminRequired, controller.admin.survey.surveyList);
  router.post('/admin/survey/download/answer', adminRequired, controller.admin.survey.surveyDownloadAnswer);
  router.post('/admin/survey/download/question', adminRequired, controller.admin.survey.surveyDownloadQuestion);
  router.post('/admin/survey/getSurveyById', adminRequired, controller.admin.survey.getSurveyById);
  router.post('/admin/survey/getDimension', adminRequired, controller.admin.survey.getDimension);
  router.post('/admin/survey/analysisSurvey', adminRequired, controller.admin.survey.analysisSurvey);
  router.post('/admin/survey/statistics', adminRequired, controller.admin.survey.surveyStatistics);
  router.post('/admin//survey/question_list', adminRequired, controller.admin.survey.questionList);
  router.post('/admin/survey/question/select', adminRequired, controller.admin.survey.questionSelect);
  router.post('/admin/survey/increase/commit', adminRequired, controller.admin.survey.commit);
  router.post('/admin/survey/updateSurvey', adminRequired, controller.admin.survey.updateSurvey);
  router.post('/admin/survey/delete', adminRequired, controller.admin.survey.surveyDelete);

  // admin & project
  router.get('/admin/project', adminRequired, controller.admin.project.index);
  router.post('/admin/project/list', adminRequired, controller.admin.project.projectList);
  router.post('/admin/project/single/info', adminRequired, controller.admin.project.singleInfo);
  router.post('/admin/project/single/device_info', adminRequired, controller.admin.project.singleDeviceInfo);
  router.post('/admin/project/single/survey_info', adminRequired, controller.admin.project.singleSurveyInfo);
  router.post('/admin/project/single/building_info', adminRequired, controller.admin.project.singleBuildingInfo);
  router.post('/admin/project/single/edit', adminRequired, controller.admin.project.singleEdit);
  router.post('/admin/project/single/delete', adminRequired, controller.admin.project.singleDelete);
  router.post('/admin/project/single/building', adminRequired, controller.admin.project.singleBuilding);
  router.post('/admin/project/single/building/add', adminRequired, controller.admin.project.singleBuildingAdd);
  router.post('/admin/project/single/building/import', adminRequired, controller.admin.project.singleBuildingImport);
  router.post('/admin/project/single/building/delete', adminRequired, controller.admin.project.singleBuildingDelete);
  router.post('/admin/project/single/building/view', adminRequired, controller.admin.project.singleBuildingView);
  router.post('/admin/project/single/building/infomation', adminRequired, controller.admin.project.singleBuildingInformation);
  router.post('/admin/project/single/building/point', adminRequired, controller.admin.project.singleBuildingPoint);
  router.post('/admin/project/single/building/point_data', adminRequired, controller.admin.project.singleBuildingPointData);
  router.post('/admin/project/single/building/point_del', adminRequired, controller.admin.project.singleBuildingPointDelete);
  router.post('/admin/project/single/building/point_update', adminRequired, controller.admin.project.singleBuildingPointUpdate);
  router.post('/admin/project/single/building/point_info', adminRequired, controller.admin.project.singleBuildingPointInfo);
  router.post('/admin/project/single/building/point_device_relevant', adminRequired, controller.admin.project.singleBuildingPointDeviceRelevant);
  router.post('/admin/project/single/building/point_survey_relevant', adminRequired, controller.admin.project.singleBuildingPointSurveyRelevant);
  router.post('/admin/project/single/building/point_survey_detail', adminRequired, controller.admin.project.singleBuildingPointSurveyDetail);
  router.post('/admin/project/single/building/point_device_detail', adminRequired, controller.admin.project.singleBuildingPointDeviceDetail);
  router.post('/admin/project/single/building/survey', adminRequired, controller.admin.project.singleBuildingSurvey);
  router.post('/admin/project/single/building/survey_add', adminRequired, controller.admin.project.singleBuildingSurveyAdd);
  router.post('/admin/project/single/building/survey_bind', adminRequired, controller.admin.project.singleBuildingSurveyBind);
  router.post('/admin/project/single/building/energy', adminRequired, controller.admin.project.singleBuildingEnergy);
  router.post('/admin/project/single/building/energy_update', adminRequired, controller.admin.project.singleBuildingEnergyUpdate);
  router.post('/admin/project/single/building/save_base_info', adminRequired, controller.admin.project.singleBuildingSaveBaseInfo);
  router.post('/admin/project/single/building/save_design_info', adminRequired, controller.admin.project.singleBuildingSaveDesignInfo);
  router.post('/admin/project/single/building/save_energy_info', adminRequired, controller.admin.project.singleBuildingSaveEnergyInfo);
  router.post('/admin/project/single/building/save_indoor_info', adminRequired, controller.admin.project.singleBuildingSaveIndoorInfo);
  router.post('/admin/project/single/building/save_indoor_parameter_info', adminRequired, controller.admin.project.singleBuildingSaveParameterInfo);
  router.post('/admin/project/single/building/save_water_info', adminRequired, controller.admin.project.singleBuildingSaveWaterInfo);
  router.post('/admin/project/single/topBuilding', adminRequired, controller.admin.project.singleTopBuilding);
  router.post('/admin/project/single/topBuilding/room_info', adminRequired, controller.admin.project.singleTopBuildingRoomInfo);
  router.post('/admin/project/single/device', adminRequired, controller.admin.project.singleDevice);
  router.post('/admin/project/single/survey', adminRequired, controller.admin.project.singleSurvey);
  router.post('/admin/project/single/survey/search', adminRequired, controller.admin.project.singleSurveySearch);
  router.post('/admin/project/single/member', adminRequired, controller.admin.project.singleMember);
  router.post('/admin/project/single/member/search', adminRequired, controller.admin.project.singleMemberSearch);
  router.post('/admin/project/single/member/add', adminRequired, controller.admin.project.singleMemberAdd);
  router.post('/admin/project/single/member/delete', adminRequired, controller.admin.project.singleMemberDelete);
  router.post('/admin/project/single/member/set_manager', adminRequired, controller.admin.project.singleMemberSetManager);
  router.post('/admin/project/single/member/manager_revocation', adminRequired, controller.admin.project.singleMemberManagerRevocation);
  
  // admin & user
  router.get('/admin/user', adminRequired, controller.admin.user.index);
  router.post('/admin/user/list', adminRequired, controller.admin.user.userList);
  router.post('/admin/user/change_password', adminRequired, controller.admin.user.userChangePassword);

  // admin & statistics
  router.get('/admin/statistics', adminRequired, controller.admin.statistics.index);

  // admin & export
  router.get('/admin/export', adminRequired, controller.admin.export.index);
  router.post('/admin/export/device_list', adminRequired, controller.admin.export.deviceList);
  router.post('/admin/export/work_order', adminRequired, controller.admin.export.workOrderList);
};
