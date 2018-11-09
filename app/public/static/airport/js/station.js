/**
 * 
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



function loadStationInfoAndData(){
	$.ajax({
        type: "post",
        dataType: "json",
        url: '/airport/stationAndData',
        data: {
        	sid:station_id
        },
        success: function (data) {
            if (data.status == 0) {
            	showInfo(data.building,data.station);
            	extractData(data.list);
            	
            	showData("tem");
            	
            	sData = data.list;
            	$('#devicedata-table').bootstrapTable('load', sData);
            	
            }
        },
        error:function (XMLHttpRequest, textStatus, errorThrown) 
        { 
        	alert(textStatus);
     }});
}



function showInfo(building, station){
	$("#buildingName").html(building.name);
	$("#buildingName").attr("href","/page/airport/building/"+building.id);
	stationName = station.location+station.deviceLabel;
	$("#stationName").html(stationName);
	
	
	$("#stype").html(typeDic[station.type]);
	$("#scount").html(station.count);
	$("#sdesc").html(station.description);
}

function showChart(data){
	 $('#device-data-chart').highcharts('StockChart', {
	        chart: {
	            alignTicks: true,
	            width:$('#device-data-chart').width()
	        },
	        rangeSelector: {
	            selected: 1,
	            inputDateFormat:"%m-%d,%H:%M"
	        },
	        title: {
	            text: ''
	        },
	        credits: {
	            enabled: false
	        },
	        yAxis:{
	        	title:{
	        		text:yAxisTitle
	        	},
	        	opposite: false
	        },
	        series: [{
	            type: 'line',
	            name: '',
	            data: data,
	            turboThreshold:data.length,
	            dataGrouping: {
	                units: [[
	                     	'millisecond', // unit name
	                    	[1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
	                    ], [
	                    	'second',
	                    	[1, 2, 5, 10, 15, 30]
	                    ], [
	                    	'minute',
	                    	[1, 2, 5, 10, 15, 30]
	                    ], [
	                    	'hour',
	                    	[1, 2, 3, 4, 6, 8, 12]
	                    ], [
	                    	'day',
	                    	[1]
	                    ], [
	                    	'week',
	                    	[1]
	                    ], [
	                    	'month',
	                    	[1, 3, 6]
	                    ], [
	                    	'year',
	                    	null
	                    ]]
	            }
	        }]
	    });
}

function showData(type){
	
	if(type == "tem"){
		showChart(tem);
	}else if(type == "hum"){
		showChart(hum);
	}else if(type == "co2"){
		showChart(co2);
	}else if(type == "hq"){
		showChart(hq);
	}
}

function extractData(list){
	var i;
	var d;
	var tmpDate = new Date();
	tem = [];
	hum = [];
	co2 = [];
	hq = [];
	
	for(i=0; i < list.length; i++){
		d = list[i];
		d.time = d.time * 1000;
		tem.push([d.time,d.tem]);
		hum.push([d.time,d.hum]);
		co2.push([d.time,d.co2]);
		hq.push([d.time,d.hqTem]);
		tmpDate.setTime(list[i].time);
		list[i].time = tmpDate.Format("yyyy-MM-dd hh:mm");
	}
	
}

function bindFactorCheck(){
	$("#factor-check-list input").click(function(){
		if($(this).is(":checked")){
			$("#factor-check-list input").prop('checked', false);
	        // 把自己设置为选中
	        $(this).prop('checked',true);
	        //更新图形
	        var id = $(this).attr("id");
	        $(this).prop('checked',true);
	        
	        showData(id);
		}
	});
}

function bindExportDataBtn(){
	$("#export_data_btn").click(function(){
		var ep=new ExcelPlus();
		var content = [["Time","Temperature","Humidity","CO2","Globe Temperature"]];
		
		var i,d; 
		
		for(i = 0; i < sData.length; i++){
			d = sData[i];
			content.push([d.time,d.tem,d.hum,d.co2,d.hqTem]);
		}
		
		
		ep.createFile("Book1")
		  .write({ "content":content })
		  .saveAs(stationName+".xlsx");
	});
}



var station_id = 0;
var stationName = "布点";
var typeDic = ["","温湿","黑球","CO2"];
var tem,hum,co2,hq;
var yAxisTitle="";
var sData = null;

$(function(){
	var url = window.location.href;
	var params = url.split('/');
	station_id = params[7] * 1;
	bindFactorCheck();
	bindExportDataBtn();
	
	loadStationInfoAndData();
});