/*存放缓存中的，项目id*/
var teamID = $.cookie("teamid");
/*存放缓存中的，项目name*/
var teamName = $.cookie("teamname");
/*存放缓存中的，建筑id*/
var buildingID = $.cookie("buildingid");
/*存放缓存中的，建筑name*/
var buildingName = $.cookie("buildingname");
$(".tit-buildingname").html(buildingName.length>8?buildingName.substring(0,8)+"..":buildingName);
$(".tit-teamname").html(teamName.length>8?teamName.substring(0,8)+"..":teamName);
//获取项目下建筑详细信息
function getBuildingData(){
	var url="/building/getBuildingInfo";
	var json={"buildingID":buildingID};
	var successFunc = function(data){
		var building = data.building;
		
		var buildingID = building.id;
		var modelUrl = building.modelUrl;
		var climaticProvince = building.climaticProvince;
		var type = building.type;
		var level = building.level;
		var name = building.name ;
		var city =building.city ;
		setDefaultValue(city);
		var wall_tc =building.wallTc ;
		var roof_desc =building.roofDesc ;
		var pri_hvac_area =building.priHvacArea ;
		var pri_hvac_desc =building.priHvacDesc ;
		var coolingdd =building.coolingdd ;
		var shapecoffecient =building.shapecoffecient ;
		var window_tr =building.windowTr ;
		var wwr =building.wwr ;
		var primaryusage =building.primaryusage ;
		var pri_hvac =building.priHvac ;
		var floor =building.floor ;
		var window_desc =building.windowDesc ;
		var grossfloorarea =building.grossfloorarea ;
		var height =building.height ;
		var secondaryusage =building.secondaryusage ;
		var designedoccu =building.designedoccu ;
		var rood_tr =building.roodTr ;
		var pri_hvac_zone =building.priHvacZone ;
		var sec_hvac_desc =building.secHvacDesc ;
		var sec_hvac_zone =building.secHvacZone ;
		var wall_tr =building.wallTr ;
		var sec_hvac_area =building.secHvacArea ;
		var rood_tc =building.roodTc ;
		var sec_hvac =building.secHvac ;
		var pua =building.pua ;
		var wall_desc =building.wallDesc ;
		var sua =building.sua ;
		var heatingdd =building.heatingdd ;
		var shading_cofficient =building.shadingCofficient ;
		var imageStr =building.imageList ;
//		将数据放到页面
		$("#buildingname").html(name);
		$("#name ").val(name);
		$("#city ").val(city);
		$("#climaticRegionInput").val(climaticProvince);
		$("#typeInput").val(type);
		$("#levelInput").val(level);
		$("#wall_tc ").val(wall_tc);
		$("#roof_desc ").val(roof_desc);
		$("#pri_hvac_area ").val(pri_hvac_area);
		$("#pri_hvac_desc ").val(pri_hvac_desc);
		$("#coolingdd ").val(coolingdd);
		$("#shapecoffecient ").val(shapecoffecient);
		$("#window_tr ").val(window_tr);
		$("#wwr ").val(wwr);
		$("#primaryusage ").val(primaryusage);
		$("#pri_hvac ").val(pri_hvac);
		$("#floor ").val(floor);
		$("#window_desc ").val(window_desc);
		$("#grossfloorarea ").val(grossfloorarea);
		$("#height ").val(height);
		$("#secondaryusage ").val(secondaryusage);
		$("#designedoccu ").val(designedoccu);
		$("#rood_tr ").val(rood_tr);
		$("#pri_hvac_zone ").val(pri_hvac_zone);
		$("#sec_hvac_desc ").val(sec_hvac_desc);
		$("#sec_hvac_zone ").val(sec_hvac_zone);
		$("#wall_tr ").val(wall_tr);
		$("#sec_hvac_area ").val(sec_hvac_area);
		$("#rood_tc ").val(rood_tc);
		$("#sec_hvac ").val(sec_hvac);
		$("#pua ").val(pua);
		$("#wall_desc ").val(wall_desc);
		$("#sua ").val(sua);
		$("#heatingdd ").val(heatingdd);
		$("#shading_cofficient ").val(shading_cofficient);
		$("#imageStr ").val(imageStr);
		
		var count = 0;
		$(".portraitStyle").each(function(){
			if(count<imageStr.length){
				var image = $(this).attr("src",imageStr[count]);
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
	var targetWidth = parentWidth*0.295;
	var targetHiehgt = targetWidth*0.592;
	var targetMargin = targetWidth*0.025;
	$target.width(targetWidth);
	$target.height(targetHiehgt);
	$target.css("margin",targetMargin);
}
//修改图片信息
$("#commitImageUpdate").click(function(){
	$this = $(this);
	//校验
	var name = $("#name").val();
	if($.trim(name)==""){
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
	var heatingdd = $("#heatingdd").val();
	var coolingdd = $("#coolingdd").val();
	var climaticProvince = $("#climaticRegion>.text").html();
	var type = $("#type>.text").html();
	var level = $("#level>.text").html();
	var grossfloorarea = $("#grossfloorarea").val();
	var height = $("#height").val();
	var floor = $("#floor").val();
	var shapecoffecient = $("#shapecoffecient").val();
	var wwr = $("#wwr").val();
	var primaryusage = $("#primaryusage").val();
	var pua = $("#pua").val();
	var secondaryusage = $("#secondaryusage").val();
	var sua = $("#sua").val();
	var designedoccu = $("#designedoccu").val();
	var wall_desc = $("#wall_desc").val();
	var wall_tr = $("#wall_tr").val();
	var wall_tc = $("#wall_tc").val();
	var window_desc = $("#window_desc").val();
	var window_tr = $("#window_tr").val();
	var shading_cofficient = $("#shading_cofficient").val();
	var roof_desc = $("#roof_desc").val();
	var rood_tr = $("#rood_tr").val();
	var rood_tc = $("#rood_tc").val();
	var pri_hvac = $("#pri_hvac").val();
	var pri_hvac_desc = $("#pri_hvac_desc").val();
	var pri_hvac_zone = $("#pri_hvac_zone").val();
	var pri_hvac_area = $("#pri_hvac_area").val();
	var sec_hvac = $("#sec_hvac").val();
	var sec_hvac_desc = $("#sec_hvac_desc").val();
	var sec_hvac_zone = $("#sec_hvac_zone").val();
	var sec_hvac_area = $("#sec_hvac_area").val();
	
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
	var url = "/building/updateBuildingInfo";
	var json = {
			"id":buildingID,
			"name":name,
			"modelUrl":"",
			"city":cityname,
			"longitude":log,
			"latitude":lat,
			"wallTc":wall_tc,
			"roofDesc":roof_desc,
			"priHvacArea":pri_hvac_area,
			"priHvacDesc":pri_hvac_desc,
			"coolingdd":coolingdd,
			"shapecoffecient":shapecoffecient,
			"windowTr":window_tr,
			"wwr":wwr,
			"primaryusage":primaryusage,
			"priHvac":pri_hvac,
			"floor":floor,
			"windowDesc":window_desc,
			"grossfloorarea":grossfloorarea,
			"height":height,
			"secondaryusage":secondaryusage,
			"designedoccu":designedoccu,
			"roodTr":rood_tr,
			"priHvacZone":pri_hvac_zone,
			"secHvacDesc":sec_hvac_desc,
			"secHvacZone":sec_hvac_zone,
			"wallTr":wall_tr,
			"secHvacArea":sec_hvac_area,
			"roodTc":rood_tc,
			"secHvac":sec_hvac,
			"image":imageStr,
			"pua":pua,
			"wallDesc":wall_desc,
			"sua":sua,
			"heatingdd":heatingdd,
			"shadingCofficient":shading_cofficient,
			"climaticProvince":climaticProvince,
			"type":type,
			"level":level
	};
	function successFunc(data){
		changestatus(".addlogo");
		$(".error h4").html("");
	}
	function errorFunc(data){
		var errormsg = data.messg;
		$(".error h4").html(errormsg);
	}
	sentJson(url,json,successFunc,errorFunc);
});

//修改建筑基础信息
$("#commitBuildingUpdate").click(function(){
	$this = $(this);
	//校验
	var name = $("#name").val();
	if($.trim(name)==""){
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
	var heatingdd = $("#heatingdd").val();
	var coolingdd = $("#coolingdd").val();
	var climaticProvince = $("#climaticRegion>.text").html();
	var type = $("#type>.text").html();
	var level = $("#level>.text").html();
	var grossfloorarea = $("#grossfloorarea").val();
	var height = $("#height").val();
	var floor = $("#floor").val();
	var shapecoffecient = $("#shapecoffecient").val();
	var wwr = $("#wwr").val();
	var primaryusage = $("#primaryusage").val();
	var pua = $("#pua").val();
	var secondaryusage = $("#secondaryusage").val();
	var sua = $("#sua").val();
	var designedoccu = $("#designedoccu").val();
	var wall_desc = $("#wall_desc").val();
	var wall_tr = $("#wall_tr").val();
	var wall_tc = $("#wall_tc").val();
	var window_desc = $("#window_desc").val();
	var window_tr = $("#window_tr").val();
	var shading_cofficient = $("#shading_cofficient").val();
	var roof_desc = $("#roof_desc").val();
	var rood_tr = $("#rood_tr").val();
	var rood_tc = $("#rood_tc").val();
	var pri_hvac = $("#pri_hvac").val();
	var pri_hvac_desc = $("#pri_hvac_desc").val();
	var pri_hvac_zone = $("#pri_hvac_zone").val();
	var pri_hvac_area = $("#pri_hvac_area").val();
	var sec_hvac = $("#sec_hvac").val();
	var sec_hvac_desc = $("#sec_hvac_desc").val();
	var sec_hvac_zone = $("#sec_hvac_zone").val();
	var sec_hvac_area = $("#sec_hvac_area").val();
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
	var url = "/building/updateBuildingInfo";
	var json = {
			"id":buildingID,
			"name":name,
			"modelUrl":"",
			"city":cityname,
			"longitude":log,
			"latitude":lat,
			"wallTc":wall_tc,
			"roofDesc":roof_desc,
			"priHvacArea":pri_hvac_area,
			"priHvacDesc":pri_hvac_desc,
			"coolingdd":coolingdd,
			"shapecoffecient":shapecoffecient,
			"windowTr":window_tr,
			"wwr":wwr,
			"primaryusage":primaryusage,
			"priHvac":pri_hvac,
			"floor":floor,
			"windowDesc":window_desc,
			"grossfloorarea":grossfloorarea,
			"height":height,
			"secondaryusage":secondaryusage,
			"designedoccu":designedoccu,
			"roodTr":rood_tr,
			"priHvacZone":pri_hvac_zone,
			"secHvacDesc":sec_hvac_desc,
			"secHvacZone":sec_hvac_zone,
			"wallTr":wall_tr,
			"secHvacArea":sec_hvac_area,
			"roodTc":rood_tc,
			"secHvac":sec_hvac,
			"image":imageStr,
			"pua":pua,
			"wallDesc":wall_desc,
			"sua":sua,
			"heatingdd":heatingdd,
			"shadingCofficient":shading_cofficient,
			"climaticProvince":climaticProvince,
			"type":type,
			"level":level
	};
	function successFunc(data){
		changestatus(".buildingContent");
		$("#buildingname").html(name);
		$(".error h4").html("");
	}
	function errorFunc(data){
		var errormsg = data.messg;
		$(".error h4").html(errormsg);
	}
	sentJson(url,json,successFunc,errorFunc);
});

//初始化取值
function initData(){
	getBuildingData();
	setElePercent();
	$(window).resize(function(){
		setElePercent();
	});
	//初始化下拉列表
	$("#climaticRegion").dropdown();
	$("#type").dropdown();
	$("#level").dropdown();
	
}
initData();


//function foo(x) {
//    var tmp = 3;
//    return function (y) {
//        alert(x + y + (++tmp));
//    }
//}
//var bar = foo(2); // bar 现在是一个闭包
//bar(10);
//bar(10);
//var bar1 = foo(2); // bar 现在是一个闭包
//bar1(10);
//bar1(10);
//
//var temp1 = new foo();
//alert(foo. prototype.tmp); 
//var temp2 = new foo();
//alert(foo. prototype.tmp);
