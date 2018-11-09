/**
 * Created by xiaohe on 16/5/17.
 */
Date.prototype.Format = function(fmt) 
{ //author: meizz 
  var o = { 
    "M+" : this.getMonth()+1,                 //月份 
    "d+" : this.getDate(),                    //日 
    "h+" : this.getHours(),                   //小时 
    "m+" : this.getMinutes(),                 //分 
    "s+" : this.getSeconds(),                 //秒 
    "q+" : Math.floor((this.getMonth()+3)/3), //季度 
    "S"  : this.getMilliseconds()             //毫秒 
  }; 
  if(/(y+)/.test(fmt)) 
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  for(var k in o) 
    if(new RegExp("("+ k +")").test(fmt)) 
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
  return fmt; 
}

function loadSurveyDate(){
    $.ajax({
        type: "get",
        dataType: "json",
        url: '/survey',
        success: function (data) {
            $("#grouplist").html('');
            if (data.status == 0) {
                console.log(data);
                for (id in data.list) {
                    var survey = data.list[id];
                    survey.create_time = new Date(parseInt(survey.create_time)).Format("yyyy-MM-dd");
                    survey.deadline = new Date(parseInt(survey.deadline)).Format("yyyy-MM-dd");
                    var status = survey.state == 1? "Run":"Stop";
                    
                    $("#grouplist").append("<tr id='survey_" + survey.survey_id + "'><td>" + survey.title + "</td><td class='status'>" + status + "</td><td>" +
                            survey.create_time + "</td><td>" +
                            survey.deadline + "</td><td><button class='btn btn-primary' style='margin-right:10px' onclick='startSurvey("+survey.survey_id+")'>启动</button><button class='btn btn-danger' style='margin-right:10px' onclick='stopSurvey("+survey.survey_id+")'>停止</button><a class='btn btn-default' style='margin-right:10px' href='/page/surveyStastics/" + survey.survey_id + "'>统计</a><a class='btn btn-link' target='blank' href='/page/survey/" + survey.survey_id + "'>进入>></a></td></tr>");

                }
            }
        }
    });
}

function startSurvey(surveyID){
	$.ajax({
        type: "post",
        dataType: "json",
        url: '/survey/status',
        data:{
        	surveyID:surveyID,
        	status:1
        },
        success: function (data) {
            if (data.status == 0) {
            	 $("#survey_"+surveyID +" .status").html("Run");
        }}
    });
}

function stopSurvey(surveyID){
	$.ajax({
        type: "post",
        dataType: "json",
        url: '/survey/status',
        data:{
        	surveyID:surveyID,
        	status:0
        },
        success: function (data) {
            if (data.status == 0) {
                $("#survey_"+surveyID +" .status").html("Stop");
        }}
    });
}


$(function(){

    loadSurveyDate();

});




