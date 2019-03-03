var surveyID = $.cookie("surveyId");
//修改font-size
var newfontsize = ($(window).width())*50/375;
$("html").css("font-size",newfontsize);
//获取问卷下维度列表，解析树状json
var url="/survey/getDimension";
var json={"surveyID":surveyID};
var successFunc = function(data){
	var projectList = data.projectList;
	//如果没有维度信息			
	if(projectList.length==0){
		var $project_item =$("<div class='item'>"+
			    "<div class='content'>"+
			    "  <a class='header answer' >"+getLangStr("mobilesurvey_3")+"</a>"+
			    "</div>"+
			    "</div>"); 
				$("#projectList").append($project_item);
	}
	var host = window.location.host;
	for(var i=0;i<projectList.length;i++){
		var projectName = projectList[i].projectName;
		var projectID = projectList[i].projectID;
		var buildingList = projectList[i].buildingList;
		var projectclick = projectList[i].click;
		var $project_item =$("<div class='item'>"+
	    "<i class='folder green icon'></i>"+
	    "<div class='content'>"+
	    "  <a class='header answer' data-id='"+projectID+"' data-type='project' data-click='"+projectclick+"'>"+projectName+"</a>"+
	    "</div>"+
	    "</div>") 
		$("#projectList").append($project_item);
		if(projectclick==1){
			$("#projectList").find(".item:last .answer").addClass("disable");
		}else{
			$("#projectList").find(".item:last>.content").append("<a class='header qr' data-url='"+host+"/survey/mobileSurvey?role=user&surveyId="+surveyID+"&teamId="+projectID+" '  data-click='"+projectclick+"'>"+getLangStr("mobilesurvey_4")+"</a>");
		}
		if(buildingList.length>0){
			var $building_list = $("<div class='ui list' id='buildingList'></div>");
			$project_item.find(".content").append($building_list);
			for(var j=0;j<buildingList.length;j++){
				var buildingName = buildingList[j].buildingName;
				var buildingID = buildingList[j].buildingID;
				var buildingPointList = buildingList[j].buildingPointList;
				var buildingclick = buildingList[j].click;
				var $building_item =$("<div class='item'>"+
					    "<i class='folder green icon'></i>"+
					    "<div class='content'>"+
					    "  <a class='header answer' data-id='"+buildingID+"' data-type='building' data-click='"+buildingclick+"'>"+buildingName+"</a>"+
					    
					    "</div>"+
					    "</div>") 
				$building_list.append($building_item);
				if(buildingclick==1){
					$building_list.find(".item:last .answer").addClass("disable");
				}else{
					$building_list.find(".item:last>.content").append("  <a class='header qr' data-url='"+host+"/survey/mobileSurvey?role=user&surveyId="+surveyID+"&teamId="+projectID+"&buildingId="+buildingID+" ' data-click='"+buildingclick+"' >"+getLangStr("mobilesurvey_4")+"</a>");
				}
				if(buildingPointList.length>0){
					var $buildingPoint_list = $("<div class='ui list' id='buildingPointList'></div>");
					$building_item.find(".content").append($buildingPoint_list);
					for(var n=0;n<buildingPointList.length;n++){
						var buildingPointName = buildingPointList[n].buildingPointName;
						var buildingPointID = buildingPointList[n].buildingPointID;
						var buildingPointclick = buildingPointList[n].click;
						var $buildingPoint_item =$("<div class='item'>"+
							    "<i class='folder green icon'></i>"+
							    "<div class='content'>"+
							    "  <a class='header answer' data-id='"+buildingPointID+"' data-type='buildingpoint'  data-click='"+buildingPointclick+"'>"+buildingPointName+"</a>"+
							    "</div>"+
							    "</div>") 
								$buildingPoint_list.append($buildingPoint_item);
								if(buildingPointclick==1){
									$buildingPoint_list.find(".item:last .answer").addClass("disable");
								}else{
									$buildingPoint_list.find(".item:last>.content").append("  <a class='header qr' data-url='"+host+"/survey/mobileSurvey?role=user&surveyId="+surveyID+"&teamId="+projectID+"&buildingId="+buildingID+"&pointId="+buildingPointID+" '  data-click='"+buildingPointclick+"' >"+getLangStr("mobilesurvey_4")+"</a>");
								}
					}
				}
			}
		}
	}
	$("#projectList>.item .header.qr").click(function(){
		var click = $(this).data("click");
		if(click!="0"){
			return false;
		}
		$("#qrcode").empty();
		var url = $(this).data("url");
		jQuery('#qrcode').qrcode({text:"http://"+url,width:$('#qrcode').width(),height:$('#qrcode').height()});
		$('.basic.test.modal.showqr')
		  .modal('setting', 'closable', false)
		  .modal('show');
	})
}
sentJson(url,json,successFunc);
//顶部查询
$("#search").keyup(function(event){  
	var searchContent = $('#search').val();
	//删掉输入内容开头的空格
	while(searchContent.substring(0,1)==" "){
		searchContent = searchContent.substring(1);
	} 
	$(".header.answer").each(function(){
		var name = $(this).html();
		//如果列表中某一项包含查询的内容,则高亮显示		
		if(name.indexOf(searchContent) >= 0 && searchContent!=""){
			$(this).addClass("search");
		}else{
			$(this).removeClass("search");
		} 
	});
});
//点击答题
$("#projectList").on("click",".answer",function(){
	var click = $(this).data("click");
	if(click!="0"){
		return false;
	}
	var type = $(this).data("type");
	var id = $(this).data("id");
	if(type=="project"){
		$.cookie("surveyProjectId",id);
		$.cookie("surveyBuildingId","");
		$.cookie("surveyPointId","");
	}
	else if(type=="building"){
		$.cookie("surveyProjectId","");
		$.cookie("surveyBuildingId",id);
		$.cookie("surveyPointId","");
	}
	else if(type=="buildingpoint"){
		$.cookie("surveyProjectId","");
		$.cookie("surveyBuildingId","");
		$.cookie("surveyPointId",id);
	}
	window.location.href="/weixin/survey/answer";
})
$(function(){
    jQuery.i18n.properties({
		name: 'i18n',
		path: '/public/i18n/',
		mode: 'map',
		language: window.localStorage.getItem("language"),
		callback: function() {
		  $("title").html($.i18n.prop("wx_survey"));
		}
	  })
})