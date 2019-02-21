//===========修改content宽高开始============
//获取浏览器包括滚动条在内的宽度
window.getWidth= function(){  
  if(window.innerWidth!= undefined){  
      return window.innerWidth;  
  }  
  else{  
      var scrollWidth = getScrollWidth();
      return $(window).width()+scrollWidth;
  }  
} 
//获取浏览器滚动条宽度
function getScrollWidth() {  
var noScroll, scroll, oDiv = document.createElement("DIV");  
oDiv.style.cssText = "position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;";  
noScroll = document.getElementsByTagName("body")[0].appendChild(oDiv).clientWidth;  
oDiv.style.overflowY = "scroll";  
scroll = oDiv.clientWidth;  
document.getElementsByTagName("body")[0].removeChild(oDiv);
return noScroll-scroll;
}
//设置页面高度宽度
function init(){
	//初始化时，将右侧content高度设置为屏幕高度减导航栏高度
	var window_height = $(window).height();
	var window_width = window.getWidth();
	var nav_height = $(".main .ui.inverted.menu").height();
	//var content_height = window_height - nav_height;
	//右侧content是absolute，距离上侧55px，直接减去55
	$("#content").css("height",window_height-55);
	//main的宽度是，屏幕宽度减去左侧导航栏宽度
	$('#content').css("width",window_width-60);
	$('.fl.main').css("width",window_width-60);
	//$('.ui.grid').css("min-width",1200);
}
$(window).resize(function(){
	/*动态设置内容区高度  */
	init();
});
init();
//===========修改content宽高结束============
		var temperature=[], humidity=[],pm25=[],co2=[],sunshine=[];
	    var ecount=0;
	    var timeArr=[];
	    var showData={};
	    var deviceName=[];
    	var sunshineFlag=false;
		var temperatureFlag=false;
		var co2Flag=false;
		var pm25Flag=false;
		var humFlag=false;
    	/*下载数据  */
    	var downDeviceId=[];
    	var currentIndex=0;
		var downloadData={};
	    var colors=['#7cb5ec', '#90ed7d', '#434348', '#8085e8','#f7a35c', '#8085e9', '#f15c80', '#e4d354',  '#8d4653', '#91e8e1']
	    
	    var dataGrouping={
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
             };
	    
	    /*数据下载  */
    	$(function(){
    		$(".ui.checkbox").checkbox();
    	});
    	
    	//复选框选中事件
    	function toggleTest(obj){
    		var _this=obj;
    		if($(_this).parent().hasClass('checked')){
    			$(_this).parent().removeClass("checked");
    		}else{
    			$(_this).parent().addClass("checked");
    		}
    	}
    	
    	   /*时间格式转换  */
    	   Date.prototype.Format = function(fmt) 
    	   {
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
    	   
    	   function setDate(){
    		    var time={};
	   			var startTime = new Date();
	   			var endTime = new Date();
	   			
	   			var currentTimeStamp =startTime.getTime();
	   			startTimeStamp = startTime.getTime();
	   			//startTimeStamp = startTime.getTime() - 48*60*60*1000;
	   			endTimeStamp = endTime.getTime();
	   			
	   			if(startTimeStamp>endTimeStamp){
	   				
	   				alertokMsg(getLangStr("surveyRep_messg1"),getLangStr("alert_ok"));
	   				return;
	   			}
	   			startTime.setTime(startTimeStamp);
	   			endTime.setTime(endTimeStamp);
	   			$("#startTime_d input").val(startTime.Format("yyyy-MM-dd"));
	   			$("#endTime_d input").val(endTime.Format("yyyy-MM-dd"));
	   			$("#startTime_hour_d input").val("00:00");
	   			$("#endTime_hour_d input").val("23:59");	   			
	   			
	   			startTime.setTime(endTimeStamp - 1000* 60 * 60 * 24 * 30 + 5000); //最多只能查询过去一个月的数据
	   			$('.form_datetime').datetimepicker({
	   				lang:'ch',
	   				timepicker:false,
	   				todayButton:false,
	   				format:'Y-m-d',
	   				formatDate:'Y-m-d',
	   				//minDate:'-1970/01/02',
	   				//maxDate:'+1970/01/02' 
	   				//minDate:startTime,
	   				maxDate:$("#endTime_d input").val()
	   		    });
	   			
	   			$(".form_datetime_hour").datetimepicker({
	   				datepicker:false,
	   				format:'H:i',
	   				step:5
	   		    });
    	   }
    	   
    	   function updateDeviceShow(){
    		   
    		   	var startTime_ss = new Date();
	   			var endTime_ss = new Date();
	   			
	   			var currentTimeStamp_ss =startTime_ss.getTime();
	   			startTimeStamp_ss = startTime_ss.getTime();
	   			//startTimeStamp_ss = startTime_ss.getTime() - 48*60*60*1000;
	   			endTimeStamp_ss = endTime_ss.getTime();
	   			
	   			if(startTimeStamp_ss>endTimeStamp_ss){
	   				alertokMsg(getLangStr("surveyRep_messg1"),getLangStr("alert_ok"));
	   				return;
	   			}
	   			
	   			startTime_ss.setTime(startTimeStamp_ss);
	   			endTime_ss.setTime(endTimeStamp_ss);
	   			$("#startTime input").val(startTime_ss.Format("yyyy-MM-dd"));
	   			$("#endTime input").val(endTime_ss.Format("yyyy-MM-dd"));
	   			$("#startTime_hour input").val("00:00");
	   			$("#endTime_hour input").val("23:59");
	   			
	   			startTime_ss.setTime(endTimeStamp_ss - 1000* 60 * 60 * 24 * 30 + 5000); //最多只能查询过去一个月的数据
	   			
	   			$('.form_datetime_m').datetimepicker({
	   				lang:'ch',
	   				timepicker:false,
	   				todayButton:false,
	   				format:'Y-m-d',
	   				formatDate:'Y-m-d',
	   		/*		minDate:'-1970/01/02',
	   				maxDate:'+1970/01/02' */
	   				minDate:startTime_ss,
	   				maxDate:$("#endTime input").val()
	   			});

	   			$(".form_datetime_hour_m").datetimepicker({
	   				datepicker:false,
	   				format:'H:i',
	   				step:5
	   		    });		
				
				/*开始和结束的时间戳  */
				var $start_time2 = String($("#startTime input").val() + " 00:00:00");
				var $end_time2 = String($("#endTime input").val() + " 23:59:59");
    			var startTimeStamp2=Date.parse($start_time2)/1000;
    			var endTimeStamp2=Date.parse($end_time2)/1000;
    			
	   			var $startTime_hour = $("#startTime_hour input").val();
	   			var $endTime_hour = $("#endTime_hour input").val();
	   			
	   			/* 是否是工作日 */
			    var $workDay_2;
			    workdayFlag_zz = $("#workday_zz").hasClass("checked");
			    workdayFlag_nn = $("#workday_nn").hasClass("checked");
			    if(!workdayFlag_zz&&!workdayFlag_nn){
			    	alertokMsg(getLangStr("devicedata_settime"),getLangStr("alert_ok"));
			    	return;
			    }
			    if(workdayFlag_zz){
			    	$workDay_2 = 1;
			    }
			    if(workdayFlag_nn){
			    	$workDay_2 = 0;
			    }
			    if(workdayFlag_zz&&workdayFlag_nn){
			    	$workDay_2 = 2;
			    }  		
			
			    //addLoading();
				loadDeviceData(startTimeStamp2,endTimeStamp2,$startTime_hour,$endTime_hour,$workDay_2);
    	   }
    	   // 是否筛选设备
    	   $(document).on("click","#result_charts_nav li",function(){
    		   
	   		   	var $rest_tem = []; //temperature
			   	var $rest_hum = []; //humidity
			   	var $rest_co2 = []; //co2
			   	var $rest_pm25 = []; //pm25
			   	var $rest_sun = []; //sunshine  	
			   	
    		   	if($(this).attr("style").indexOf("transparent") != -1){
    		   		$(this).attr("style",$(this).data("bc"));
    		   		$(this).removeClass("out_choice");
    		   		$(this).data("name2",$(this).data("name"));
    		   	}else{
    		   		$(this).css("border","1px solid transparent");
    		   		$(this).addClass("out_choice");
    		   		$(this).data("name2","isChanged");
    		   	}
    		   	
    		   	
    		   	for(var i=0;i<temperature.length;i++){
    		   		for(var k=0;k<$("#result_charts_nav li").length;k++){
        		   		if(temperature[i].name == $("#result_charts_nav li").eq(k).data("name2")){
        		   			$rest_tem.push(temperature[i]);
        		   			$rest_hum.push(humidity[i]);
        		   			$rest_co2.push(co2[i]);
        		   			$rest_pm25.push(pm25[i]);
        		   			$rest_sun.push(sunshine[i]);
        		   		}  		   			
    		   		}

    		   	}
    		   	
    		   	// 查看数据加载
       		   if(isEmpty($rest_tem)){
   		   	  		$("#tempartureChart").html(getLangStr("devicedata_tem") +" "+ getLangStr("surveyRep_empty"));
   		   	  		$("#tempartureChart").addClass("charts_nodata");
   		   	  	}else{
   		   	  		$("#tempartureChart").html("");
   		   	  		$("#tempartureChart").removeClass("charts_nodata");
   		   	  		sjcx_chart("tempartureChart","temperature",$rest_tem);
   		   	  	}
   		   	  	
   				if(isEmpty($rest_hum)){
   		   	  		$("#humidityChart").html(getLangStr("devicedata_hum") +" "+ getLangStr("surveyRep_empty"));
   		   	  		$("#humidityChart").addClass("charts_nodata");
   		   	  	}else{
   		   	  		$("#humidityChart").html("");
   		   	  		$("#humidityChart").removeClass("charts_nodata");
   		   	  		sjcx_chart("humidityChart","hum",$rest_hum);
   		   	  	}
   					
   				if(isEmpty($rest_co2)){
   		   	  		$("#co2Chart").html(getLangStr("devicedata_co2") +" "+ getLangStr("surveyRep_empty"));
   		   	  		$("#co2Chart").addClass("charts_nodata");
   		   	  	}else{
   		   	  		$("#co2Chart").html("");
   		   	  		$("#co2Chart").removeClass("charts_nodata");
   		   	  		sjcx_chart("co2Chart","co2",$rest_co2);
   		   	  	}
   					
   				if(isEmpty($rest_pm25)){
   		   	  		$("#pmChart").html(getLangStr("devicedata_pm25") +" "+ getLangStr("surveyRep_empty"));
   		   	  		$("#pmChart").addClass("charts_nodata");
   		   	  	}else{
   		   	  		$("#pmChart").html("");
   		   	  		$("#pmChart").removeClass("charts_nodata");
   		   	  		sjcx_chart("pmChart","pm25",$rest_pm25);
   		   	  	}
   				
   				if(isEmpty($rest_sun)){
   		   	  		$("#beamChart").html(getLangStr("devicedata_sun") +" "+ getLangStr("surveyRep_empty"));
   		   	  		$("#beamChart").addClass("charts_nodata");
   		   	  	}else{
   		   	  		$("#beamChart").html("");
   		   	  		$("#beamChart").removeClass("charts_nodata");
   		   	  		sjcx_chart("beamChart","sunshine",$rest_sun);
   		   	  	}
    	   });    	   
    	   
    	   /*整理折线图数据  */
    	   function extractData(deviceData){
    		   
			  var tempTemperature={},tempHumidity={},tempPm25={},tempCo2={},tempSunshine={};
			  var tempTemperatureData=[],tempHumidityData=[],tempPm25Data=[],tempCo2Data=[],tempSunshineData=[];
			  var name=deviceData.deviceName;
			
			  /* 2017.08.24  折线图设备名集中显示 */
			  setDeviceName.push(name);
			  console.log(setDeviceName);
			  var $deviceNameStr = '';
			  for(var k=0;k<setDeviceName.length;k++){
				  var p = k;
				  if(p > 9){
					  p = p - 10;
				  }
				  $deviceNameStr += "<li data-name='"+ setDeviceName[k] +"' data-name2='"+ setDeviceName[k] +"' data-bc='border:1px solid "+ colors[p] +";color:"+ colors[p] +"' style='border:1px solid "+ colors[p] +";color:"+ colors[p] +"'><span style='background-color:"+ colors[p] +";'></span> "+ setDeviceName[k] +"</li>";
			  }
			  $("#result_charts_nav").html($deviceNameStr);

			  
			  var data=deviceData.data;
			  ecount++;
			  if(ecount==10){
				  ecount=0;
			  }
			  
    			data.sort(function(a,b){
    				return a.time * 1 - b.time * 1;
    			});
    			var i, len= data.length;
    			var datum;
    			var time;
    			var timeStemp;
    			var timeUTC;
    			var newDate = new Date();

    			for(i = 0; i < len; i++){
    				var temparr=[];
  				
    				datum = data[i];
    				time = datum.time;
    				timeArr.push(time);
    				
	   				newDate.setTime(data[i].time);
	   				data[i].time = newDate.Format("MM-dd hh:mm");
	   				data[i].timestemp = time;
    		  
    				// 转换成时间戳UTC，不然highcharts无法正确显示横轴的时间 time = 时间戳
    				var t = new Date(parseInt(time));
    				var uy = t.getUTCFullYear();
    				var um = t.getUTCMonth();
    				var ud = t.getUTCDate();
    				var uh = t.getUTCHours();
    				var umm = t.getUTCMinutes();
    				var ums = t.getUTCSeconds();
    				var umss = t.getUTCMilliseconds();
    				
    				timeUTC = Date.UTC(uy,um,ud,uh,umm,ums,umss); /*,umm,ums,umss*/
    				// console.log(timeUTC);

    				datum.d1 = (datum.tem * 1).toFixed(1);
    				tempTemperatureData.push([timeUTC,datum.d1 * 1]);
    				
    				datum.d2 = (datum.hum * 1).toFixed(1);
    				tempHumidityData.push([timeUTC,datum.d2 * 1]);
    				
    				datum.d3 = datum.pm;
    				tempPm25Data.push([timeUTC,datum.d3 * 1]);
    				
    				datum.d4 =datum.co2;
    				tempCo2Data.push([timeUTC,datum.d4 * 1]);
    				
    				datum.d5 = datum.lightIntensity
    				tempSunshineData.push([timeUTC,datum.d5 * 1]);
    			}

    			// console.log(timeArr);

			    tempTemperature.name=name;
			    tempTemperature.data=tempTemperatureData;
			    tempTemperature.type='area';
			    tempTemperature._colorIndex = indexNum;
			    tempTemperature._symbolIndex = indexNum;			    
			    temperature.push(tempTemperature);
			    
			    tempHumidity.name=name;
			    tempHumidity.data=tempHumidityData;
			    tempHumidity.type='area';
			    tempHumidity._colorIndex = indexNum;
			    tempHumidity._symbolIndex = indexNum;
			    humidity.push(tempHumidity);
			    
			    tempPm25.name=name;
			    tempPm25.data=tempPm25Data;
			    tempPm25.type='area';
			    tempPm25._colorIndex = indexNum;
			    tempPm25._symbolIndex = indexNum;	
			    pm25.push(tempPm25);

			    tempCo2.name=name;
			    tempCo2.data=tempCo2Data;
			    tempCo2.type='area';
			    tempCo2._colorIndex = indexNum;
			    tempCo2._symbolIndex = indexNum;	
			    co2.push(tempCo2);
			    
			    tempSunshine.name=name;
			    tempSunshine.data=tempSunshineData;
			    tempSunshine.type='area';
			    tempSunshine._colorIndex = indexNum;
			    tempSunshine._symbolIndex = indexNum;	
			    sunshine.push(tempSunshine);
			    
			    indexNum++;
			    
			    // 达标率图
			    dbltCategories = [];
			    dbltCategories_2 = [];
				dbltfenlei = [];
				Tem_array=[];
				Hum_array=[];
				Pm25_array=[];
				Co2_array=[];
				Sun_array=[];
				for(var i=0;i<resetData.length;i++){
					extractData_2(resetData[i]); 
				}
			    
				// 查看数据加载
      		   if(isEmpty(temperature)){
  		   	  		$("#tempartureChart").html(getLangStr("devicedata_tem") +" "+ getLangStr("surveyRep_empty"));
  		   	  		$("#tempartureChart").addClass("charts_nodata");
  		   	  	}else{
  		   	  		$("#tempartureChart").html("");
  		   	  		$("#tempartureChart").removeClass("charts_nodata");
  		   	  		sjcx_chart("tempartureChart","temperature",temperature);
  		   	  	}
  		   	  	
  				if(isEmpty(humidity)){
  		   	  		$("#humidityChart").html(getLangStr("devicedata_hum") +" "+ getLangStr("surveyRep_empty"));
  		   	  		$("#humidityChart").addClass("charts_nodata");
  		   	  	}else{
  		   	  		$("#humidityChart").html("");
  		   	  		$("#humidityChart").removeClass("charts_nodata");
  		   	  		sjcx_chart("humidityChart","hum",humidity);
  		   	  	}
  					
  				if(isEmpty(co2)){
  		   	  		$("#co2Chart").html(getLangStr("devicedata_co2") +" "+ getLangStr("surveyRep_empty"));
  		   	  		$("#co2Chart").addClass("charts_nodata");
  		   	  	}else{
  		   	  		$("#co2Chart").html("");
  		   	  		$("#co2Chart").removeClass("charts_nodata");
  		   	  		sjcx_chart("co2Chart","co2",co2);
  		   	  	}
  					
  				if(isEmpty(pm25)){
  		   	  		$("#pmChart").html(getLangStr("devicedata_pm25") +" "+ getLangStr("surveyRep_empty"));
  		   	  		$("#pmChart").addClass("charts_nodata");
  		   	  	}else{
  		   	  		$("#pmChart").html("");
  		   	  		$("#pmChart").removeClass("charts_nodata");
  		   	  		sjcx_chart("pmChart","pm25",pm25);
  		   	  	}
  				
  				if(isEmpty(sunshine)){
  		   	  		$("#beamChart").html(getLangStr("devicedata_sun") +" "+ getLangStr("surveyRep_empty"));
  		   	  		$("#beamChart").addClass("charts_nodata");
  		   	  	}else{
  		   	  		$("#beamChart").html("");
  		   	  		$("#beamChart").removeClass("charts_nodata");
  		   	  		sjcx_chart("beamChart","sunshine",sunshine);
  		   	  	}
			    
    		}
 
    	   // 数据查询折线图
    	   function sjcx_chart(chartsID,tit,data){
    		   
    		   console.log(data)
    		   
	   		   	var yAxisTitle="";
			   	var sjcxChartTitle = "";
			   	dblMessage = "";
    		   	
			   	if(tit == "temperature"){
		        	yAxisTitle = "(℃)";
		        	sjcxChartTitle = getLangStr("devicedata_tem") + "(℃)";
		        	for(var i=0;i<dbltCategories.fenlei.length;i++){
		        		dblMessage += "["+ dbltCategories.fenlei[i] +"："+ dbltCategories.result[0].data[i] +"%]<br/>";
		        	}
		        }else if(tit == "hum"){
		        	yAxisTitle = "(%)";
		        	sjcxChartTitle = getLangStr("devicedata_hum") + "(%)";
		        	for(var i=0;i<dbltCategories.fenlei.length;i++){
		        		dblMessage += "["+ dbltCategories.fenlei[i] +"："+ dbltCategories.result[1].data[i] +"%]<br/>";
		        	}
		        }else if(tit == "sunshine"){
		        	yAxisTitle = "(lux)";
		        	sjcxChartTitle = getLangStr("devicedata_sun") + "(lux)";
		        	for(var i=0;i<dbltCategories.fenlei.length;i++){
		        		dblMessage += "["+ dbltCategories.fenlei[i] +"："+ dbltCategories.result[2].data[i] +"%]<br/>";
		        	}
	    		   
		        }else if(tit == "co2"){
		        	yAxisTitle = "(ppm)";
		        	sjcxChartTitle = getLangStr("devicedata_co2") + "(ppm)";
		        	for(var i=0;i<dbltCategories.fenlei.length;i++){
		        		dblMessage += "["+ dbltCategories.fenlei[i] +"："+ dbltCategories.result[3].data[i] +"%]<br/>";
		        	}
		        }else if(tit == "pm25" ){
		        	yAxisTitle = "(ug/m<sup>3</sup>)";
		        	sjcxChartTitle = getLangStr("devicedata_pm25") + "(ug/m<sup>3</sup>)";
		        	for(var i=0;i<dbltCategories.fenlei.length;i++){
		        		dblMessage += "["+ dbltCategories.fenlei[i] +"："+ dbltCategories.result[4].data[i] +"%]<br/>";
		        	}
		        }


    		   $("#"+ chartsID).highcharts({
    			    chart: {
    			        zoomType: 'x'
    			    },
    			    title: {
    			        text: sjcxChartTitle,
    			        align: 'center',
    		            style: {
    		                //color: '#999999',
    		                fontSize: '16px'
    		            }
    			    },
    		        subtitle: {
    		            text: dblMessage,
    		            align: 'right',
    		            style: {
    		                color: '#999999',
    		                fontSize: '14px'
    		            }
    		        },
    			    credits: {
    			        enabled: false
    			    },
    			    xAxis: {
						type: 'datetime',
						dateTimeLabelFormats: {
						    millisecond: '%H:%M:%S.%L',
							second: '%H:%M:%S',
							minute: '%H:%M',
							hour: '%H:%M',
							day: '%m-%d',
							week: '%m-%d',
							month: '%Y-%m',
							year: '%Y'
						},
						labels: {
						    format: '{value:%m-%d %H:%M}',
						    /* step:2,
					        rotation:30, 倾斜30度，防止数量过多显示不全 */  
						},
    			    },
    			    tooltip: {
    			        dateTimeLabelFormats: {
    			            millisecond: '%H:%M:%S.%L',
    			            second: '%H:%M:%S',
    			            minute: '%H:%M',
    			            hour: '%H:%M',
    			            day: '%Y-%m-%d',
    			            week: '%m-%d',
    			            month: '%Y-%m',
    			            year: '%Y'
    			        },
    			        xDateFormat: '%Y-%m-%d %H:%M:%S',//鼠标移动到趋势线上时显示的日期格式
    			        shared: true,
    			        split: false,
    	               /* distance: 30,*/
    			       /* formatter: function () {
    		                //return this.y;
    		            }*/
    			    },
    			    yAxis: {
    			        title: {
    			            // text: '<span style="font-size:14px;color:#666666;">达标率</span><br />L00011：42%<br />L00013：22%',
    			            //text:yAxisTitle
    			            text:null
    			        },
 
    			    },
    	            legend: {
    	                enabled: false
    	                /*labelFormat: '{name}'*/
    	            },
    	            colors:colors,
    			    plotOptions: {
    			        area: {
    			            fillColor: {
    			                linearGradient: {
    			                    x1: 0,
    			                    y1: 0,
    			                    x2: 0,
    			                    y2: 1
    			                },
    			                stops: [
    			                    // [0, Highcharts.getOptions().colors[0]],
    			                    // [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
    			                ]
    			            },
    			            marker: {
    			                radius: 2
    			            },
    			            lineWidth: 1,
    			            states: {
    			                hover: {
    			                    lineWidth: 1
    			                }
    			            },
    			            threshold: null
    			        }
    			    },
    			    series:data
    			});

    	   }
    	   
    	   // 达标率图数据整理
    	   function extractData_2(resultData){
    		   	var tempTemperature_2={},tempHumidity_2={},tempPm25_2={},tempCo2_2={},tempSunshine_2={};
 			  	var tempTemperatureData_2=[],tempHumidityData_2=[],tempPm25Data_2=[],tempCo2Data_2=[],tempSunshineData_2=[];
 			  	var tempTemperatureData_2_ok=[],tempHumidityData_2_ok=[],tempPm25Data_2_ok=[],tempCo2Data_2_ok=[],tempSunshineData_2_ok=[];
 			  	var dbltdata = [];
 			  	
 			  	var name=resultData.deviceName;
 			  	var data=resultData.data; 			  	

 			  	dbltfenlei.push(name);
 			  	dbltCategories.fenlei = dbltfenlei;
 	 		  	
 			  	ecount++;
 			  	if(ecount==10){
 			  		ecount=0;
 			  	}
 			  
     			data.sort(function(a,b){
     				return a.time * 1 - b.time * 1;
     			});
     			
     			var j, len= data.length;
     			// 数据的总数  console.log(len);
     			
     			for(j=0;j<len;j++){
     				
     				data_s = data[j];

     				data_s.d1 = (data_s.tem * 1).toFixed(1);
    				tempTemperatureData_2.push([data_s.d1 * 1]);
    				
    				data_s.d2 = (data_s.hum * 1).toFixed(1);
    				tempHumidityData_2.push([data_s.d2 * 1]);
    				
    				data_s.d3 = data_s.pm;
    				tempPm25Data_2.push([data_s.d3 * 1]);
    				
    				data_s.d4 = data_s.co2;
    				tempCo2Data_2.push([data_s.d4 * 1]);
    				
    				data_s.d5 = data_s.lightIntensity
    				tempSunshineData_2.push([data_s.d5 * 1]);
	
     			}
     			
     			// 获取参数筛选数据
     			var min_tem=$("#min_tem").val();
     			var max_tem=$("#max_tem").val();
     			
     			var min_hum=$("#min_hum").val();
     			var max_hum=$("#max_hum").val();
     			
     			var min_pm25=$("#min_pm25").val();
     			var max_pm25=$("#max_pm25").val();
     			
     			var min_co2=$("#min_co2").val();
     			var max_co2=$("#max_co2").val();
     			
     			var min_sun=$("#min_sun").val();
     			var max_sun=$("#max_sun").val();
     			
     			// 返回筛选之后的数据长度并且 计算平均值 
     			for(var i=0;i<tempTemperatureData_2.length;i++){
     				if(tempTemperatureData_2[i]>= min_tem && tempTemperatureData_2[i]<=max_tem){
     					tempTemperatureData_2_ok.push(tempTemperatureData_2[i]);
     				}
     			}
     			var ave_tem = (tempTemperatureData_2_ok.length / len) * 100;
     			ave_tem = Number(ave_tem.toFixed(1));
     			if(isNaN(ave_tem)){
     				ave_tem = 0;
     			}
     			
     			for(var i=0;i<tempHumidityData_2.length;i++){
     				if(tempHumidityData_2[i]>= min_hum&& tempHumidityData_2[i]<=max_hum){
     					tempHumidityData_2_ok.push(tempHumidityData_2[i]);
     				}
     			}
     			var ave_hum = (tempHumidityData_2_ok.length / len) * 100;
     			ave_hum = Number(ave_hum.toFixed(1));
     			if(isNaN(ave_hum)){
     				ave_hum = 0;
     			}
     			
     			for(var i=0;i<tempPm25Data_2.length;i++){
     				if(tempPm25Data_2[i]>= min_pm25&& tempPm25Data_2[i]<=max_pm25){
     					tempPm25Data_2_ok.push(tempPm25Data_2[i]);
     				}
     			}
     			var ave_pm25 = (tempPm25Data_2_ok.length / len) * 100;
     			ave_pm25 = Number(ave_pm25.toFixed(1));
 				if(isNaN(ave_pm25)){
 					ave_pm25 = 0;
     			}
     			
     			for(var i=0;i<tempCo2Data_2.length;i++){
     				if(tempCo2Data_2[i]>= min_co2&& tempCo2Data_2[i]<=max_co2){
     					tempCo2Data_2_ok.push(tempCo2Data_2[i]);
     				}
     			}
     			var ave_co2 = (tempCo2Data_2_ok.length / len) * 100;
     			ave_co2 = Number(ave_co2.toFixed(1));
 				if(isNaN(ave_co2)){	
     				ave_co2 = 0;
     			}
     			
     			for(var i=0;i<tempSunshineData_2.length;i++){
     				if(tempSunshineData_2[i]>= min_sun&& tempSunshineData_2[i]<=max_sun){
     					tempSunshineData_2_ok.push(tempSunshineData_2[i]);
     				}
     			}
     			var ave_sun = (tempSunshineData_2_ok.length / len) * 100;
     			ave_sun = Number(ave_sun.toFixed(1));
 				if(isNaN(ave_sun)){
 					ave_sun = 0;
     			}
     			
     			Tem_array.push(ave_tem);
     			tempTemperature_2.data = Tem_array;
     			tempTemperature_2.name = getLangStr("devicedata_tem");
     			
     			Hum_array.push(ave_hum);
     			tempHumidity_2.data = Hum_array;
     			tempHumidity_2.name = getLangStr("devicedata_hum");
     			
     			Pm25_array.push(ave_pm25);
     			tempPm25_2.data = Pm25_array;
     			tempPm25_2.name = getLangStr("devicedata_pm25");
     			
     			Co2_array.push(ave_co2);
     			tempCo2_2.data = Co2_array;
     			tempCo2_2.name = getLangStr("devicedata_co2");

     			Sun_array.push(ave_sun);
     			tempSunshine_2.data = Sun_array;
     			tempSunshine_2.name = getLangStr("devicedata_sun");
     			
 				dbltdata.push(tempTemperature_2);
 				dbltdata.push(tempHumidity_2);
 				dbltdata.push(tempSunshine_2);
 				dbltdata.push(tempCo2_2);
 				dbltdata.push(tempPm25_2);

			    dbltCategories.result = dbltdata;
			    
    	   }
    	   
  
    	   /* 设备在线率    */
    	   function extractDataOnline(resultData){
    		   	var onlineObj={};
 			  	onlineTimeArr=[];
 			  	onlineObjData = [];
    		    onlineCategories = [];
    		    onlinedateTime = [];
    		    onlineArray=[];
 			  	
 			  	var name=resultData.deviceName;
 			  	var data=resultData.list; 			  	
 	 		  	
 			  	ecount++;
 			  	if(ecount==10){
 			  		ecount=0;
 			  	}
 			  
     			data.sort(function(a,b){
     				return a.time * 1 - b.time * 1;
     			});
     			
     			var j, len= data.length;
     			
    			var newDate = new Date();

    			for(i = 0; i < len; i++){
     				
     				data_s = data[i];
     				
	   				newDate.setTime(data_s.time);
	   				data_s.time = newDate.Format("yyyy-MM-dd");

     				onlineObjData.push([data_s.onlineRate] * 100);
     				onlineTimeArr.push([data_s.time]);
     			}
     			
     			
     			onlineObj.data = onlineObjData;
     			onlineObj.name = name;
     			
     			onlineArray.push(onlineObj);
     			
     			onlineCategories.dateTime = onlineTimeArr;
 				onlineCategories.result = onlineArray;
    	   }
    	   
    	   function Online_chart(data,i){
    		   $('#online_show_' + i).highcharts({
	   		        chart: {
	   		            type: 'column'
	   		        },
	   		        title: {
	   		            text: getLangStr("devicedata_onlinePe")
	   		        },
	   		        xAxis: {
	   		        	/* 设备名 */
	   		            categories:data.dateTime, 
	   		            crosshair: true
	   		        },
	   		        yAxis: {
	   		            min:0,
	   		            max:100,
	   		            title: {
	   		                text: '(%)'
	   		                //text: getLangStr("devicedata_onlinePe")+'(%)'
	   		            }
	   		        },
	   		        tooltip: {
	   		            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
	   		            pointFormat: '<tr><td style="padding:0">{series.name}: </td>' +
	   		            '<td style="padding:0"><b>{point.y:.1f} %</b></td></tr>',
	   		            footerFormat: '</table>',
	   		            shared: true,
	   		            useHTML: true
	   		        },
		   		     credits: {
	                     enabled: false
	                 },
	   		        plotOptions: {
	   		            column: {
	   		                pointPadding: 0,
	   		                borderWidth: 0
	   		            }
	   		        },
	   		        /* 求出平均值 */
	   		        series:data.result,
	   		    });
    		   
    		   //removeLoading();
    	   }
    	   
    	   
    	   /*图表  */
    	   var data="";
    	   function loadDeviceData(startTime,endTime,startTime_hour,endTime_hour,isWorkDay){
    		   
    		    ecount=0;
    		    showData={};
    		    deviceName=[];
    		    deviceNameId={};

    		   	temperature=[];
    		    humidity=[],
    		    pm25=[],
    		    co2=[],
    		    sunshine=[];
    		    
    		    // 达标率图结果
    		    dbltCategories = [];
    		    dbltfenlei = [];
    		    Tem_array=[];
    		    Hum_array=[];
    		    Pm25_array=[];
    		    Co2_array=[];
    		    Sun_array=[];

    		    // 临时数组保存数据
    		    resetData = [];

    		    // 温湿图结果
    		    wstCategories = [];
    		    
    		    // 设备名
    		    setDeviceName = [];

    		    // 折线图索引
    		    indexNum = 0;
    		    
    		   // 清空设备状态数据
    		   $("#shebei_online_box").children(".ui.bottom.attached.tab.segment").remove();
     		   $("#shebei_online_nav").children(".item").remove();
    		    
    		   /*获取设备数据  */
    		   //var deviceId=["6730","6776"];
    		   var deviceId=localStorage.getItem("checkedId").split(",");
        	   $(".middleContent .toprow .deviceName div").html("");
        	   $(".dropdown .menu").html("");
        	   
        	   // 在线率时间 最近的一个月
        	   var newDate = new Date();
        	   
        	   onlineEndTime = newDate.getTime();
        	   onlineEndTime = newDate.Format("yyyy-MM-dd");
        	   
        	   onlineStartTime = newDate.getTime() - 30 * 24 * 60 * 60 * 1000;
        	   onlineStartTime = newDate.setTime(onlineStartTime);
        	   onlineStartTime = newDate.Format("yyyy-MM-dd");
        	   
        	   
        	   setTimeout(function(){
        		   for(var i=0;i<deviceId.length;i++){
        			   (function(index){

            			  // 设备在线率
            			  $.ajax({
    	        			   type:"post",
    	        			   dataType:"json",
    	        			   async: false,
    	        			   url:"/admin/device/view/on_line_rate",
    	        			   data:{
    	        				   deviceID:deviceId[i],
    	        				   startTime:onlineStartTime,
    	        				   endTime:onlineEndTime
    	        			   },
    	        			   success:function(data){
    	        				   extractDataOnline(data);
    	        				   
    	        				   //console.log(onlineCategories);
    	        	    		   	// 在线率图
    	        				   $("#shebei_online_nav").append('<a class="item active" data-tab="shebei_online_'+ i +'">'+ onlineCategories.result[0].name +'</a>');
    	        				   $("#shebei_online_box").append('<div class="ui bottom attached tab segment" data-tab="shebei_online_'+ i +'"><div id="online_show_'+ i +'" class="svgbox"></div></div>')

    	        	    		   	if(onlineCategories.dateTime.length <= 1){
    	        	 		   	  		$("#online_show_"+i).html(getLangStr("surveyRep_empty"));
    	        	 		   	  		$("#online_show_"+i).css("height","2rem");
    	        	 		   	  	}else{
    	        	 		   	  		$("#online_show_"+i).html("");
    	        	 		   	  		$("#online_show_"+i).css("height","400px");
    	        	 		   	  		Online_chart(onlineCategories,i);
    	        	 		   	  	}

    	                		   $("#shebei_online_box").children(".ui.bottom.attached.tab.segment").removeClass("active");
    	                		   $("#shebei_online_box").children(".ui.bottom.attached.tab.segment").eq(0).addClass("active");
    	                		   $("#shebei_online_nav").children(".item").removeClass("active");
    	                		   $("#shebei_online_nav").children(".item").eq(0).addClass("active first")
    	                		   
    	                		   $('#shebei_online_nav .item').tab();
    	        				   
    	        			   },
    	        			   error:function(){
    	        				   //removeLoading();
    	        			   }
            			   });
            			  
            			   // 整理数据
    	        		   $.ajax({
    	        			   type:"post",
    	        			   dataType:"json",
    	        			   //async: false,
    	        			   url:"/admin/device/view/environment",
    	        			   data:{
    	        				   deviceId:deviceId[i],
    	        				   startTime:startTime,
    	        				   endTime:endTime,
    	        				   startWorkTime:startTime_hour,
    	        				   endWorkTime:endTime_hour,
    	        				   workDay:isWorkDay
    	        			   },
    	        			   success:function(data){

    	        				   /*整理数据  */
    	        				   resetData.push(data);
    	        				   
    	        				   extractData(data); // 折线图

    	        				   /*表格显示数据  */
    	        				   var time=[];
    	        				   for(var i=0;i<timeArr.length;i++){
    	        					   if(i%2==0){
    	        						   time.push(timeArr[i]);
    	        					   }
    	        				   }
    	        				   
    	        				   var deviceName="device"+index;
    	        				   showData[data.deviceName]=data.data;
    	        				   deviceNameId[data.deviceName]=deviceId[index];
    	        				   var nameStr='<div class="item" >'+data.deviceName+'</div>';
    	        				   var deviceNameStr='<span class="fl selected" data-id="'+data.deviceId+'">'+data.deviceName+'</span>';
            					   $(".dropdown .menu").append(nameStr);
            					   $(".middleContent .toprow .deviceName div").append(deviceNameStr);
    	        				   if(index==0){
    	        					   showDataList(data.data);
    	        					   $(".dropdown .current").html(data.deviceName);
    	        				   }
    	        				   
    	        				   
    	        			   },
    	        			   error:function(){
    	        				  // removeLoading();
    	        			   }
    	        		   });
            		   })(i);
            		   
            	
            	   }
        		   
        		   localStorage.setItem("deviceData",JSON.stringify(showData));
        		   localStorage.setItem("deviceNameId",JSON.stringify(deviceNameId));

        		   
				   removeLoading();
			   },10);
        	   
        	   
        		   
    	   }

    	   function tableFrame(){
	    	   var  tableStr='<table class="ui compact celled definition table"  id="deviceData">'+
					  '<thead class="full-width">'+
			    '<tr>'+
			      '<th>'+ getLangStr("devicedata_date") +
				        '<div class="sortArrow fr" >'+
				      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
				      	'</div>'+
			      '</th>'+
			      '<th>'+ getLangStr("devicedata_tem") +
			      		'<div class="sortArrow fr" >'+
				      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
				      	'</div>'+
			      '</th>'+
			      '<th>'+ getLangStr("devicedata_hum") +
			      		'<div class="sortArrow fr" >'+
				      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
				      	'</div>'+
				  '</th>'+
			      '<th>'+ getLangStr("devicedata_sun") +
			      		'<div class="sortArrow fr" >'+
				      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
				      	'</div>'+
				  '</th>'+
			      '<th>'+ getLangStr("devicedata_co2") +
			      		'<div class="sortArrow fr" >'+
				      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
				      	'</div>'+
				  '</th>'+
			      '<th>'+ getLangStr("devicedata_pm25") +
			      		'<div class="sortArrow fr" >'+
				      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
				      	'</div>'+
				  '</th>'+
			    '</tr>'+
			  '</thead>'+
			  '<tbody >'+
			  	
			  '</tbody>'+
			  '<tfoot></tfoot>'+
			'</table>';
			return tableStr;
    	   }
    	   
    	   
    	   /*实时数据列表  */
    	   var count=0;
    	   function showDataList(data){
    		//   console.log(data);
    		   
    		   data=data.sort(function(a,b){
	   				return b.time * 1 - a.time * 1;
	   			});
    		   count++;
    		   	   
	   	    	var table=tableFrame();
	   	    	$(".realtimedata").append(table);
	       	    var str="";
	   	    	for(var i=0;i<data.length-1;i++){
	   	    		str+='<tr>'+
					  	  '<td>'+data[i].time+'</td>'+
					      '<td>'+data[i].tem+'</td>'+
					      '<td>'+data[i].hum+'</td>'+
					      '<td>'+data[i].lightIntensity+'</td>'+
					      '<td>'+data[i].co2+'</td>'+
					      '<td>'+data[i].pm+'</td>'+
					  	 '</tr>';
	   	    	}
	       	    $("#deviceData tbody").html(str);
	
	 		   if(count!=1){
	 			   $("#deviceData_wrapper").remove();
	 		   }
	   			$('#deviceData').DataTable();
 				$(".paginate_button.previous").text(getLangStr("datatable_previous"));
 				$(".paginate_button.next").text(getLangStr("datatable_next"));
 				
	   	       	$("#deviceData_wrapper .seven").remove();
	   	       	$("#deviceData_wrapper .nine").removeClass("nine");
	   	       	$("#deviceData_wrapper .eight.right").removeClass("eight").removeClass("right");
	   	       	$("#deviceData_wrapper .eight").remove();
	   	       	$("#deviceData_wrapper .ui.grid").children(":first").remove();
	   	       	$(".row").css({
	   	       		marginLeft:"0",
	   	       		marginRight:"0"
	   	       	});

   	    }	
    	   
    	/*下载数据列表  */   
    	function showDownloadList(){
    		var deviceNameId=JSON.parse(localStorage.getItem("deviceNameId"));
    		// console.log(deviceNameId);
    		var downstr='';
    		var count=0;
    		
    		for(var i=0;i<deviceNameId.length;i++){
    			count++;
       			downstr+='<tr data-name='+deviceNameId[i].name+' data-id='+deviceNameId[i].id+'>'
			      +'<td class="collapsing firstColumn">'
	        	  +'<div class="ui fitted  checkbox checked" >'
	          	  +'<input type="checkbox" checked="checked" id="id'+(count+1)+'" onclick="toggleTest(this)" > <label for="id'+(count+1)+'"></label>'
	       		  +"</div>"
	      		  +"</td>"
			      +"<td class='border-r' title="+deviceNameId[i].name+">"+deviceNameId[i].name+"</td>"
				  +"<td class='border-r'>"+deviceNameId[i].oname+"</td>" // 数据绑定
				  +"<td class='border-r'>"+deviceNameId[i].uname+"</td>"
				  +"<td>"+deviceNameId[i].type+"</td>"
			      +"</tr>";
    		}
    		
       		$("#downloadlist tbody").html(downstr);
       		$("#downloadlist").DataTable({
		        "oLanguage": {
		        	"sZeroRecords": getLangStr("datatable_infoEmpty"),
		        }
       		});
       		
			$(".paginate_button.previous").text(getLangStr("datatable_previous"));
			$(".paginate_button.next").text(getLangStr("datatable_next"));
			
       		$("#downloadlist_wrapper .seven").remove();
   	       	$("#downloadlist_wrapper .nine").removeClass("nine");
   	       	$("#downloadlist_wrapper .eight.right").removeClass("eight").removeClass("right");
   	       	$("#downloadlist_wrapper .eight").remove();
   	       	$("#downloadlist_wrapper .ui.grid").children(":first").remove();
   	       	$(".row").css({
   	       		marginLeft:"0",
   	       		marginRight:"0"
   	       	});
   	       	//removeLoading();
       	}
		
    	function loadDownloadDeviceData(startTime,endTime){
   		   if(currentIndex>=downDeviceId.length){ 
   	            return;
   	        }
   	       var id = downDeviceId[currentIndex];
		   $.ajax({
    			   type:"post",
    			   dataType:"json",
    			   url:"/admin/environmentdata",
    			   data:{
    				   deviceId:id,
    				   startTime:startTime,
    				   endTime:endTime
    			   },
    			   success:function(data){
						//removeLoading();
						//console.log(data);
    				    currentIndex++;
    				    var deviceName=data.deviceName;
    				    downloadData[deviceName]=data.data;
    				    var dataArr=data.data;
    				    var ep=new ExcelPlus();
    				    var content = [["Time"]];
    				    //var content = [["Time","Temperature(℃)","Humidity(%)","PM2.5(ug/m³)","CO2(ppm)","Light(lux)"]];
	   	    			var i,d; 
	   	    			var newDate = new Date();

	   	    			if(!temperatureFlag&&!humFlag&&!pm25Flag&&!co2Flag&&!sunshineFlag){
	   	    				alertokMsg(getLangStr("devicedata_par"),getLangStr("alert_ok"));
	   	    				removeLoading();
	   	    				return;
	   	    			}
    				    if(temperatureFlag){
    				    	content[0].push("Temperature(℃)");
    				    }
    				    if(humFlag){
    				    	content[0].push("Humidity(%)");
    				    }
    				    if(pm25Flag){
    				    	content[0].push("PM2.5(ug/m³)");
    				    }
    				    if(co2Flag){
    				    	content[0].push("CO2(ppm)");
    				    }
    				    if(sunshineFlag){
    				    	content[0].push("Light(lux)");
    				    }
    				    
    				    
	   	    			for(i = 0; i < dataArr.length; i++){
	   	    				d = dataArr[i];
	   	 	   				newDate.setTime(d.time);
	   	 	   				var time = newDate.Format("MM-dd hh:mm");
	   	 	   				
	   	 	   				var temArr=[time];
		   	 	   			if(temperatureFlag){
	    				    	temArr.push(d.tem);
	    				    }
	    				    if(humFlag){
	    				    	temArr.push(d.hum);
	    				    }
	    				    if(pm25Flag){
	    				    	temArr.push(d.pm);
	    				    }
	    				    if(co2Flag){
	    				    	temArr.push(d.co2);
	    				    }
	    				    if(sunshineFlag){
	    				    	temArr.push(d.lightIntensity);
	    				    }
	   	    				content.push(temArr);
	   	    			}
	   	    			ep.createFile("Book1")
	   	    			  .write({ "content":content })
	   	    			  .saveAs(deviceName+".xlsx");
	   	    			
	   	    		   	
    				   loadDownloadDeviceData(startTime,endTime);
    				   removeLoading();
    			   },
    			   error:function(){
    				   removeLoading();
    			   }
    	    });
		}
    	
    	//复选框选中事件
    	function toggleTest(obj){
    		var _this=obj;
    		if($(_this).parent().hasClass('checked')){
    			$(_this).parent().removeClass("checked");
    		}else{
    			$(_this).parent().addClass("checked");
    		}
    	}
    	
    	// 加载loading框
    	function loadingBoxShow(){
   	   		var loadingBox = '<br/><br/><br/><br/><div class="ui active inline loader"></div><div>'+ getLangStr("teamBuilding_msg_5") +'</div>';
   	   		$("#tempartureChart,#humidityChart,#co2Chart,#pmChart,#beamChart").html("").removeClass("charts_nodata");
   			$("#tempartureChart,#humidityChart,#co2Chart,#pmChart,#beamChart").html(loadingBox).css({"text-align":"center"});
    	}
    	
    	$(function(){
    		
    		//addLoading();

  		   	Highcharts.setOptions({ 
				global: { useUTC: false  } 
			});
    		
  		   	loadingBoxShow();
  		   	
     	   /*判断跳转到下载tab  */
     	   var oFrom=new String(window.location);
     	   oFrom = oFrom.substr(-8,8);
  		   
     	   if(oFrom=="download"){	   			
     		   $("#contentRight .deviceInfoTab").css("display","none");
     		   $("#contentRight .downloadTab").css("display","block");
     		   $("#submenu .item").eq(1).addClass("on");
     		   $("#submenu .item").eq(0).removeClass("on");
     		   $(".deviceNameTit").hide();

     		   setDate();
         	   showDownloadList();
         	   $("title").text(getLangStr("devicedata_download"));
         	   createDownloadList();

         	   
     	   }else{
     		 // bindAbsTimePickerBtn();
     		 // setDate();
         	   updateDeviceShow();
         	  $("title").text(getLangStr("devicedata_compare"));
     	   }
     	   
     	   /*下载数据tab  */
     	   $(".downloadData").click(function(){
     		   $("#contentRight .deviceInfoTab").css("display","none");
     		   $("#contentRight .downloadTab").css("display","block");

     		   $("#submenu .item").eq(1).addClass("on");
     		   $("#submenu .item").eq(0).removeClass("on");
     		   /*下载页面  */
    		   setDate();
        	   showDownloadList();
         	   
     	   });
     	   
			// 右侧导航展开收缩
			$(".l_tab_title .map").css("height","3rem");
			$(".l_tab_title").eq(0).find(".map").css("height","23rem");
			$(".l_tab_title").click(function(){
				$(".l_tab_title .map").css("height","3rem");
				$(this).find(".map").css("height","23rem");
			});
     	   
     	   /*下拉框  */
     	   $('.ui.dropdown').dropdown('hide')
     	   
     	   /*条件tab*/
     	   $('.menu .item').tab();
     	   $(".svg text").remove();
     	   
     	   /*下拉框  */
     	   $('.ui.dropdown').dropdown();
     	   $('#deviceName').bind('contentchanged', function() { 
     		   var deviceName=$(this).html();
     		   for(var name in showData){
     			   if(name==deviceName){
     				   showDataList(showData[name]);
     			   }
     		   }
     		});
     	   
     	   // 这样会调用上面的函数 
     	   $("body").on("click",".ui.dropdown .menu .item",function(){
     		   $('#deviceName').trigger('contentchanged'); 
     	   });
     	
     	   /*刷新按钮刷新数据  */
     	   $("#refreshData").click(function(){
     		   
     		   // 临时数组保存数据
     		  // resetData = [];
     		   
	 		  	/* 是否是工作日 */
			    var $workDay_2;
			    workdayFlag_zz = $("#workday_zz").hasClass("checked");
			    workdayFlag_nn = $("#workday_nn").hasClass("checked");
			    if(!workdayFlag_zz&&!workdayFlag_nn){
			    	alertokMsg(getLangStr("devicedata_settime"),getLangStr("alert_ok"));
			    	return;
			    }
			    if(workdayFlag_zz){
			    	$workDay_2 = 1;
			    }
			    if(workdayFlag_nn){
			    	$workDay_2 = 0;
			    }
			    if(workdayFlag_zz&&workdayFlag_nn){
			    	$workDay_2 = 2;
			    }  		
	
				/*开始和结束的时间戳  */
				var $start_time_2 = String($("#startTime input").val() + " 00:00:00");
				var $end_time_2 = String($("#endTime input").val() + " 23:59:59");
				var $start_time_hour_2 = $("#startTime_hour input").val();
				var $end_time_hour_2 = $("#endTime_hour input").val();
				
				var startTimeStamp2=Date.parse($start_time_2)/1000;
				var endTimeStamp2=Date.parse($end_time_2)/1000;
	
				//addLoading();
				
				if(startTimeStamp2>endTimeStamp2){
					alertokMsg(getLangStr("surveyRep_messg1"),getLangStr("alert_ok"));
					//removeLoading();
					return;
				}else{
					loadingBoxShow();
					
					loadDeviceData(startTimeStamp2,endTimeStamp2,$start_time_hour_2,$end_time_hour_2,$workDay_2);
					var name=$(".namelist span:first-child").html();
					showDataList(showData[name]);						
				}
     	   });
     	   
    	   // 更新达标率图
    	   $("#update_dblchart").click(function(){
    		   
			    dbltCategories = [];
			   // dbltCategories_2 = [];
				dbltfenlei = [];
				Tem_array=[];
				Hum_array=[];
				Pm25_array=[];
				Co2_array=[];
				Sun_array=[];
	   		    
    		   resetData_2 = [];
    		   resetData_2 = resetData;
    		   
    		   for(var i=0;i<resetData_2.length;i++){
        		   extractData_2(resetData_2[i]); 
    		   }
    		   
    		  // dbltCategories_2 = dbltCategories;

    		   // 查看数据加载
     		   if(isEmpty(temperature)){
 		   	  		$("#tempartureChart").html(getLangStr("devicedata_tem") +" "+ getLangStr("surveyRep_empty") );
 		   	  		$("#tempartureChart").addClass("charts_nodata");
 		   	  	}else{
 		   	  		$("#tempartureChart").html("");
 		   	  		$("#tempartureChart").removeClass("charts_nodata");
 		   	  		sjcx_chart("tempartureChart","temperature",temperature);
 		   	  	}
 		   	  	
 				if(isEmpty(humidity)){
 		   	  		$("#humidityChart").html(getLangStr("devicedata_hum") +" "+ getLangStr("surveyRep_empty"));
 		   	  		$("#humidityChart").addClass("charts_nodata");
 		   	  	}else{
 		   	  		$("#humidityChart").html("");
 		   	  		$("#humidityChart").removeClass("charts_nodata");
 		   	  		sjcx_chart("humidityChart","hum",humidity);
 		   	  	}
 					
 				if(isEmpty(co2)){
 		   	  		$("#co2Chart").html(getLangStr("devicedata_co2") +" "+ getLangStr("surveyRep_empty"));
 		   	  		$("#co2Chart").addClass("charts_nodata");
 		   	  	}else{
 		   	  		$("#co2Chart").html("");
 		   	  		$("#co2Chart").removeClass("charts_nodata");
 		   	  		sjcx_chart("co2Chart","co2",co2);
 		   	  	}
 					
 				if(isEmpty(pm25)){
 		   	  		$("#pmChart").html(getLangStr("devicedata_pm25") +" "+ getLangStr("surveyRep_empty"));
 		   	  		$("#pmChart").addClass("charts_nodata");
 		   	  	}else{
 		   	  		$("#pmChart").html("");
 		   	  		$("#pmChart").removeClass("charts_nodata");
 		   	  		sjcx_chart("pmChart","pm25",pm25);
 		   	  	}
 				
 				if(isEmpty(sunshine)){
 		   	  		$("#beamChart").html(getLangStr("devicedata_sun") +" "+ getLangStr("surveyRep_empty"));
 		   	  		$("#beamChart").addClass("charts_nodata");
 		   	  	}else{
 		   	  		$("#beamChart").html("");
 		   	  		$("#beamChart").removeClass("charts_nodata");
 		   	  		sjcx_chart("beamChart","sunshine",sunshine);
 		   	  	}
 				// dblt_chart(dbltCategories_2); 
    		   $("#content").animate({scrollTop:$("#result_charts").offset().top - 65},600);
    		     
    	   });
    	   
    	   /* 检测缺失值 */
    	   function queshizhiCheck(data,queshizhi_value){

    		   var qsz = [];
    		   var queshiTimeArr = [];
    		   var name = data.deviceName;
    		   var datas = data.data;
    		   var len = datas.length;
    		   
    		   que_total = 0;
    		   que_name = name;
    		   
    		   for(var j=1;j<len;j++){
    			   if(parseInt(datas[j].timestemp) - parseInt(datas[j-1].timestemp) >= queshizhi_value){
    				   que_total++;
    			   }
    		   }
    		      
    		   return que_total;
    		   return que_name;
    		   
    	   }
    	   
    	   $("#queshizhi_check").click(function(){
    		   
    		   var queshizhi_data = [];
    		   total = [];

    		   queshizhi_data = resetData; 
    		   
    		   var queshizhi_value = $("#queshizhi_value").val();
    		   queshizhi_value = Number(queshizhi_value * 60 * 1000); // 分钟转换成毫秒计算缺失值
    		   
    		   for(var i=0;i<queshizhi_data.length;i++){
    			   shebeinum = {};
    			   queshizhiCheck(queshizhi_data[i],queshizhi_value);
    			   
    			   shebeinum.num = que_total;
    			   shebeinum.name = que_name;
    			   total.push(shebeinum);
    		   }

    		   // 桌面打印出缺失值
    		   var str1 = "<h4>"+ getLangStr("devicedata_result1") +"</h4>";
    		   var str2 = '';
    		   for(var i=0;i<total.length;i++){
    			   str2 += "<p><span>"+ total[i].name +"</span>"+ getLangStr("devicedata_result2") +"<span>"+ total[i].num +"</span></p>";   			   
    		   }

    		   $("#queshizhi_result").html(str1 + str2); 
    		   
    	   });
    	   
    	   /* 查看数据详情 - 数据对齐 */
    	   $("#data_duiqi").click(function(){
    		   // 折线图索引
   		       indexNum = 0;
   		    
    		   setDeviceName = [];
    		   
    		   resetData_4 = [];
    		   resetData_4 = resetData;
    		   
    		   /* 是否是工作日 */
			    var $workDay_3;
			    workdayFlag_zz = $("#workday_zz").hasClass("checked");
			    workdayFlag_nn = $("#workday_nn").hasClass("checked");
			    if(!workdayFlag_zz&&!workdayFlag_nn){
			    	alertokMsg(getLangStr("devicedata_settime"),getLangStr("alert_ok"));
			    	return;
			    }
			    if(workdayFlag_zz){
			    	$workDay_2 = 1;
			    }
			    if(workdayFlag_nn){
			    	$workDay_2 = 0;
			    }
			    if(workdayFlag_zz&&workdayFlag_nn){
			    	$workDay_2 = 2;
			    }  		
	
				/*开始和结束的时间戳  */
				var $start_time_2 = String($("#startTime input").val() + " 00:00:00");
				var $end_time_2 = String($("#endTime input").val() + " 23:59:59");
				var $start_time_hour_2 = $("#startTime_hour input").val();
				var $end_time_hour_2 = $("#endTime_hour input").val();
				var $duiqi_value = $("#duiqi_value").val();
				
				var startTimeStamp2=Date.parse($start_time_2)/1000;
				var endTimeStamp2=Date.parse($end_time_2)/1000;
	
				if(startTimeStamp2>endTimeStamp2){
					// removeLoading();
					alertokMsg(getLangStr("surveyRep_messg1"),getLangStr("alert_ok"));
					return;
				}

				loadingBoxShow();
				loadDeviceData_duiqi(startTimeStamp2,endTimeStamp2,$start_time_hour_2,$end_time_hour_2,$workDay_2,$duiqi_value);
				//$("#content").animate({scrollTop:$("#result_charts").offset().top - 65},600);
    	   });
    	   
    	   function loadDeviceData_duiqi(startTime,endTime,startTime_hour,endTime_hour,isWorkDay,duiqi_value){
    		    // addLoading();
    		   
	   		    ecount=0;
	   		    showData={};
	   		    deviceName=[];
	   		    deviceNameId={};
	
	   		    temperature_duiqi=[];
	   		    humidity_duiqi=[],
	   		    pm25_duiqi=[],
	   		    co2_duiqi=[],
	   		    sunshine_duiqi=[];
	   		    
    		   	temperature=[];
    		    humidity=[],
    		    pm25=[],
    		    co2=[],
    		    sunshine=[];

	   		    var deviceId=localStorage.getItem("checkedId").split(",");
       	   
		   		 setTimeout(function(){
			   			for(var i=0;i<deviceId.length;i++){
			   		    	(function(index){
		
			        		   $.ajax({
			        			   type:"post",
			        			   dataType:"json",
			        			   //async: false,
			        			   url:"/admin/device/view/environment_data_align",
			        			   data:{
			        				   deviceId:deviceId[i],
			        				   startTime:startTime,
			        				   endTime:endTime,
			        				   startWorkTime:startTime_hour,
			        				   endWorkTime:endTime_hour,
			        				   workDay:isWorkDay,
			        				   step:duiqi_value
			        			   },
			        			   success:function(data){
			        				   //console.log(data)
			        				   	extractData(data); // 折线图
			        				   
			        				   	temperature_duiqi = temperature;
			        		   		    humidity_duiqi = humidity;
			        		   		    pm25_duiqi = pm25;
			        		   		    co2_duiqi = co2;
			        		   		    sunshine_duiqi = sunshine;
			        		   		    
			        		   		    // 折线图加载 
			        		   		    if(isEmpty(temperature_duiqi)){
			        			   	  		$("#tempartureChart").html(getLangStr("devicedata_tem") +" "+ getLangStr("surveyRep_empty") );
			        			   	  		$("#tempartureChart").addClass("charts_nodata");
			        			   	  	}else{
			        			   	  		$("#tempartureChart").html("");
			        			   	  		$("#tempartureChart").removeClass("charts_nodata");
			        			   	  		sjcx_chart("tempartureChart","temperature",temperature_duiqi);
			        			   	  	}
			        			   	  	
			        					if(isEmpty(humidity_duiqi)){
			        			   	  		$("#humidityChart").html(getLangStr("devicedata_hum") +" "+ getLangStr("surveyRep_empty"));
			        			   	  		$("#humidityChart").addClass("charts_nodata");
			        			   	  	}else{
			        			   	  		$("#humidityChart").html("");
			        			   	  		$("#humidityChart").removeClass("charts_nodata");
			        			   	  		sjcx_chart("humidityChart","hum",humidity_duiqi);
			        			   	  	}
			        						
			        					if(isEmpty(co2_duiqi)){
			        			   	  		$("#co2Chart").html(getLangStr("devicedata_co2") +" "+ getLangStr("surveyRep_empty"));
			        			   	  		$("#co2Chart").addClass("charts_nodata");
			        			   	  	}else{
			        			   	  		$("#co2Chart").html("");
			        			   	  		$("#co2Chart").removeClass("charts_nodata");
			        			   	  		sjcx_chart("co2Chart","co2",co2_duiqi);
			        			   	  	}
			        						
			        					if(isEmpty(pm25_duiqi)){
			        			   	  		$("#pmChart").html(getLangStr("devicedata_pm25") +" "+ getLangStr("surveyRep_empty"));
			        			   	  		$("#pmChart").addClass("charts_nodata");
			        			   	  	}else{
			        			   	  		$("#pmChart").html("");
			        			   	  		$("#pmChart").removeClass("charts_nodata");
			        			   	  		sjcx_chart("pmChart","pm25",pm25_duiqi);
			        			   	  	}
			        					
			        					if(isEmpty(sunshine_duiqi)){
			        			   	  		$("#beamChart").html(getLangStr("devicedata_sun") +" "+ getLangStr("surveyRep_empty"));
			        			   	  		$("#beamChart").addClass("charts_nodata");
			        			   	  	}else{
			        			   	  		$("#beamChart").html("");
			        			   	  		$("#beamChart").removeClass("charts_nodata");
			        			   	  		sjcx_chart("beamChart","sunshine",sunshine_duiqi);
			        			   	  	}
			        				   
			        			   },
			        			   error:function(){
			        				   //removeLoading();
			        			   }
			        		   });
			   		    	})(i);
			   		    }
		   			
			   			//removeLoading();
	 		   },10);

    	   }
    	   
    	   	/* 异常值删除 */
    	   $("#delete_yc").click(function(){
    		   
    		   	min_tem_yc = Number($("#min_tem_yc").val());
	   			max_tem_yc = Number($("#max_tem_yc").val());
	   			
	   			min_hum_yc = Number($("#min_hum_yc").val());
	   			max_hum_yc = Number($("#max_hum_yc").val());
	   			
	   			min_pm25_yc = Number($("#min_pm25_yc").val());
	   			max_pm25_yc = Number($("#max_pm25_yc").val());
	   			
	   			min_co2_yc = Number($("#min_co2_yc").val());
	   			max_co2_yc = Number($("#max_co2_yc").val());
	   			
	   			min_sun_yc = Number($("#min_sun_yc").val());
	   			max_sun_yc = Number($("#max_sun_yc").val());
	   			
	   			resetData_5 = [];
	   			resetData_5 = resetData;
	   			
	   			// 建立临时数据 以免覆盖第一次加载的数据
	   		    temperature_yc=[];
	   		    humidity_yc=[];
	   		    pm25_yc=[];
	   		    co2_yc=[];
	   		    sunshine_yc=[];
	   		    
	   		    for(var i=0;i<resetData_5.length;i++){
	   		    	deleteYichang(resetData_5[i]);
	   		    }

	   		    // 折线图加载
	   		    if(isEmpty(temperature_yc)){
		   	  		$("#tempartureChart").html(getLangStr("devicedata_tem") +" "+ getLangStr("surveyRep_empty") );
		   	  		$("#tempartureChart").addClass("charts_nodata");
		   	  	}else{
		   	  		$("#tempartureChart").html("");
		   	  		$("#tempartureChart").removeClass("charts_nodata");
		   	  		sjcx_chart("tempartureChart","temperature",temperature_yc);
		   	  	}
		   	  	
				if(isEmpty(humidity_yc)){
		   	  		$("#humidityChart").html(getLangStr("devicedata_hum") +" "+ getLangStr("surveyRep_empty"));
		   	  		$("#humidityChart").addClass("charts_nodata");
		   	  	}else{
		   	  		$("#humidityChart").html("");
		   	  		$("#humidityChart").removeClass("charts_nodata");
		   	  		sjcx_chart("humidityChart","hum",humidity_yc);
		   	  	}
					
				if(isEmpty(co2_yc)){
		   	  		$("#co2Chart").html(getLangStr("devicedata_co2") +" "+ getLangStr("surveyRep_empty"));
		   	  		$("#co2Chart").addClass("charts_nodata");
		   	  	}else{
		   	  		$("#co2Chart").html("");
		   	  		$("#co2Chart").removeClass("charts_nodata");
		   	  		sjcx_chart("co2Chart","co2",co2_yc);
		   	  	}
					
				if(isEmpty(pm25_yc)){
		   	  		$("#pmChart").html(getLangStr("devicedata_pm25") +" "+ getLangStr("surveyRep_empty"));
		   	  		$("#pmChart").addClass("charts_nodata");
		   	  	}else{
		   	  		$("#pmChart").html("");
		   	  		$("#pmChart").removeClass("charts_nodata");
		   	  		sjcx_chart("pmChart","pm25",pm25_yc);
		   	  	}
				
				if(isEmpty(sunshine_yc)){
		   	  		$("#beamChart").html(getLangStr("devicedata_sun") +" "+ getLangStr("surveyRep_empty"));
		   	  		$("#beamChart").addClass("charts_nodata");
		   	  	}else{
		   	  		$("#beamChart").html("");
		   	  		$("#beamChart").removeClass("charts_nodata");
		   	  		sjcx_chart("beamChart","sunshine",sunshine_yc);
		   	  	}
	   		    
				$("#content").animate({scrollTop:$("#result_charts").offset().top - 65},600);
    	   });
    	   
    	   function deleteYichang(deviceData){

	    		  name=deviceData.deviceName;
	 			  data=deviceData.data;
	 			  
	    		  tempTemperature_yc={};
	    		  tempHumidity_yc={};
	    		  tempPm25_yc={};
	    		  tempCo2_yc={};
	    		  tempSunshine_yc={};
	 			  
	 			  tempTemperatureData_yc=[];
	 			  tempHumidityData_yc=[];
	 			  tempPm25Data_yc=[];
	 			  tempCo2Data_yc=[];
	 			  tempSunshineData_yc=[];
	 	
	 			  var time;
	    		  var timeUTC;
	    		  var newDate = new Date();

	 			  data.sort(function(a,b){
	    				return a.timestemp * 1 - b.timestemp * 1;
	    		  });
	    		
	 			  for(var i=0;i<data.length;i++){

	    				time = data[i].timestemp;
		   				newDate.setTime(time);

	    				// 转换成时间戳UTC，不然highcharts无法正确显示横轴的时间 time = 时间戳
	    				var t = new Date(parseInt(time));
	    				var uy = t.getUTCFullYear();
	    				var um = t.getUTCMonth();
	    				var ud = t.getUTCDate();
	    				var uh = t.getUTCHours();
	    				var umm = t.getUTCMinutes();
	    				var ums = t.getUTCSeconds();
	    				var umss = t.getUTCMilliseconds();
	    				
	    				timeUTC = Date.UTC(uy,um,ud,uh,umm,ums,umss); /*,umm,ums,umss*/
	    				// console.log(timeUTC);
	 				  
	 				  if(data[i].tem < max_tem_yc && data[i].tem > min_tem_yc){
	 					 tempTemperatureData_yc.push([timeUTC,(data[i].tem * 1).toFixed(1) * 1]);
	 				  }
	 				  
	 				  if(data[i].hum < max_hum_yc && data[i].hum > min_hum_yc){
	 					 tempHumidityData_yc.push([timeUTC,(data[i].hum * 1).toFixed(1) * 1]);
	 				  }
	 				  
	 				  if(data[i].pm25 < max_pm25_yc && data[i].pm25 > min_pm25_yc){
	 					 tempPm25Data_yc.push([timeUTC,data[i].pm * 1]);
	 				  }
	 				  
	 				  if(data[i].co2 < max_co2_yc && data[i].co2 > min_co2_yc){
	 					 tempCo2Data_yc.push([timeUTC,data[i].co2 * 1]);
	 				  }
	 				  
	 				  if(data[i].lightIntensity < max_sun_yc && data[i].lightIntensity > min_sun_yc){
	 					 tempSunshineData_yc.push([timeUTC,data[i].lightIntensity * 1]);
	 				  }
 
	 			  }
	 			    
	 			 tempTemperature_yc.name = name;
	 			 tempTemperature_yc.type = 'area';
	 			 tempTemperature_yc.data = tempTemperatureData_yc;
	 			 temperature_yc.push(tempTemperature_yc);
	 			 
	 			 tempHumidity_yc.name = name;
 				 tempHumidity_yc.type = 'area';
	 			 tempHumidity_yc.data = tempHumidityData_yc;
	 			 humidity_yc.push(tempHumidity_yc);
	 			 
	 			 tempPm25_yc.name = name;
	 			 tempPm25_yc.type = 'area';
	 			 tempPm25_yc.data = tempPm25Data_yc;
	 			 pm25_yc.push(tempPm25_yc);
	 			 
	 			 tempCo2_yc.name = name;
	 			 tempCo2_yc.type = 'area';
	 			 tempCo2_yc.data = tempCo2Data_yc;
	 			 co2_yc.push(tempCo2_yc);
	 			 
	 			 tempSunshine_yc.name = name;
	 			 tempSunshine_yc.type = 'area';
 				 tempSunshine_yc.data = tempSunshineData_yc;
	 			 sunshine_yc.push(tempSunshine_yc);
	 
    	   }
    	   
    	   /* 数据偏移 */
    	   $("#pianyi_check").click(function(){
    		   
    		   $("#content").animate({scrollTop:$("#result_charts").offset().top - 65},600);
    		   
    		   tem_py_val = $("#tem_py").val();
    		   hum_py_val = $("#hum_py").val();
    		   sun_py_val = $("#sun_py").val();
    		   co2_py_val = $("#co2_py").val();
    		   pm25_py_val = $("#pm25_py").val();
    		   
    		   	resetData_6 = [];
	   			resetData_6 = resetData;
	   			
	   			// 建立临时数据 以免覆盖第一次加载的数据
	   		    temperature_py=[];
	   		    humidity_py=[];
	   		    pm25_py=[];
	   		    co2_py=[];
	   		    sunshine_py=[];
	   		    
	   		    for(var i=0;i<resetData_6.length;i++){
	   		    	pianyiCheck(resetData_6[i]);
	   		    }
	   		    
	   		    // 折线图加载
	   		    if(isEmpty(temperature_py)){
		   	  		$("#tempartureChart").html(getLangStr("devicedata_tem") +" "+ getLangStr("surveyRep_empty") );
		   	  		$("#tempartureChart").addClass("charts_nodata");
		   	  	}else{
		   	  		$("#tempartureChart").html("");
		   	  		$("#tempartureChart").removeClass("charts_nodata");
		   	  		sjcx_chart("tempartureChart","temperature",temperature_py);
		   	  	}
		   	  	
				if(isEmpty(humidity_py)){
		   	  		$("#humidityChart").html(getLangStr("devicedata_hum") +" "+ getLangStr("surveyRep_empty"));
		   	  		$("#humidityChart").addClass("charts_nodata");
		   	  	}else{
		   	  		$("#humidityChart").html("");
		   	  		$("#humidityChart").removeClass("charts_nodata");
		   	  		sjcx_chart("humidityChart","hum",humidity_py);
		   	  	}
					
				if(isEmpty(co2_py)){
		   	  		$("#co2Chart").html(getLangStr("devicedata_co2") +" "+ getLangStr("surveyRep_empty"));
		   	  		$("#co2Chart").addClass("charts_nodata");
		   	  	}else{
		   	  		$("#co2Chart").html("");
		   	  		$("#co2Chart").removeClass("charts_nodata");
		   	  		sjcx_chart("co2Chart","co2",co2_py);
		   	  	}
					
				if(isEmpty(pm25_py)){
		   	  		$("#pmChart").html(getLangStr("devicedata_pm25") +" "+ getLangStr("surveyRep_empty"));
		   	  		$("#pmChart").addClass("charts_nodata");
		   	  	}else{
		   	  		$("#pmChart").html("");
		   	  		$("#pmChart").removeClass("charts_nodata");
		   	  		sjcx_chart("pmChart","pm25",pm25_py);
		   	  	}
				
				if(isEmpty(sunshine_py)){
		   	  		$("#beamChart").html(getLangStr("devicedata_sun") +" "+ getLangStr("surveyRep_empty"));
		   	  		$("#beamChart").addClass("charts_nodata");
		   	  	}else{
		   	  		$("#beamChart").html("");
		   	  		$("#beamChart").removeClass("charts_nodata");
		   	  		sjcx_chart("beamChart","sunshine",sunshine_py);
		   	  	}
	   		   
				
    	   });
    	   
    	   function pianyiCheck(deviceData){

	    		  name=deviceData.deviceName;
	 			  data=deviceData.data;
	 			  
	    		  tempTemperature_py={};
	    		  tempHumidity_py={};
	    		  tempPm25_py={};
	    		  tempCo2_py={};
	    		  tempSunshine_py={};
	 			  
	 			  tempTemperatureData_py=[];
	 			  tempHumidityData_py=[];
	 			  tempPm25Data_py=[];
	 			  tempCo2Data_py=[];
	 			  tempSunshineData_py=[];
	 	
	 			  var time;
	    		  var timeUTC;
	    		  var newDate = new Date();

	 			  data.sort(function(a,b){
	    				return a.timestemp * 1 - b.timestemp * 1;
	    		  });
	    		
	 			  for(var i=0;i<data.length;i++){

	    				time = data[i].timestemp;
		   				newDate.setTime(time);

	    				// 转换成时间戳UTC，不然highcharts无法正确显示横轴的时间 time = 时间戳
	    				var t = new Date(parseInt(time));
	    				var uy = t.getUTCFullYear();
	    				var um = t.getUTCMonth();
	    				var ud = t.getUTCDate();
	    				var uh = t.getUTCHours();
	    				var umm = t.getUTCMinutes();
	    				var ums = t.getUTCSeconds();
	    				var umss = t.getUTCMilliseconds();
	    				
	    				timeUTC = Date.UTC(uy,um,ud,uh,umm,ums,umss); /*,umm,ums,umss*/
	    				// console.log(timeUTC);
	    				
	 					tempTemperatureData_py.push([timeUTC,Number((data[i].tem * 1).toFixed(1) * 1) + Number(tem_py_val)]);
	 					tempHumidityData_py.push([timeUTC,Number((data[i].hum * 1).toFixed(1) * 1) + Number(hum_py_val)]);
	 					tempPm25Data_py.push([timeUTC,Number((data[i].pm * 1).toFixed(1) * 1) + Number(pm25_py_val)]);
	 					tempCo2Data_py.push([timeUTC,Number((data[i].co2 * 1).toFixed(1) * 1) + Number(co2_py_val)]);
	 					tempSunshineData_py.push([timeUTC,Number((data[i].lightIntensity * 1).toFixed(1) * 1) + Number(sun_py_val)]);
	 			  }
	 			    
	 			 tempTemperature_py.name = name;
	 			 tempTemperature_py.type = 'area';
	 			 tempTemperature_py.data = tempTemperatureData_py;
	 			 temperature_py.push(tempTemperature_py);
	 			 
	 			 tempHumidity_py.name = name;
				 tempHumidity_py.type = 'area';
	 			 tempHumidity_py.data = tempHumidityData_py;
	 			 humidity_py.push(tempHumidity_py);
	 			 
	 			 tempPm25_py.name = name;
	 			 tempPm25_py.type = 'area';
	 			 tempPm25_py.data = tempPm25Data_py;
	 			 pm25_py.push(tempPm25_py);
	 			 
	 			 tempCo2_py.name = name;
	 			 tempCo2_py.type = 'area';
	 			 tempCo2_py.data = tempCo2Data_py;
	 			 co2_py.push(tempCo2_py);
	 			 
	 			 tempSunshine_py.name = name;
	 			 tempSunshine_py.type = 'area';
				 tempSunshine_py.data = tempSunshineData_py;
	 			 sunshine_py.push(tempSunshine_py);
	 
    	   }
    	   
    	   
    	   

     	   /*点击设备列表  */
     	   $(".deviceList").click(function(){
     		   window.location.href="/redirect?url=administrator/deviceList.jsp"
     	   });
     	   
     	   /*设备列表*/
     	   $(".projectList").click(function(){
     		  window.location.href="/redirect?url=administrator/teamDevice.jsp"
     	   });
     	   
     	   /*点击下载数据  */
     	   $("body").on("click",".download",function(){
     		   $("#submenu .item").eq(1).addClass("on");
     		   $("#submenu .item").eq(0).removeClass("on");
     	   });
     	  
     	   /*点击设备名字  */
     	   $("body").on("click",".namelist span",function(){
     		   var deviceId=$(this).attr("data-id");
     		   window.location.href="/redirect?url=administrator/deviceList.jsp?deviceId="+deviceId;
     	   });
     	   
     	  /* 查看详情时下载表格 */
     	   $(".downloadData_this").click(function(){
      			var downDeviceId = []
      			var $checkedID=localStorage.getItem("checkedId");
      			downDeviceId = $checkedID.split(",");
      			// console.log(downDeviceId);
			
				if(downDeviceId.length!=0){

					/*开始和结束的时间戳  */
					var $start_time2 = String($("#startTime input").val() + " 00:00:00");
					var $end_time2 = String($("#endTime input").val() + " 23:59:59");
					var startTimeStamp2=Date.parse($start_time2)/1000;
					var endTimeStamp2=Date.parse($end_time2)/1000;

					var startTime_hour = $("#startTime_hour input").val();
					var endTime_hour = $("#endTime_hour input").val();
					
	    			/* 是否是工作日 */
					var workDay;
					workdayFlag_zz = $("#workday_zz").hasClass("checked");
					workdayFlag_nn = $("#workday_nn").hasClass("checked");
					if(!workdayFlag_zz&&!workdayFlag_nn){
						alertokMsg(getLangStr("devicedata_settime"),getLangStr("alert_ok"));
						return;
					}
					if(workdayFlag_zz){
						workDay = 1;
					}
					if(workdayFlag_nn){
						workDay = 0;
					}
					if(workdayFlag_zz&&workdayFlag_nn){
						workDay = 2;
					} 
	    			if(startTimeStamp2>endTimeStamp2){
	    			//	removeLoading();
	    				alertokMsg(getLangStr("surveyRep_messg1"),getLangStr("alert_ok"));
	    				return;
	    			}
	    			
	    			addLoading();
	    			
	       			sunshineFlag=$("#sun").addClass("checked");
	       			temperatureFlag=$("#tem").addClass("checked");
	       			co2Flag=$("#co2").addClass("checked");
	       			pm25Flag=$("#pm25").addClass("checked");
	       			humFlag=$("#hum").addClass("checked");
	    			
	    			for(var i=0;i<downDeviceId.length;i++){
	    				$.ajax({
	 	     			   type:"post",
	 	     			   dataType:"json",
	 	     			   url:"/admin/device/view/environment",
	 	     			   data:{
								deviceId:downDeviceId[i],
								startTime:startTimeStamp2,
								endTime:endTimeStamp2,
								startWorkTime:startTime_hour,
								endWorkTime:endTime_hour,
								workDay:workDay
	 	     			   },
	 	     			   success:function(data){
	 	     					removeLoading();
	 	     				   	// console.log(data);
	 	     				    currentIndex++;
	 	     				    var deviceName=data.deviceName;
	 	     				    downloadData[deviceName]=data.data;
	 	     				    var dataArr=data.data;
	 	     				    var ep=new ExcelPlus();
	 	     				    var content = [["Time"]];
	 	     				    //var content = [["Time","Temperature(℃)","Humidity(%)","PM2.5(ug/m³)","CO2(ppm)","Light(lux)"]];
	 	 	   	    			var i,d; 
	 	 	   	    			var newDate = new Date();
	 	 	   	    				
	 	 	   	    			if(!temperatureFlag&&!humFlag&&!pm25Flag&&!co2Flag&&!sunshineFlag){
	 	 	   	    				alertokMsg(getLangStr("devicedata_par"),getLangStr("alert_ok"));
	 	 	   	    				return;
	 	 	   	    			}
	 	     				    if(temperatureFlag){
	 	     				    	content[0].push("Temperature(℃)");
	 	     				    }
	 	     				    if(humFlag){
	 	     				    	content[0].push("Humidity(%)");
	 	     				    }
	 	     				    if(pm25Flag){
	 	     				    	content[0].push("PM2.5(ug/m³)");
	 	     				    }
	 	     				    if(co2Flag){
	 	     				    	content[0].push("CO2(ppm)");
	 	     				    }
	 	     				    if(sunshineFlag){
	 	     				    	content[0].push("Light(lux)");
	 	     				    }
	 	     				    
	 	     				    
	 	 	   	    			for(i = 0; i < dataArr.length; i++){
	 	 	   	    				d = dataArr[i];
	 	 	   	 	   				newDate.setTime(d.time);
	 	 	   	 	   				var time = newDate.Format("MM-dd hh:mm");
	 	 	   	 	   				
	 	 	   	 	   				var temArr=[time];
	 	 		   	 	   			if(temperatureFlag){
	 	 	    				    	temArr.push(d.tem);
	 	 	    				    }
	 	 	    				    if(humFlag){
	 	 	    				    	temArr.push(d.hum);
	 	 	    				    }
	 	 	    				    if(pm25Flag){
	 	 	    				    	temArr.push(d.pm);
	 	 	    				    }
	 	 	    				    if(co2Flag){
	 	 	    				    	temArr.push(d.co2);
	 	 	    				    }
	 	 	    				    if(sunshineFlag){
	 	 	    				    	temArr.push(d.lightIntensity);
	 	 	    				    }
	 	 	   	    				content.push(temArr);
	 	 	   	    			}
	 	 	   	    			ep.createFile("Book1")
	 	 	   	    			  .write({ "content":content })
	 	 	   	    			  .saveAs(deviceName+".xlsx");
	 	 	   	    			
	 	 	   	    		   	
	 	     				   loadDownloadDeviceData(startTimeStamp2,endTimeStamp2);
	 	     				
	 	     			   },
	 	     			   error:function(){
	 	     				   removeLoading();
	 	     			   }
	 	    			});
	    			}
				}else{
					removeLoading();
					alertokMsg(getLangStr("deviceList_download_list"),getLangStr("alert_ok"));
				}
     	   });
     	   
     	   // 下载工单
     	   function downloadHistory(){
     		   	$("#download_history a").css("text-decoration","underline")
				$("#download_history a").on("click",function(){
					var $thishref = $(this).attr("href");
					if($thishref == "null"){
						alertokMsg(getLangStr("devicedata_result5"),getLangStr("alert_ok"));
						return false;
					}else{
						$("body").css("overflow","hidden");
						$("#content").css("overflow","auto");
					}
				});
     	   }
     	   
     	  /* 默认加载工单   */
      	  function createDownloadList(){
      		  
      		  $.ajax({
 	   			   type:"post",
 	   			   dataType:"json",
 	   			   //async:false,
 	   			   url:"/admin/device/download/history",
 	   			   success:function(data){

 	  					if(data.code==200){
 	  						
 	  						var $strshow='';
 	  						for(var i=0;i<data.list.length;i++){
 	  							var workOrderStatus='';
 	  							if(data.list[i].status=="finish"){
 	  								workOrderStatus = getLangStr("devicedata_result6");
 	  							}else if(data.list[i].status=="failure"){
 	  								workOrderStatus = getLangStr("devicedata_result8");
 	  							}else{
 	  								workOrderStatus = getLangStr("devicedata_result7");
 	  							}
 	  							
 	  							var nameStr = data.list[i].deviceName;
	 	  						var nameArr = nameStr.split(",");
	 	  						var nameRes = '';
	 	  						
	 	  						for(var k=0;k<nameArr.length;k++){
	 	  							if(k!=0 && k%4 == 0 ){
	 	  								nameRes += "<br />" + nameArr[k] + ",";
	 	  							}else if(k == nameArr.length - 1){
	 	  								nameRes += nameArr[k];
	 	  							}else{
	 	  								nameRes += nameArr[k] + ",";
	 	  							}
	 	  						}
	 	  						var estimateTime = data.list[i].estimateTime;
	 	  						if(estimateTime==-1){
	 	  							// 未开始
	 	  							estimateTime =  getLangStr("devicedata_result9");
	 	  						}else if(estimateTime==0){
	 	  							// 完成
	 	  							estimateTime = getLangStr("devicedata_result6");
	 	  						}else{
	 	  							estimateTime = estimateTime + "min";
	 	  						}
	 	  						
	 	  						
	 	  						$strshow += '<tr><td style="border-right:1px solid #cccccc;">' + data.list[i].workid + '</td>'+
	 	  							'<td style="border-right:1px solid #cccccc;">' + nameRes + '</td>'+
	 	  							'<td style="border-right:1px solid #cccccc;">'+ data.list[i].startTime +'<br />'+ data.list[i].endTime +'</td>'+
	 	  							'<td style="border-right:1px solid #cccccc;">'+ data.list[i].time +'</td>'+
	 	  							
	 	  							'<td style="border-right:1px solid #cccccc;">'+ data.list[i].percent +'%</td>'+
	 	  							'<td style="border-right:1px solid #cccccc;">'+ estimateTime +'</td>'+
	 	  							
	 	  							'<td style="border-right:1px solid #cccccc;">'+ workOrderStatus +'</td>'+
	 	  							'<td><a href="'+ data.list[i].url +'" target="_blank">'+ getLangStr("deviceList_download") +'</a></td></tr>';
	 	  						
	 	  					}
 	  					
 	  						$("#download_history").prepend($strshow);
 	  						
 	  						downloadHistory();

 	  		         	  $("#downloadhistory_box").DataTable({
 	  		           		 searching: false,
 	  		           		 ordering:  false,
 	  		           		 info:false,
 	  		           		 aLengthMenu: [10],
 	  		           		 lengthChange:false
 	  		           	  });
 	  	 				$(".paginate_button.previous").text(getLangStr("datatable_previous"));
 	  	 				$(".paginate_button.next").text(getLangStr("datatable_next"));
 	  		         	  
 		  		       		$("#downloadhistory_box_wrapper .seven").remove();
 		  		   	       	$("#downloadhistory_box_wrapper .nine").removeClass("nine");
 		  		   	       	$("#downloadhistory_box_wrapper .eight.right").removeClass("eight").removeClass("right");
 		  		   	       	$("#downloadhistory_box_wrapper .eight").remove();
 		  		   	       	$("#downloadhistory_box_wrapper .ui.grid").children(":first").remove();
 		  		   	       	$(".row").css({
 		  		   	       		marginLeft:"0",
 		  		   	       		marginRight:"0"
 		  		   	       	});
 	  						
 	  					}
 	   			   }
 	       	  });
      	  }
     	   
     	   /* 下载表格  */
     	   $("#export_data_btn").click(function(){
     		    
     		    /*判断选了几个参数  */
       			sunshineFlag=$("#sun").hasClass("checked");
       			temperatureFlag=$("#tem").hasClass("checked");
       			co2Flag=$("#co2").hasClass("checked");
       			pm25Flag=$("#pm25").hasClass("checked");
       			humFlag=$("#hum").hasClass("checked");
       			
 				/*统计选择的设备id  */
 				downDeviceId=[];
 				var checkboxList=$("#downloadlist .ui.checkbox");
 				for(var i=0;i<checkboxList.length;i++){
 					if($(checkboxList[i]).hasClass("checked")){
 						downDeviceId.push($(checkboxList[i]).parent().parent().attr("data-id"));
 					}
 				}
 				downDeviceIds = downDeviceId.join(",");
 				// console.log(downDeviceIds);

 				if(downDeviceId.length!=0){
 					
 					/*开始和结束的时间戳  */
 					var $start_time = String($("#startTime_d input").val() + " 00:00:00");
 					var $end_time = String($("#endTime_d input").val() + " 23:59:59");
 	    			var startTimeStamp1=Date.parse($start_time)/1000;
 	    			var endTimeStamp1=Date.parse($end_time)/1000;

 	    			if(startTimeStamp1>endTimeStamp1){
 	    				removeLoading();
 	    				alertokMsg(getLangStr("surveyRep_messg1"),getLangStr("alert_ok"));
 	    				return;
 	    			}
 	    			
   	    			if(!temperatureFlag&&!humFlag&&!pm25Flag&&!co2Flag&&!sunshineFlag){
   	    				alertokMsg(getLangStr("devicedata_par"),getLangStr("alert_ok"));
   	    				return;
   	    			} 	    			
 	    			
   	    			if(!temperatureFlag){
  				    	$("#tem_s").val("0");
  				    }
  				    if(!humFlag){
  				    	$("#hum_s").val("0");
  				    }
  				    if(!pm25Flag){
  				    	$("#pm25_s").val("0");
  				    }
  				    if(!co2Flag){
  				    	$("#co2_s").val("0");
  				    }
  				    if(!sunshineFlag){
  				    	$("#sun_s").val("0");
  				    }
 	    			
  				    /* 是否是工作日 */
  				    var $workDay;
  				    workdayFlag_y = $("#workday_y").hasClass("checked");
  				    workdayFlag_n = $("#workday_n").hasClass("checked");
  				    
  				    if(!workdayFlag_y&&!workdayFlag_n){
  				    	alertokMsg(getLangStr("devicedata_settime"),getLangStr("alert_ok"));
  				    	return;
  				    }
  				    
  				    if(workdayFlag_y){
  				    	$workDay = 1;
  				    }
  				    if(workdayFlag_n){
  				    	$workDay = 0;
  				    }
  				    if(workdayFlag_y&&workdayFlag_n){
  				    	$workDay = 2;
  				    }  				    
  				    
 	    			var $s_val = $("#sun_s").val();
 	    			var $t_val = $("#tem_s").val();
					var $p_val = $("#pm25_s").val();
					var $h_val = $("#hum_s").val();
					var $c_val = $("#co2_s").val(); 
					var $startTime_hour_d = $("#startTime_hour_d input").val();
					var $endTime_hour_d = $("#endTime_hour_d input").val();
					var $step = $("#step").val(); 
					
 	    			addLoading();
 	    			$.ajax({
 	    	 			   type:"post",
 	    	 			   dataType:"json",
 	    	 			   url:"/admin/device/download/create_work_order",
 	    	 			   data:{
 	    	 				   deviceids:downDeviceIds,
 	    	 				   startTime:startTimeStamp1,
 	    	 				   endTime:endTimeStamp1,
 	    	 				   d1:$s_val,
 	    	 				   d2:$h_val,
 	    	 				   d3:$p_val,
 	    	 				   d4:$c_val,
 	    	 				   d5:$t_val,
 	    	 				   workDay:$workDay,
 	    	 				   startWorkTime:$startTime_hour_d,
 	    	 				   endWorkTime:$endTime_hour_d,
 	    	 				   step:$step
 	    	 			   },
 	    	 			   success:function(data){
 	    	 				 
								 removeLoading();
 	    						// 清华接口 系统繁忙
 	    						if(data.code==1005){
									alertokMsg(getLangStr("check_err_01"),getLangStr("alert_ok"));
								}else if(data.code==1001){
									alertokMsg(getLangStr("check_err_02"),getLangStr("alert_ok"));
								}else if(data.code == 200){
									alertokMsg(getLangStr("check_download_s"),getLangStr("alert_ok"));
								}
 	    						
 	    						if(data.code==200){
									// var workOrderStatus='';
 	    							// if(data.workOrder.status=="finish"){
 	    							// 	workOrderStatus = getLangStr("devicedata_result6");
 	 	  							// }else if(data.workOrder.status=="failure"){
 	 	  							// 	workOrderStatus = getLangStr("devicedata_result8");
 	 	  							// }else{
 	    							// 	workOrderStatus = getLangStr("devicedata_result7");
 	    							// }
 	    							
 	    							// var nameStr = data.workOrder.deviceName;
 	    	  						// var nameArr = nameStr.split(",");
 	    	  						// var nameRes = '';
 	    	  						
 	    	  						// for(var k=0;k<nameArr.length;k++){
 	    	  						// 	if(k!=0 && k%4 == 0 ){
 	    	  						// 		nameRes += "<br />" + nameArr[k] + ",";
 	    	  						// 	}else if(k == nameArr.length - 1){
 	    	  						// 		nameRes += nameArr[k];
 	    	  						// 	}else{
 	    	  						// 		nameRes += nameArr[k] + ",";
 	    	  						// 	}
 	    	  						// }
 	    							
 		 	  						// var estimateTime = data.list[i].estimateTime;
 		 	  						// if(estimateTime==-1){
 		 	  						// 	// 未开始
 		 	  						// 	estimateTime =  getLangStr("devicedata_result9");
 		 	  						// }else if(estimateTime==0){
 		 	  						// 	// 完成
 		 	  						// 	estimateTime = getLangStr("devicedata_result6");
 		 	  						// }else{
 		 	  						// 	estimateTime = estimateTime + "min";
 		 	  						// }
 		 	  						
 		 	  						// $strshow += '<tr><td style="border-right:1px solid #cccccc;">' + data.list[i].workid + '</td>'+
 		 	  						// 	'<td style="border-right:1px solid #cccccc;">' + nameRes + '</td>'+
 		 	  						// 	'<td style="border-right:1px solid #cccccc;">'+ data.list[i].startTime +'<br />'+ data.list[i].endTime +'</td>'+
 		 	  						// 	'<td style="border-right:1px solid #cccccc;">'+ data.list[i].time +'</td>'+
 		 	  							
 		 	  						// 	'<td style="border-right:1px solid #cccccc;">'+ data.list[i].percent +'%</td>'+
 		 	  						// 	'<td style="border-right:1px solid #cccccc;">'+ estimateTime +'</td>'+
 		 	  							
 		 	  						// 	'<td style="border-right:1px solid #cccccc;">'+ workOrderStatus +'</td>'+
 		 	  						// 	'<td><a href="'+ data.list[i].url +'" target="_blank">'+ getLangStr("deviceList_download") +'</a></td></tr>';
 		 	  						
 	    							// $("#download_history").prepend($str);
 	    							// downloadHistory();
 	    						}
 	    	 				     	 
 	    	 			   },
 	    	 			   error:function(){
 	    	 				   removeLoading();
 	    	 				 alertokMsg(getLangStr("check_err_02"),getLangStr("alert_ok"));
 	    	 			   }
 	    	 	    });
 	    			
 				}else{
 					removeLoading();
 					alertokMsg(getLangStr("deviceList_download_list"),getLangStr("alert_ok"));
 				}
 				
 			});  
        });   
  
    	getComponent("/common/admin/leftpanel",
	  		function(result){
	  			$(".fl.mainleft").html(result);
	  			/*左侧导航的选中效果*/
	  			$( ".leftmenu").click(function(){
	  			    $(this).addClass("active").siblings(".leftmenu").removeClass("active");
	  			});
	  			/*添加active效果*/
	  			$( ".leftmenu").each(function(){
	  				$(this).removeClass("active");
	  			});
	  			$(".leftmenu.devicepage").addClass("active");
	  			
	  	});
    	

    	