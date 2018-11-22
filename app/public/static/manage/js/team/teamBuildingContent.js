/*存放缓存中的，项目id*/
var teamID = $.cookie("teamid");
/*存放缓存中的，项目name*/
var teamName = $.cookie("teamname");
/*存放缓存中的，建筑id*/
var buildingID = $.cookie("buildingid");

$(function(){
	// 修改信息
	$("#part-result-ok").click(function(){
		window.location.href += "&op=info";
	});
	
});

//获取项目下建筑信息
function getBuilding(){
	var url="/project/single/building/view";
	var json={"buildingID":buildingID};
	var successFunc = function(data){
		console.log(data)
		var building = data.building;
		
		var area = building.area;
		var consumption = building.aeu;
		var proportion = building.wwr;
		var pointnum = building.bpCount;
		var comment = building.evaluationCount;
		var city = building.city;
		var name = building.name;
		var height = building.height;
		var imgArr = building.imageList;
		
		// 将数据放到页面
		$.cookie("buildingname",name);
		$("#buildingname").html(name);
		$(".tit-teamname").html(teamName.length>8?teamName.substring(0,8)+"..":teamName);
		$(".tit-buildingname").html(name.length>8?name.substring(0,8)+"..":name);
		
		$("#area").html(area);
		$("#consumption").html(consumption);
		$("#proportion").html(proportion);
		$("#pointnum").html(pointnum);
		$("#comment").html(comment);
		$("#citys").html(city);
		$("#name").html(name);
		$("#height").html(height);
		
		var imgstr='';
		for(var i=0;i<imgArr.length;i++){
			imgstr += '<div class="ui left floated image b-pic-img">'+
					  		'<img src="'+ imgArr[i] +'">'+
					'</div>';
		}
		$("#b-pic").html(imgstr);
		
	}
	sentJson(url,json,successFunc);
}

//初始化取值
function getData(){
	getBuilding();
}
getData();

