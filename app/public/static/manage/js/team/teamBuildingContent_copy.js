/*存放缓存中的，项目id*/
var teamID = $.cookie("teamid");
/*存放缓存中的，项目name*/
var teamName = $.cookie("teamname");
/*存放缓存中的，建筑id*/
var buildingID = $.cookie("buildingid");

//获取项目下建筑信息
function getBuilding(){
	var url="/project/single/building/view";
	var json={"buildingID":buildingID};
	var successFunc = function(data){
		var building = data.building;
		
		var area = building.area;
		var consumption = building.aeu;
		var proportion = building.wwr;
		var pointnum = building.bpCount;
		var comment = building.evaluationCount;
		var city = building.city;
		var name = building.name;
		var floor = building.floor;
		var height = building.height;
		var imgArr = building.imageList;
//		将数据放到页面
		$.cookie("buildingname",name);
		$("#buildingname").html(name);
		$(".tit-teamname").html(teamName.length>8?teamName.substring(0,8)+"..":teamName);
		$(".tit-buildingname").html(name.length>8?name.substring(0,8)+"..":name);
		$("#area").val(area);
		$("#consumption").val(consumption);
		$("#proportion").val(proportion);
		$("#pointnum").val(pointnum);
		$("#comment").val(comment);
		$("#city").val(city);
		setDefaultValue(city);
		$("#name").val(name);
		$("#floor").val(floor);
		$("#height").val(height);
		var count = 0;
		$(".portraitStyle").each(function(){
			if(count<imgArr.length){
				var image = $(this).attr("src",imgArr[count]);
			}
			count++;
		});
	}
	sentJson(url,json,successFunc);
}
//图片修改成百分比，33%
function setElePercent(){
	var $target = $(".addlogo");
	var $parent = $target.parent();
	var parentWidth = $parent.outerWidth();
	var targetWidth = parentWidth*0.293;
	var targetHiehgt = targetWidth*0.592;
	var targetMargin = targetWidth*0.025;
	$target.width(targetWidth);
	$target.height(targetHiehgt);
	$target.css("margin",targetMargin);
}
setElePercent();
$(window).resize(function(){
	setElePercent();
});
	
//修改建筑基础信息
$("#commitTeamUpdate").click(function(){
	//校验
	var buildingName = $("#name").val();
	if($.trim(buildingName)==""){
		$(".error h4").html("建筑名称不能为空！");
		return false;
	}
	var city = $("#selectCity option:selected").val();
	var log = $("#selectCity option:selected").data("log");
	var lat = $("#selectCity option:selected").data("lat");
	var cityname = $("#selectCity option:selected").html();
	if(city==-1 || $.trim(cityname)==""){
		$(".error h4").html("城市不能为空！");
		return false;
	}
	$("#city").val(cityname);
	var area = $("#area").val();
	var consumption = $("#consumption").val();
	var proportion = $("#proportion").val();
	var pointnum = $("#pointnum").val();
	var comment = $("#comment").val();
	var floor = $("#floor").val();
	var height = $("#height").val();
	var imageStr ="";
	$(".portraitStyle").each(function(){
		var image = $(this).attr("src");
		if($.trim(image)!=""){
			if(imageStr==""){
				imageStr = image;
			}else{
				imageStr+=","+image;
			}
		}
	});
	//发送
	var url = "/building/updateBuilding";
	var json = {"buildingID":buildingID,"image":imageStr,"name":buildingName,"city":cityname,"longitude":log,"latitude":lat,"area":area,"height":height,"floor":floor,"wwr":proportion};
	function successFunc(data){
		changestatus();
		$("#buildingname").html(buildingName);
	}
	function errorFunc(data){
		var errormsg = data.messg;
		$(".error h4").html(errormsg);
	}
	sentJson(url,json,successFunc,errorFunc);
});

//初始化取值
function getData(){
	getBuilding();
}
getData();

