'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware} = app;

  const userRequired = middleware.userRequired();
  const loginRequired = middleware.loginRequired();

  // common
  router.get('/common/alert', userRequired, controller.common.alert);
  router.get('/common/alert_ok', userRequired, controller.common.alertOk);
  router.get('/common/alert_ok2', userRequired, controller.common.alertOk2);
  router.get('/common/loading', userRequired, controller.common.loading);
  router.get('/common/mobilealertOk', userRequired, controller.common.mobilealertOk);
  router.get('/common/mobileloading', userRequired, controller.common.mobileloading);
  router.get('/common/leftpanel', userRequired, controller.common.leftpanel);
  router.get('/common/team_list_item', userRequired, controller.common.teamListItem);
  router.get('/common/questionDX', userRequired, controller.common.questionDx);
  router.get('/common/questionDDX', userRequired, controller.common.questionDDX);
  router.get('/common/questionTK', userRequired, controller.common.questionTK);
  router.get('/common/questionLB', userRequired, controller.common.questionLB);
  router.get('/common/questionZX', userRequired, controller.common.questionZX);
  router.get('/common/questionDL', userRequired, controller.common.questionDL);
  router.get('/common/member/list', userRequired, controller.common.memberList);

  // index
  router.get('/', loginRequired, controller.index.index);
  router.post('/index/building_list', userRequired, controller.index.buildingList);
  router.post('/index/device_list', userRequired, controller.index.deviceList);
  router.post('/index/survey_list', userRequired, controller.index.surveyList);
  
  // login&logout
  router.get('/user', controller.sign.index.index);
  router.post('/user/login', controller.sign.login.loginAuth);
  router.post('/user/logout', loginRequired, controller.sign.logout.index);
  
  // device
  router.get('/device', userRequired, controller.device.index.index);
  router.post('/device/page_list', userRequired, controller.device.index.pageList);
  router.post('/device/location', userRequired, controller.device.index.location);
  router.post('/device/parameter', userRequired, controller.device.index.parameter);
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
  router.post('/project/list', userRequired, controller.project.index.projectList);
  router.post('/project/increase', userRequired, controller.project.increase.projectIncrease);
  router.post('/project/single/update', userRequired, controller.project.single.projectUpdate);
  router.post('/project/single/delete', userRequired, controller.project.single.projectDelete);
  router.post('/project/single/info', userRequired, controller.project.single.projectInfo);
  router.post('/project/single/building', userRequired, controller.project.single.buildingInfo);
  router.post('/project/single/building/increase', userRequired, controller.project.singleBuilding.buildingIncrease);
  router.post('/project/single/building/delete', userRequired, controller.project.singleBuilding.buildingDelete);
  router.post('/project/single/survey', userRequired, controller.project.single.surveyInfo);
  router.post('/project/single/device', userRequired, controller.project.single.deviceInfo);
  router.post('/project/single/device/search', userRequired, controller.project.singleDevice.deviceSearch);
  router.post('/project/single/device/add', userRequired, controller.project.singleDevice.deviceAdd);
  router.post('/project/single/device/recycle', userRequired, controller.project.singleDevice.deviceRecycle);
  router.post('/project/single/device/attention', userRequired, controller.project.singleDevice.deviceAttention);
  router.post('/project/single/device/relieve', userRequired, controller.project.singleDevice.deviceRelieve);
  router.post('/project/single/member', userRequired, controller.project.single.memberInfo);
  
  // user
  router.get('/manage', userRequired, controller.user.index.index);
  router.post('/manage/manage_info', userRequired, controller.user.index.manageInfo);
};
