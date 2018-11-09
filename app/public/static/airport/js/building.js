
function bindMenu(){
	$("#show-3d").click(function(){
		$("#architect-show").html("").append("<iframe src='http://threejs.org/examples/webgl_loader_vrml.html'></iframe>");
		updateArchitectShow();
	});

	$("#show-img").click(function(){
		$("#architect-show").html("").append("<img src='static/airport/img/sjjct1.jpg'>");
		updateArchitectShow();
	});

}

function updateArchitectShow(){
	var width = $("#architect-show").width();
	var height = width * 0.52;

	$("#architect-show iframe").css("width",width);
	$("#architect-show iframe").css("height",height);

	$("#architect-show img").css("width",width);
	$("#architect-show img").css("height",height);

	$("#sensor-number").css("font-size",$("#sensor-number").width()*0.6);

	$("#env-data-overview").height($("#env-data-overview").width()*0.2);
	$("#sensor-data-overview").height($("#sensor-data-overview").width()*0.21);


}

function updateSensorListSize(){
	$("#sensor-list .panel").height($("#sensor-list .panel").width()*0.8);
}

function bindSensorCilck(){
	$("#sensor-list .panel").click(function(){
		window.location.href = "/page/airport/station/"+$(this).attr("sid");
	});
}


function bindAddStationBtn(){
	$("#addStationBtn").click(function(){
		var slocation = $("#slocation").val();
		var sdevice = $("#sdevice").val();
		var sdescription = $("#sdescription").val();
		var stype = $("input[name=stype]").val()*1;
		
		$.ajax({
	        type: "post",
	        dataType: "json",
	        url: '/airport/addStation',
	        data: {
	        	slocation:slocation,
	        	sdevice:sdevice,
	        	sdescription:sdescription,
	        	stype:stype,
	        	abID:building_id
	        },
	        success: function (data) {
	            if (data.status == 0) {
	            	window.location.href = "/page/airport/building/"+building_id;
	            }
	        },
	        error:function (XMLHttpRequest, textStatus, errorThrown) 
	        { 
	        	alert(textStatus);
	     }});
		
	});
}


function showStationCountChair(wsCount,hqCount,co2Count){
	$('#env-data-overview').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: ["数量"],
            crosshair: false
        },
        yAxis: {
            title: {
                text: '数量'
            }
        },
        legend:{
        	enabled:true,
        	align:"left",
        	layout:"vertical"
        },
        credits:{
        	enabled:false
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
        	series: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            name: '温湿仪布点总个数',
            data: [wsCount]

        }, {
            name: '黑球仪布点总个数',
            data: [hqCount]

        }, {
            name: 'CO2仪布总个数',
            data: [co2Count]

        }]
    });
}

function showStaionDataCountChart(cats,counts){
	$('#sensor-data-overview').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: cats,
            crosshair: false
        },
        yAxis: {
            title: {
                text: '数量'
            }
        },
        legend:{
        	enabled:false,
        	align:"left",
        	layout:"vertical"
        },
        credits:{
        	enabled:false
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
        	series: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            name: '数据量',
            data: counts

        }]
    });
}


function loadBuildingAndStationList(){
	
	$.ajax({
        type: "post",
        dataType: "json",
        url: '/airport/buildingAndStationList',
        data: {
        	bid:building_id
        },
        success: function (data) {
            if (data.status == 0) {
            	showBuildingInfo(data.building);
            	showStationList(data.slist);
            }
        },
        error:function (XMLHttpRequest, textStatus, errorThrown) 
        { 
        	alert(textStatus);
     }});
}

function showBuildingInfo(building){
	$("#buildingName").html(building.name);
	$("#buildingImg").attr("src",building.imgUrl);
	$("#sensor-number").html(building.stationCount);
	
	showStationCountChair(building.wsCount,building.hqCount,building.co2Count);
}

function showStationList(list){
	var countList = new Array();
	var nameList = new Array();
	var i;
	var stationListHtml ="";
	
	for(i =0; i < list.length; i++){
		countList.push(list[i].count);
		nameList.push(list[i].location + list[i].deviceLabel);
		
		stationListHtml += generateStationHtml(list[i].id,list[i].location,list[i].deviceLabel,list[i].type,list[i].count,list[i].description);
	}
	
	showStaionDataCountChart(nameList,countList);
	$("#stationList").append(stationListHtml);
	bindSensorCilck();
}

function generateStationHtml(sid,loc,dlabel,type,dataCount,desc){
	return  '<div class="col-lg-2" >'+
            '<div class="panel panel-info" sid="'+sid+'">'+
            '<div class="panel-heading"><span class="glyphicon glyphicon-object-align-horizontal" aria-hidden="true">'+loc+dlabel+'</span></div>'+
            '<div class="panel-body">'+
            '类型：<span>'+typeText[type]+'</span><br>'+
            '数据量：<span>'+dataCount+'</span><br>'+
            '描述：<span>'+desc.substr(0,20)+'</span><br>'+
            '</div>'+
            '</div>'+
            '</div>';
}

var typeText = ["","温湿","黑球温度","CO2"];

var building_id = 0;

$(function(){
	var url = window.location.href;
	var params = url.split('/');
	building_id = params[7] * 1;
	 
	bindMenu();
	updateArchitectShow();
	updateSensorListSize();
	//stackedBarChart("env-data-overview",1,4);
	//stackedBarChart("sensor-data-overview",4,8);

	$(window).bind("resize", function(){
		updateArchitectShow();
		updateSensorListSize();
		//stackedBarChart("env-data-overview",1,4);
		//stackedBarChart("sensor-data-overview",4,8);
	});
	
	bindAddStationBtn();
	
	loadBuildingAndStationList();
	
});