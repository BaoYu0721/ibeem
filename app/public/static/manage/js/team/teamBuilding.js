/*存放缓存中的，项目id*/
var id = $.cookie("teamid");
/*存放缓存中的，项目name*/
var teamname = $.cookie("teamname");
$(".teamTitleTit").html(teamname.length>10?teamname.substring(0,9)+"...":teamname);
/*存放经纬度  */
var positionArr=[];
//右侧tab切换active事件
$(".div-group-base.tab .ui.tabular.menu .item").click(function(){
	$(this).addClass("active").siblings().removeClass("active");
})
//获取项目下建筑信息
function getBuilding(){
	//清空经纬度数组
	positionArr.length=0;
	var url="/project/single/building";
	var json={"projectID":id};
	var successFunc = function(data){
		console.log(data)
		var buildingArr = data.list;
		$("#dataTable").html('');
		for(var i=0;i<buildingArr.length;i++){
			var id = buildingArr[i].id;
			var name = buildingArr[i].name;
			var city = buildingArr[i].city? buildingArr[i].city: '';
			var type = buildingArr[i].type;
			var latitude = buildingArr[i].latitude;
			var longitude = buildingArr[i].longitude;
			$("#dataTable").append("<tr onclick='show(this,event)' data-id='"+id+"' data-type='"+type+"' data-name='"+name+"'>" +
					"<td id='addIcon'><div class='ui checkbox'><input type='checkbox' name='delete' tabindex='"+id+"' data-typed='"+type+"' data-index='"+i+"' class='hidden'><label> </label></div></td>" +
					"<td>"+name+"</td><td>"+city+"</td></tr>");
			
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
		//激活复选框
		$('.ui.checkbox').checkbox();
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
	getBuilding();
}
getData();
//建筑列表行添加单击事件，点击添加选中样式
function show(tr,event){
	//点击复选框时，不跳转
	if(event.target.nodeName!="LABEL"){
		var buildingID = $(tr).data("id");
		var buildingType = $(tr).data("type");
		var buildingName = $(tr).data("name");
		$.cookie('buildingid', buildingID); 
		$.cookie('buildingType', buildingType); 
		$.cookie('buildingname', buildingName); 
	
		if(buildingType=="ibeem"){ // ibeem
			window.location.href += "&building_name=" + buildingName;
		}else if(buildingType == "top"){ // top
			window.location.href += "&top_building_name=" + buildingName;
		}
		
		//window.location.href="/redirect?url=manage/teamBuildingContent.jsp";
	}
}
//删除项目下建筑
$("#deleteBuilding").on("click",function(){
	if($('input[name="delete"]:checked').length>0){
		alertMsg(getLangStr("building_delete"),getLangStr("cancel"),getLangStr("delete"),"okFunc");
	}else{
		alertokMsg(getLangStr("building_delete_messg"),getLangStr("determine"));
	}
})
function okFunc(){
	$('input[name="delete"]:checked').each(function(){
		//获取到tr
		var $tr = $(this).parent().parent().parent();
		var index = $(this).data("index");
		var typed = $(this).data("typed");
		var id = $(this).attr("tabindex");
		
		if(typed=="ibeem"){
			var url = "/project/single/building/delete";
			var json={"buildingID":id, type: typed};
			var successFunc = function(data){
				$tr.remove();
				positionArr.splice(index,1);
				initMap();
			}
		}else if(typed=="top"){
			var url = "/project/single/building/delete";
			var json={"topBuildingID":id, type: typed};
			var successFunc = function(data){
				$tr.remove();
				positionArr.splice(index,1);
				initMap();
			}				
		}
		
/*		var url = "/building/deleteBuilding";
		var json={"buildingID":id};
		var successFunc = function(data){
			$tr.remove();
			positionArr.splice(index,1);
			initMap();
		}*/
		
		sentJson(url,json,successFunc);
	});
}

//点击左侧添加建筑
$("#addBuilding").on("click",function(){
	$('.basic.test.modal.addbuilding-modal')
	  .modal('setting', 'closable', false)
	  .modal('show');
})
//添加建筑
$("#submit").click(function(){
	//校验
	var buildingName = $("#addname").val();

	if($.trim(buildingName)==""){
		$(".error h4").html(getLangStr("add_building_messg1"));
		return false;
	}else if($.trim(buildingName).length>30){
		$(".error h4").html(getLangStr("add_building_messg4"));
		return false;
	}
	
	
	if($("#selectType").val()==1){ // ibeem 格式

		var city = $("#selectCity option:selected").val();
		var log = $("#selectCity option:selected").data("log");
		var lat = $("#selectCity option:selected").data("lat");
		var cityname = $("#selectCity option:selected").html();
		var qhq = $("#selectQhq option:selected").val();
		
		var selclass = $("#selectClass option:selected").val();
		
		if(city==-1 || $.trim(cityname)==""){
			$(".error h4").html(getLangStr("add_building_messg2"));
			return false;
		}
		if(qhq==-1 || $.trim(qhq)==""){
			$(".error h4").html(getLangStr("add_building_messg3"));
			return false;
		}
		//发送
		var url = "/project/single/building/increase?type=" + $("#selectType").val();
		var json = {"projectID":id,"name":buildingName,"buildingType": $("#selectType").val(), "buildingClass":selclass,"city":cityname,"longitude":log,"latitude":lat,"climaticProvince":qhq};

		function successFunc(data){
			$('.basic.test.modal.addbuilding-modal').modal('hide');
			location.reload();
		}
		function errorFunc(data){
			var errormsg = data.messg;
			$(".error h4").html(errormsg);
		}
		sentJson(url,json,successFunc,errorFunc);
		
	}else if($("#selectType").val()==2){ // top 格式
		var url = "/project/single/building/increase?type=" + $("#selectType").val();
		var json = {"projectID":id,"name":buildingName,"buildingType":$("#selectType").val()};

		function successFunc(data){
			$('.basic.test.modal.addbuilding-modal').modal('hide');
			location.reload();
		}
		function errorFunc(data){
			var errormsg = data.messg;
			$(".error h4").html(errormsg);
		}
		sentJson(url,json,successFunc,errorFunc);
	}

});

$(function(){
	$('#selectBuildingClass').dropdown();
});

// 上传模板 弹出隐藏层
$("#uploadBuilding").click(function(){
	$("#buildUploadPopover").modal('show');	
});

// 上传模板
$("#UpLoadFileButton").click(function(){
	var isOffice;
	var ajaxUrl = "";
	var type;
	
	var project_info =JSON.parse($.cookie("teamid"));
	// console.log(project_info.projectID); 
	//var tid = project_info.projectID; // 项目ID	
	var tid = project_info; // 项目ID	
	var tname = $("#topBuildingName").find("input").val();

	if($("#buildingClass").val()==""){
		alertokMsg(getLangStr("import_building_messg1"),getLangStr("determine"));
		return;
	}else if($("#buildingClass").val()==1){
		ajaxUrl = "/building/importOfficeBuilding?projectID=" + tid;
		type = "gg_";
	}else if($("#buildingClass").val()==2){
		ajaxUrl = "/building/importBuilding?projectID=" + tid;
		type = "jz_";
	}else if($("#buildingClass").val()==3){
		
		if($.trim(tname)==""){
			alertokMsg(getLangStr("add_building_messg1"),getLangStr("determine"));
			return;
		}
		
		ajaxUrl = "/building/importTopBuilding?projectID=" + tid +"&buildingName=" + tname;
	}else{
		console.log("类型出错！请先修改JS中的代码~ 调试专用提示！","确定");
		return;
	}

	UpLoadFile(ajaxUrl,type);
});

$("#selectBuildingClass").change(function(){
	console.log($("#buildingClass").val());
	if($("#buildingClass").val()==3){
		$("#topBuildingName").show();
	}else{
		$("#topBuildingName").hide();
	}
})

function UpLoadFile(ajaxUrl,type) {
	
	var formData = new FormData($("#fileUpLoad")[0]);
	var this_val = $("#building_file").val();
	var $thisStr = this_val.split("\\");
	$thisStr = $thisStr[$thisStr.length-1].substring(0,3);
	
	if(this_val.length==""){
		alertokMsg(getLangStr("import_building_messg6"),getLangStr("alert_ok"));
		return;		
	}
//	else if($thisStr != type){
//		alertokMsg(getLangStr("import_building_messg5"),getLangStr("alert_ok"));
//		return;
//	}
	
	$.ajax({
		url: ajaxUrl,
		type: "POST",
		data: formData,
		async: false,
		cache: false,
		contentType: false,
		processData: false,
		success: function(data) {
			console.log(data);
	
			if(data.code == 200) {
				alertokMsg(getLangStr("import_building_messg2"),getLangStr("determine"),"window.location.href='/redirect?url=manage/teamBuilding.jsp\'");
			} else if(data.code == 1005)  {	
				alertokMsg(getLangStr("import_building_messg3"),getLangStr("determine"));
			} else if(data.code == 1001){
				alertokMsg(getLangStr("import_building_messg4"),getLangStr("determine"));
			}else if(data.code == 1007){
				alertokMsg(getLangStr("import_building_messg5"),getLangStr("determine"));
			}
		},
		error: function(e) { // 
			
		}
	});
	
}

