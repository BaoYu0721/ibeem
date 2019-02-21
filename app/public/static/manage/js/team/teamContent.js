/*存放缓存中的，项目id*/
var id = $.cookie("teamid");
/*存放经纬度  */
var positionArr=[];
//是否为创建者
var isCreator;
//右侧tab切换active事件
$(".div-group-base.tab .ui.tabular.menu .item").click(function(){
	$(this).addClass("active").siblings().removeClass("active");
})
//点击编辑，判断是否为项目创建者事件
$(".teamcontent-edit").parent().click(function(){
	//如果是项目的编辑按钮，检查登陆账号是否为项目创建者
	if(!isCreator){
		alertokMsg(getLangStr("project_survey_edit"),getLangStr("determine"));
		changestatus();
	}
})
//获取项目信息
function getTeamMsg(){
	//根据id获取项目信息
	var url="/project/single/info";
	var json={"projectID":id};
	var successFunc = function(data){
		var teamMsg = data.project;
		var image = teamMsg.image;
		var peopleCount = teamMsg.peopleCount;
		var name = teamMsg.name;
		var id = teamMsg.id;
		var describe = teamMsg.describe;
		isCreator = teamMsg.isCreator;
//		将项目名称放入缓存
		$.cookie("teamname",name);
		//往页面上赋值
		$("#name").attr("value",name);
		$(".teamTitleTit").html(name.length>10?name.substring(0,9)+"...":name);
		$("#describe").html(describe);
		$("#image").attr("src",image);
		$("#peopleCount").html(getLangStr("project_total_people")+""+peopleCount+""+getLangStr("people"));
	}
	sentJson(url,json,successFunc);
}
//获取问卷列表信息
function getSurveyData(){
	var url="/project/single/survey";
	var json={"projectID":id};
	var successFunc = function(data){
		var surveys = data.list;
		for(i in surveys){
			var survey = surveys[i];
			var id = survey.id;
			var name = survey.name;
			var count = survey.count;
			var title = survey.title;
			var introduction = survey.introduction;
			var host = window.location.host;
			//将数据放到页面
			var htmlStr =$("<tr><td>"+title+"</td><td>"+introduction+"</td><td>"+name+"</td><td>"+count+"</td></tr>"); 
			$("#surveyTable tbody").append(htmlStr);
		}
		$("#surveyCount").html(getLangStr("project_survey_statistics")+surveys.length+getLangStr("project_survey_count"));
	}
	sentJson(url,json,successFunc);
}
//编辑完项目信息之后，点提交按钮，提交修改并且修改样式
$("#commitTeamUpdate").on("click",function(){
	var url="/project/single/update";
	var name = $("#name").val();
	var describe = $("#describe").val();
	var image = $("#image").attr("src");
	if(name.length>20){
		alertokMsg(getLangStr("project_survey_nametoolong"),getLangStr("determine"));
		return false;
	}
	var json={"projectID":id,"name":name,"describe":describe,"image":image};
	var successFunc = function(){
		changestatus();
//		将左上角项目名对应修改
		$(".teamTitleTit").html(name.length>10?name.substring(0,9)+"...":name);
	}
	//sentJson(url,json,successFunc);
	$.ajax({
		url: url,
		type: "post",
		data: json,
		success: function(res){
			if(res.code == 200){
				successFunc();
			}else if(res.code == 1003){
				alertokMsg(getLangStr("unknown_error"),getLangStr("alert_ok"));
			}else if(res.code == 1005){
				alertokMsg(getLangStr("project_exist"),getLangStr("alert_ok"));
			}
		}
	})
})
//限制项目简介输入文字数量不得超过60
$("#describe").keydown(function(event){
	var curLength=$("#describe").val().length;	
	if(curLength>=60){
		setTimeout(function(){var num=$("#describe").val().substr(0,60);
		$("#describe").val(num);},100);
		alertokMsg(getLangStr("project_describe_messg"),getLangStr("determine"));
	}
})
//解散项目
$("#dissolve").click(function(){
	alertMsg(getLangStr("project_delete"),getLangStr("cancel"),getLangStr("delete"),"okFunc");
})
function okFunc(){//调用删除项目接口
	var url = "/project/single/delete";
	var json={"projectID":id};
	var successFunc = function(data){
		window.location.href="/project";
	}
	var errorFunc = function(data){
		alertokMsg(data.messg,getLangStr("determine"));
	}
	sentJson(url,json,successFunc,errorFunc);
}
//获取项目下建筑信息
function getBuilding(){
	//清空经纬度数组
	positionArr.length=0;
	var url="/project/single/building";
	var json={"projectID":id};
	var successFunc = function(data){
		var buildingArr = data.list;
		$(".msg-table table").html('');
		$(".msg-table table").append("<tr><td colspan='2' class='total'>"+getLangStr("total")+"："+buildingArr.length+"</td></tr>");
		$(".msg-table table").append("<tr><td>"+getLangStr("project_building_name")+"</td><td>"+getLangStr("project_building_city")+"</td></tr>")
		for(var i=0;i<buildingArr.length;i++){
			var id = buildingArr[i].id;
			var name = buildingArr[i].name;
			var city = buildingArr[i].city;
			var type = buildingArr[i].type;
			var latitude = buildingArr[i].latitude;
			var longitude = buildingArr[i].longitude;
			$(".msg-table table").append("<tr><td>"+name+"</td><td>"+city+"</td></tr>");
			
			if(type=="ibeem"){
				positionArr.push({
					"name":name,
					"lat":latitude,
					"lon":longitude
				});				
			}

		}
		//set Map
		initMap();
	}
	sentJson(url,json,successFunc);
}
//获取项目下设备信息
function getDevice(){
	//清空经纬度数组
	positionArr.length=0;
	var url="/project/single/device";
	var json={"projectID":id};
	var successFunc = function(data){
		var deviceArr = data.list;
		$(".msg-table table").html('');
		$(".msg-table table").append("<tr><td colspan='2' class='total'>"+getLangStr("total")+"："+deviceArr.length+"</td></tr>");
		$(".msg-table table").append("<tr><td>"+getLangStr("project_device_name")+"</td><td>"+getLangStr("project_device_address")+"</td></tr>")
		for(var i=0;i<deviceArr.length;i++){
			var id = deviceArr[i].id;
			var name = deviceArr[i].name;
			var address = deviceArr[i].address;
			var latitude = deviceArr[i].latitude;
			var longitude = deviceArr[i].longitude;
			$(".msg-table table").append("<tr><td>"+name+"</td><td>"+address+"</td></tr>");
			positionArr.push({
				"name":name,
				"lat":latitude,
				"lon":longitude
			});
		}
//		positionArr = [{"name":"设备1","lat":"39.831345","lon":"116.293288"},
//		               {"name":"设备2","lat":"29.831345","lon":"116.293288"},
//		               {"name":"设备3","lat":"19.831345","lon":"116.293288"}]
		//set Map
		initMap();
	}
	sentJson(url,json,successFunc);
}
//初始化地图
function initMap(){
	//setMap(positionArr);
	console.log(positionArr);
	setMap("#container",positionArr);
	
	$(".highcharts-legend-item").css("display","none");
	console.log($(".highcharts-legend-item").length);
	$(".highcharts-credits").remove();
	$(".highcharts-contextbutton").remove();
	$(".highcharts-title").remove();
	$("svg defs").remove();
}
//初始化取值
function getData(){
//  项目列表
	getTeamMsg();
//	默认显示建筑信息
	getBuilding();
//	显示问卷列表
	getSurveyData();
}
getData();
//给右侧地理分布tab添加点击事件
$("#buildingTJ").click(function(){
	getBuilding();
});
$("#deviceTJ").click(function(){
	getDevice();
});

