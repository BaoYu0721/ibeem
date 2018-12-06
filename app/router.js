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
  router.get('/common/questionDX', userRequired, controller.common.questionDx);
  router.get('/common/questionDDX', userRequired, controller.common.questionDDX);
  router.get('/common/questionTK', userRequired, controller.common.questionTK);
  router.get('/common/questionLB', userRequired, controller.common.questionLB);
  router.get('/common/questionZX', userRequired, controller.common.questionZX);
  router.get('/common/questionDL', userRequired, controller.common.questionDL);
  router.get('/common/member/list', userRequired, controller.common.memberList);
  router.post('/common/upload', userRequired, controller.common.upload);

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
  router.post('/device/view/standard_rate', userRequired, controller.device.view.getDeviceComplianceRate);
  router.post('/device/status', userRequired, controller.device.status.getStatus);
  
  // survey
  router.get('/survey', userRequired, controller.survey.index.index);
  router.post('/survey/list', userRequired, controller.survey.index.surveyList);
  router.post('/survey/question_list', userRequired, controller.survey.index.questionList);
  router.post('/survey/download/answer', userRequired, controller.survey.download.answer);
  router.post('/survey/download/question', userRequired, controller.survey.download.question);
  router.post('/survey/increase/commit', userRequired, controller.survey.increase.commit);
  router.post('/survey/library/add', userRequired, controller.survey.library.libraryAdd);
  router.post('/survey/statistics', userRequired, controller.survey.statistics.surveyStatistics);
  router.post('/survey/delete', userRequired, controller.survey.delete.surveyDelete);
  router.post('/survey/increase/question/select', userRequired, controller.survey.increase.questionSelect);
  
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

  // admin & login
  router.get('/admin', controller.admin.login.index);
  router.post('/admin/login', controller.admin.login.adminLogin);
  router.post('/admin/logout', adminRequired, controller.admin.login.adminLogout);

  // admin & index
  router.get('/admin/index', adminRequired, controller.admin.index.index);

  // admin & device
  router.get('/admin/device', adminRequired, controller.admin.device.index);
  router.post('/admin/device/list', adminRequired, controller.admin.device.deviceList);

  // admin & survey
  router.get('/admin/survey', adminRequired, controller.admin.survey.index);
  router.post('/admin/survey/list', adminRequired, controller.admin.survey.surveyList);

  // admin & project
  router.get('/admin/project', adminRequired, controller.admin.project.index);
  router.post('/admin/project/list', adminRequired, controller.admin.project.projectList);

  // admin & user
  router.get('/admin/user', adminRequired, controller.admin.user.index);
  router.post('/admin/user/list', adminRequired, controller.admin.user.userList);

  // admin & statistics
  router.get('/admin/statistics', adminRequired, controller.admin.statistics.index);

  // admin & export
  router.get('/admin/export', adminRequired, controller.admin.export.index);
  router.post('/admin/export/device_list', adminRequired, controller.admin.export.deviceList);
  router.post('/admin/export/work_order', adminRequired, controller.admin.export.workOrderList);
};
