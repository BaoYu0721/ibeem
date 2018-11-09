var temperature=[];
humidity=[],
pm25=[],
co2=[],
sunshine=[];
var ecount=0;
var timeArr=[];
var showData={};
var deviceName=[];
var colors=['#8085e8','#7cb5ec', '#90ed7d', '#434348', '#f7a35c', '#8085e9', 
            '#f15c80', '#e4d354',  '#8d4653', '#91e8e1']
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
    
   
    function setStockChart(obj,tit,data){
    	var yAxisTitle="";
		if(tit == "temperature"){
	    	yAxisTitle = "Temperature（<sub>o</sub>C）"
	    }else if(tit == "hum"){
	    	yAxisTitle = "Humidity(%)"
	    }else if(tit == "pm25" ){
	    	yAxisTitle = "PM2.5(ug/m<sup>3</sup>)"
	    }else if(tit == "co2"){
	    	yAxisTitle = "CO2(ppm)"
	    }else if(tit == "sunshine"){
	    	yAxisTitle = "Light(lux)"
	    }
	var chart = new Highcharts.StockChart({  
        chart: {  
            renderTo: obj ,//指向的div的id属性  
        },
        rangeSelector: {  
        	enabled:false,
            selected: 1,//表示以上定义button的index,从0开始  
        },  
        exporting: {    
            enabled: false //是否能导出趋势图图片  
        }, 
        credits:{
        	enabled:false
        },
        title : {  
                text : ''//图表标题  
        },
        scrollbar:{
        	enabled:false,
        },
        legend:{
        	enabled: true
        },
        xAxis: {
            labels: {
              formatter: function() {
            	  return this.value.Format("yyyy-MM-dd hh:mm")
              }
            }
          },
        yAxis:{
        	title:{
        		text:yAxisTitle
        	},
        	opposite: false
        },    
        tooltip: {  
            xDateFormat: '%Y-%m-%d, %A'//鼠标移动到趋势线上时显示的日期格式  
        },  
        series: data
    }); 
	
	
}
   /*时间格式转换  */
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
   /*根据时间筛选数据  */
   function updateDeviceShow(){
	   var time={};
		/* $("#device-data-chart").height(Math.round($("#device-data-chart").width()*0.10)+200); */
		
		var startTime = new Date();
		var endTime = new Date();
		startTimeStamp = $("#startTime").datetimepicker("getDate").getTime();
		endTimeStamp = $("#endTime").datetimepicker("getDate").getTime();
		
		/*开始和结束的时间戳  */
		startTimeStamp1=Date.parse($("#startTime input").val())/1000;
		endTimeStamp1=Date.parse($("#endTime input").val())/1000;
		
		if(startTimeStamp>endTimeStamp){
			alertokMsg("结束时间不能早于开始时间","确定");
			return;
		}
		startTime.setTime(startTimeStamp-5*60*60*1000-24*60*60*1000);
		
		endTime.setTime(endTimeStamp-24*60*60*1000);
		$("#startTime input").val(startTime.Format("yyyy-MM-dd hh:mm"));
		$("#endTime input").val(endTime.Format("yyyy-MM-dd hh:mm"));
		startTime.setTime(endTimeStamp - 1000* 60 * 60 * 24 * 30 + 5000); //最多只能查询过去一个月的数据
		$('.form_datetime').datetimepicker({
	        language:  'en',
	        format: 'yyyy-mm-dd hh:ii',
	        todayBtn:  1,
			autoclose: true,
			todayHighlight: 1,
			minuteStep: 5,
			startDate:startTime.Format("yyyy-MM-dd hh:mm")
	    });	
		
		Highcharts.setOptions({ 
		    global: { useUTC: false  } 
		});
		
		
		loadDeviceData(startTimeStamp1,endTimeStamp1);
		
		
	}
   
   function bindAbsTimePickerBtn(){
		/* $("#abs-time-btn").click(function(){ */
			startTimeStamp = Date.parse($("#startTime input").val());
			endTimeStamp = Date.parse($("#endTime input").val());
			
			var tempDate = new Date();
			tempDate.setTime(startTimeStamp);
			//alert(tempDate.Format("yyyy-MM-dd hh:mm:ss"));
			tempDate.setTime(endTimeStamp);
			//alert(tempDate.Format("yyyy-MM-dd hh:mm:ss"));
			if(endTimeStamp <= startTimeStamp){
				alert("Start time should be latter than end time!");
				return;
			}
			
		/* }); */
	}
  
   /*整理数据  */
   function extractData(deviceData){
	  var tempTemperature={},tempHumidity={},tempPm25={},tempCo2={},tempSunshine={};
	  var tempTemperatureData=[],tempHumidityData=[],tempPm25Data=[],tempCo2Data=[],tempSunshineData=[];
	  var name=deviceData.deviceName;
	  
	  var  data=deviceData.data;
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
		var newDate = new Date();
		//为了表格数据显示，逆序排列
		 data=data.sort(function(a,b){
			return b.time * 1 - a.time * 1;
		});
		 console.log(data);
		for(i = 0; i < len; i=i++){
			newDate.setTime(data[i].time);
			data[i].time = newDate.Format("yyyy-MM-dd hh:mm");
		}
		console.log(data);
		for(i = 0; i < len; i=i+5){
			var temparr=[];
			datum = data[i];
			time = datum.time;
			timeArr.push(time);
			datum.d1 = (datum.tem * 1).toFixed(1);
			tempTemperatureData.push([time,datum.d1 * 1]);
			
			datum.d2 = (datum.hum * 1).toFixed(1);
			tempHumidityData.push([time,datum.d2 * 1]); 
			
			datum.d3 = datum.pm;
			tempPm25Data.push([time,datum.d3*1]);
			
			datum.d4 =datum.co2;
			tempCo2Data.push([time,datum.d4*1]);
			
			datum.d5 = datum.lightIntensity
			tempSunshineData.push([time,datum.d5 * 1]);
		}
		
		
	    tempTemperature.name=name;
	    tempTemperature.data=tempTemperatureData;
	    tempTemperature.dataGrouping=dataGrouping;
	    temperature.push(tempTemperature);
	    
	    tempHumidity.name=name;
	    tempHumidity.data=tempHumidityData;
	    tempHumidity.dataGrouping=dataGrouping;
	    humidity.push(tempHumidity);
	    
	    tempPm25.name=name;
	    tempPm25.data=tempPm25Data;
	    tempPm25.dataGrouping=dataGrouping;
	    pm25.push(tempPm25);
	    
	    tempCo2.name=name;
	    tempCo2.data=tempCo2Data;
	    tempCo2.dataGrouping=dataGrouping;
	    co2.push(tempCo2);
	    
	    tempSunshine.name=name;
	    tempSunshine.data=tempSunshineData;
	    tempSunshine.dataGrouping=dataGrouping;
	    sunshine.push(tempSunshine);
	}
   
   /*图表  */
   var data="";
   function loadDeviceData(startTime,endTime){
	   ecount=0;
	    temperature=[];
	    humidity=[],
	    pm25=[],
	    co2=[],
	    sunshine=[];
	    timeArr=[];
	    showData={};
	    deviceName=[];
	   /*获取设备数据  */
	   var deviceId=["6730","6776"];
	   $(".middleContent .toprow .deviceName div").html("");
	   $(".dropdown .menu").html("");
	   for(var i=0;i<deviceId.length;i++){
		   (function(index){
    		   $.ajax({
    			   type:"post",
    			   dataType:"json",
    			   async: false,
    			   url:"/device/environmentdata",
    			   data:{
    				   deviceId:deviceId[i],
    				   startTime:startTime,
    				   endTime:endTime
    			   },
    			   success:function(data){
    				   removeLoading();
    				   console.log(data);
    					   /*整理数据  */
        				   extractData(data)
        				   
        				   /*表格显示数据  */
        				   var time=[];
        				   for(var i=0;i<timeArr.length;i++){
        					   if(i%2==0){
        						   time.push(timeArr[i]);
        					   }
        				   }
        				   var deviceName="device"+index;
        				   showData[data.deviceName]=data.data;
        				 
    				   var nameStr='<div class="item" >'+data.deviceName+'</div>';
    				   var deviceNameStr='<span class="fl selected" data-id="'+data.deviceId+'">'+data.deviceName+'</span>';
					   $(".dropdown .menu").append(nameStr);
					   $(".middleContent .toprow .deviceName div").append(deviceNameStr);
    				   if(index==1){
    					   showDataList(data.data);
    					   $(".dropdown  .current").html(data.deviceName);
    				   }
    			   },
    			   error:function(){}
    		   });
    		   
		   })(i);
	   }
	  
	    setStockChart("tempartureChart","temparture",temperature);
		setStockChart("humidityChart","hum",humidity);
	    setStockChart("beamChart","sunshine",sunshine);
	    setStockChart("co2Chart","co2",co2);
	    setStockChart("pmChart","pm25",pm25);
	   
	   
   }
   function tableFrame(){
	   var  tableStr='<table class="ui compact celled definition table"  id="deviceData">'+
			  '<thead class="full-width">'+
	    '<tr>'+
	      '<th>日期'+
		        '<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
	      '</th>'+
	      '<th>温度（℃）'+
	      		'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
	      '</th>'+
	      '<th>湿度（％）'+
	      		'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		  '</th>'+
	      '<th>光照（lux）'+
	      		'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		  '</th>'+
	      '<th>CO2（ppm）'+
	      		'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		  '</th>'+
	      '<th>PM2.5（ug/m³）'+
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
   var count=0;
   function showDataList(data){
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
	   
   $(function(){
	   /*下拉框  */
   $('.ui.dropdown').dropdown('hide')
   
     /*条件tab  */
   $('.menu .item').tab();

   updateDeviceShow();
   bindAbsTimePickerBtn();
   updateDeviceShow();
   //loadDeviceData();
   $(".svg text").remove();
   
   /*下拉框  */
   $('.ui.dropdown').dropdown();
   $('#deviceName').bind('contentchanged', function() { 
	// do something after the div content has changed 
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
  
   /*店家刷新按钮刷新数据  */
   $(".refreshData").click(function(){
	   updateDeviceShow();
	   var name=$(".namelist span:first-child").html();
	   showDataList(showData[name]);
   });
   
   /*点击设备列表  */
   $(".deviceList").click(function(){
	   window.location.href="/redirect?url=manage/deviceList.jsp"
   });
   
   /*点击设备名字  */
   $("body").on("click",".namelist span",function(){
	   var deviceId=$(this).attr("data-id");
	   window.location.href="/redirect?url=manage/deviceList.jsp?deviceId="+deviceId;
	   });
   });