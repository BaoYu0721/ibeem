/**
 * 问卷页面处理相关函数
 */
function loadSurveyContent(){
	$("#question-container").html($("#load-msg").html());
	$.ajax({
        type: "get",
        dataType: "json",
        url: '/survey/getSurvey',
        data: {surveyID:currentSurveyID,isPhonePage:isPhonePage},
        success: function (data) {

            if (data.status == 0) {
            	var survey = data.survey;

            	$("#survey_title").html(survey.title);
            	$("#survey_createtime").html(survey.createTime);
            	$("#survey_deadline").html(survey.deadline);
            	
            	$("#survey_introduction").html(survey.introduction);
            	
            	if(survey.state == 0){
            		$("#question-container").html($("#nostart-msg").html());
            	}else{
            		$("#question-container").html("");
            		$("#question-container").append(survey.content);
            		$('#submitBtn').css('visibility','visible');
            	}
            	refreshUI();
            }else{  //失败
                $("#question-container").html($("#noexist-msg").html());
            }
        },
        error:function (XMLHttpRequest, textStatus, errorThrown) 
        { 

          
        } });
}


function refreshUI(){
	$('.single-slider').each(function(){
		var min = $(this).attr("min") * 1.0;
		var max = $(this).attr("max") * 1.0;
		var interval = (max - min) / 100;
		$(this).jRange({
			from: min,
			to: max,
			step: interval,
			scale: [min,min + 25 * interval,min + 50 * interval,min + 75 * interval,max],
			format: '%s',
			width: isPhonePage? 300:670,
			showLabels: true,
			showScale: true
		});
	});

}

/**
 * 搜集答案，并把结果以json的格式封装
 */
function collectAnswer(){
	var quesitonAnswers = [];
	var uncmoplete = false;
	
	
	$(".question").each(function(){
		var qid = $(this).attr("qid") * 1;
		var mustanswer = $(this).attr("mustanswer");	
		var type = $(this).attr("type") * 1;
		
		
		
		if(type == 1 || type == 5){ //填空题和滑条题
			var answer = {};
			var val = $("#qid_"+qid).val();
			if(!(val == null && mustanswer == undefined)){
				answer.qid = qid;
				answer.val = val;
				quesitonAnswers.push(answer);
			}else if(mustanswer != undefined && val == null){
				uncmoplete = true;
			}
			
		}else{ //多选题
			var flag = false;//多选题没作答
			$("input[name=qid_"+qid+"]:checked").each(function(){ 
				var answer = {};
				answer.qid = qid;
				answer.val = $(this).val();
				quesitonAnswers.push(answer);
				flag = true;
			}); 
			if(mustanswer != undefined &&  flag == false){
				uncmoplete = true;
			}
		}
		
	});
	if(uncmoplete == true){
		alert($("#mustfinish-msg").html());
		return null;
	}
	
	return quesitonAnswers;
}

/**
 * 提交答案
 */
function submitSurvey(){
	var answers = collectAnswer();
	
	
	if(answers == null){
		return;
	}
	
	var ansobj = {
			"answer":answers
	};
	
	$.ajax({
        type: "get",
        dataType: "json",
        url: '/survey/submitSurvey',
        data: {surveyID:currentSurveyID,answer:JSON.stringify(ansobj)},
        success: function (data) {
            if (data.status == 0) {
            	$("#question-container").html($("#submitted-msg").html());
            	$('#submitBtn').css('visibility','hidden');
            }else{  //失败
                console.log("null data");
            }
            
        }
      });
	return false;
	
}

var currentSurveyID = 0;
var isPhonePage = false;
$(function(){
    var url = window.location.href;
    var params = url.split('/');
    isPhonePage = params[5] == "phone";
    
    if(isPhonePage){
    	if(params[6].indexOf("#")>=0){
    		params[6] = params[6].substr(0,params[6].indexOf("#"));
    	}
    	currentSurveyID = params[6]*1;
    }else{
    	currentSurveyID = params[5] * 1;
    }
    

    loadSurveyContent();
});




