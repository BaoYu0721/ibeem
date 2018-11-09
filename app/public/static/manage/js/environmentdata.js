/**
 * 设备数据操作相关
 */

// 对Date的扩展，将 Date 转化为指定格式的String 
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
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

/**
 * 获取当前URL参数值
 * @param name	参数名称
 * @return	参数值
 */
function getUrlParam(name) {
	   var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
	   var r = window.location.search.substr(1).match(reg);
	   if (r!=null) 
		   return unescape(r[2]); 
	   return null;
	   
}

function updateDeviceShow(){
	$("#device-data-chart").height(Math.round($("#device-data-chart").width()*0.10)+200);
	
	var startTime = new Date();
	var endTime = new Date();
	startTime.setTime(startTimeStamp);
	endTime.setTime(endTimeStamp);
	$("#startTime input").val(startTime.Format("yyyy-MM-dd hh:mm"));
	$("#endTime input").val(endTime.Format("yyyy-MM-dd hh:mm"));
	
	startTime.setTime(endTimeStamp - 1000* 60 * 60 * 24 * 30 + 5000); //最多只能查询过去一个月的数据
	$('.form_datetime').datetimepicker({
        language:  'en',
        format: 'yyyy-mm-dd hh:ii',
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		minuteStep: 5,
		startDate:startTime.Format("yyyy-MM-dd hh:mm")
    });	
	
	Highcharts.setOptions({ 
	    global: { useUTC: false  } 
	});
}
 
function bindTimeSelect(){
	$("#time-select-switch").click(function(){
		var cl = $("#time-select-switch span").attr("class");
		if(cl.indexOf("down") >= 0){
			$("#time-select-switch span").removeClass("glyphicon-chevron-down");
			$("#time-select-switch span").addClass("glyphicon-chevron-up");
		}else{
			$("#time-select-switch span").removeClass("glyphicon-chevron-up");
			$("#time-select-switch span").addClass("glyphicon-chevron-down");
		}
	});
}

var endTimeStamp = new Date().getTime();
var startTimeStamp = endTimeStamp - 1000* 60 * 60 * 24 * 1 + 5000;
var wholeData = [];
var temperature=[],humidity=[],pm25=[],co2=[],sunshine=[];
var yAxisTitle = "";
var deviceOnline = false;
var device_id = 0;
var device_name = "Device";


function extractData(data){	
	data.sort(function(a,b){
		return a.time * 1 - b.time * 1;
	});
	var i, len= data.length;
	var datum;
	var time;
	var newDate = new Date();
	
	//temperature=[],humidity=[],pm25=[],co2=[],sunshine=[];
	
	for(i = 0; i < len; i++){
		datum = data[i];
		time = datum.time * 1;
		datum.d1 = (datum.tem * 1).toFixed(1);
		temperature.push([time,datum.d1 * 1]);
		//datum.d2 = Math.round(datum.d2 * 0.85);
		datum.d2 = (datum.hum * 1).toFixed(1);
		humidity.push([time,datum.d2 * 1]);
		datum.d3 = datum.pm;
		pm25.push([time,datum.d3*1]);
		datum.d4 =datum.co2;
		co2.push([time,datum.d4*1]);
		//datum.d5 = Math.round(datum.d5 * 0.1);
		datum.d5 = datum.lightIntensity
		sunshine.push([time,datum.d5 * 1]);
	}
	
	
	//显示最新的数据
	$("#temperature_val").html(temperature[len-1][1].toFixed(1));
	$("#humandity_val").html(humidity[len-1][1].toFixed(1));
	$("#pm25_val").html(pm25[len-1][1]);
	$("#co2_val").html(co2[len-1][1]);
	$("#light_val").html(sunshine[len-1][1]);
	
	//为了表格数据显示，逆序排列
	data.sort(function(a,b){
		return b.time * 1 - a.time * 1;
	});
	for(i = 0; i < len; i++){
		newDate.setTime(data[i].time);
		data[i].time = newDate.Format("yyyy-MM-dd hh:mm");
	}
	
	wholeData = data;
}

function showDataChart(data){
	// create the chart
    $('#device-data-chart').highcharts('StockChart', {
        chart: {
            alignTicks: true,
            width:$('#device-data-chart').width()
        },
        rangeSelector: {
            selected: 1,
            /*inputDateFormat:"%m-%d,%H:%M"*/
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
        scrollbar:{
        	enabled:false,
        },
        series: [{
            type: 'line',
            name: '',
            data: data,
            //turboThreshold:data.length,
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

function loadDeviceData(){
	
	$.ajax({
        type: "post",
        dataType: "json",
        url: '/device/environmentdata',
        data:{
        	deviceId:device_id,
        	startTime:Math.round(startTimeStamp/1000),
			endTime:Math.round(endTimeStamp/1000)
        },
        success: function (result) {
        	if(result.result == "success"){
        		if(result.data != null){
        			if(result.data.length == 0){
        				alert("No data in the selected time range！");
        				return;
        			}
        			//整理数据
        			extractData(result.data);
        			//显示设备信息
        			device_name = result.deviceName;
        			$("#device_name").html(result.deviceName);
        			$("#device_id").html(result.deviceId);
        			//显示温度数据
        			yAxisTitle = "Temprature（<sub>o</sub>C）"
        			showDataChart(temperature);
        			//加载表格的数据，逆序排列
        			$('#devicedata-table').bootstrapTable('load', result.data);
        		}
        	}else{
        		alert("数据读取过程中产生故障!");
        	}
        },
        error:function (XMLHttpRequest, textStatus, errorThrown) 
        { 
          alert(textStatus);          
        } 
    });
}

function loadCloudCalibratData(){

	$.ajax({
        type: "post",
        dataType: "json",
        url: '/device/readCloudCalibrat',
        data:{
        	deviceId:device_id
        },
        success: function (result) {
        	if(result.state == 0){
        		//显示校准数据
        		$.each(result.caliData,function(key,value) { 
        			$("#cali_"+key).val(value);
        		});
        		
        		deviceOnline = true;
        	}else{ 
        		//校准数据读取失败，进行提示
        		deviceOnline = false;
        		$(".cali_input").val(result.msg);
        	}
        },
        error:function (XMLHttpRequest, textStatus, errorThrown) 
        { 
        	deviceOnline = false;   
        	$(".cali_input").val("----");
        } 
    });
	
}

function bindCaliInputChange(){
	$(".cali_input").change(function(){
		$(this).attr("caliChanged",true);
	});
}

function bindCloudCalibratButton(){
	$(".cali_btn").click(function(){
		if(deviceOnline){
			var btnId = $(this).attr("id");
			var parId = btnId.substr(0, btnId.length - 4);
			var caliParams = "";
			var tempId;
			$("#" + parId + " .cali_input").each(function(){
				if($(this).attr("caliChanged") == "true"){
					tempId = $(this).attr("id");
					tempId = tempId.substr(5,6);
					caliParams += tempId + ":" +  $(this).val() + ",";
					$(this).attr("caliChanged",false); 
				}
			});
			if(caliParams == ""){
				alert("Change firstly！");
				return;
			}
			//调用云校正
			$.ajax({
		        type: "post",
		        dataType: "json",
		        url: '/device/cloudCalibrat',
		        data:{
		        	deviceId:device_id,
		        	caliParams:caliParams
		        },
		        success: function (result) {
		        	alert(result.msg);
		        },
		        error:function (XMLHttpRequest, textStatus, errorThrown) 
		        { 
		        	alert("Fail to calibrate！");        
		        } 
		    });
		}else{
			alert("Devie Offline！");
		}
		
	});
}

function bindAbsTimePickerBtn(){
	$("#abs-time-btn").click(function(){
		startTimeStamp = $("#startTime").datetimepicker("getDate").getTime();
		endTimeStamp = $("#endTime").datetimepicker("getDate").getTime();
		
		var tempDate = new Date();
		tempDate.setTime(startTimeStamp);
		//alert(tempDate.Format("yyyy-MM-dd hh:mm:ss"));
		tempDate.setTime(endTimeStamp);
		//alert(tempDate.Format("yyyy-MM-dd hh:mm:ss"));
		if(endTimeStamp <= startTimeStamp){
			alert("Start time should be latter than end time!");
			return;
		}
		loadDeviceData();
	});
}

function quickTimeSelect(i){
	endTimeStamp = new Date().getTime();
	
	if(i == 1){
		startTimeStamp = endTimeStamp - 1000* 60 * 10 + 5000;
	}else if(i == 2){
		startTimeStamp = endTimeStamp - 1000* 60 * 20 + 5000;
	}else if(i == 3){
		startTimeStamp = endTimeStamp - 1000* 60 * 30 + 5000;
	}else if(i == 4){
		startTimeStamp = endTimeStamp - 1000* 60 * 60 * 1 + 5000;
	}else if(i == 5){
		startTimeStamp = endTimeStamp - 1000* 60 * 60 * 6 + 5000;
	}else if(i == 6){
		startTimeStamp = endTimeStamp - 1000* 60 * 60 * 12 + 5000;
	}else if(i == 7){
		startTimeStamp = endTimeStamp - 1000* 60 * 60 * 24 * 1 + 5000;
	}else if(i == 8){
		startTimeStamp = endTimeStamp - 1000* 60 * 60 * 24 * 2 + 5000;
	}else if(i == 9){
		startTimeStamp = endTimeStamp - 1000* 60 * 60 * 24 * 7 + 5000;
	}
	loadDeviceData();
}

function bindExportDataBtn(){
	$("#export_data_btn").click(function(){
		var ep=new ExcelPlus();
		var content = [["Time","Temperature","Humidity","PM2.5","CO2","Light"]];
		
		var i,d; 
		
		for(i = 0; i < wholeData.length; i++){
			d = wholeData[i];
			content.push([d.time,d.d1,d.d2,d.d3,d.d4,d.d5]);
		}
		
		
		ep.createFile("Book1")
		  .write({ "content":content })
		  .saveAs(device_name+"_"+device_id+".xlsx");
	});
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
	        
	        //校正参数板块
	        $(".cali_setting").addClass("hidden");
	        $("#cali_"+id).removeClass("hidden");
	        
	        if(id == "tem"){
	        	yAxisTitle = "Temperature（<sub>o</sub>C）"
	        	showDataChart(temperature);
	        }else if(id == "hum"){
	        	yAxisTitle = "Humidity(%)"
	        	showDataChart(humidity);
	        }else if(id == "pm25" ){
	        	yAxisTitle = "PM2.5(ug/m<sup>3</sup>)"
	        	showDataChart(pm25);
	        }else if(id == "co2"){
	        	yAxisTitle = "CO2(ppm)"
	        	showDataChart(co2);
	        }else if(id == "sun"){
	        	yAxisTitle = "Light(lux)"
	        	showDataChart(sunshine);
	        }
		}
	});
}

$(function(){
	device_id = getUrlParam("device_id")*1;
	
	bindTimeSelect();
	updateDeviceShow();
	$(window).bind("resize", function(){
		updateDeviceShow();
	});
	bindAbsTimePickerBtn();
	bindFactorCheck();
	
	bindCaliInputChange();
	bindCloudCalibratButton();
	
	loadDeviceData();
	loadCloudCalibratData();
	
	bindExportDataBtn();
});