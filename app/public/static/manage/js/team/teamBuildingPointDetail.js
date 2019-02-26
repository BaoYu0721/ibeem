point_detail = JSON.parse($.cookie("point_data_detail"));
console.log(point_detail);

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

//时间选择框验证
var reg_time = /^\d{4}-\d{2}-\d{2}$/;

surveyList = [];

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

	var startTimeMonth = new Date();
	var endTimeMonth = new Date();
	startTimeStampMonth = startTimeMonth.getTime() - 30 * 24 * 60 * 60 * 1000; //2017-06-14 17:08:57
	endTimeStampMonth = endTimeMonth.getTime();

	var newDate_s = new Date();
	var newDate_e = new Date();
	newDate_s.setTime(startTimeStampMonth);
	newDate_e.setTime(endTimeStampMonth);
	
	time_s = newDate_s.Format("yyyy-MM-dd hh:mm:ss");
	time_e = newDate_e.Format("yyyy-MM-dd hh:mm:ss");
	pseID = point_detail.surveyID;
	pid = point_detail.id;
	devID = point_detail.deviceID;
	time_s_add = newDate_s.Format("yyyy-MM-dd");
	time_e_add = newDate_e.Format("yyyy-MM-dd");
	avaimage = point_detail.image;
	positionDesc = point_detail.positionDesc;
	pname = point_detail.name;
	dname = point_detail.deviceName;
	stitle = point_detail.surveyTitle;
	
/*	console.log("—————— 问卷统计开始时间："+time_s_add);
	console.log("—————— 问卷统计结束时间："+time_e_add);
	console.log(pseID);
	console.log(pid);
	console.log(devID);
	console.log(avaimage);
	console.log(positionDesc);
	console.log(pname);*/

	$(".ui.form .name input").val(pname);
	$(".ui.form .position input").val(positionDesc);
	$(".portraitStyle").attr("src",avaimage);
	
	if(point_detail.startTime == -1){
		point_detail.startTime = "";
	}
	if(point_detail.endTime == -1){
		point_detail.endTime = "";
	}
	
	$("#start_t").val(point_detail.startTime);
	$("#end_t").val(point_detail.endTime);
	
	
	
$(function(){
	
	//addLoading();
	
	$('.form_datetime').datetimepicker({
		lang:'ch',
		timepicker:false,
		todayButton:false,
		format:'Y-m-d',
		formatDate:'Y-m-d',
		//minDate:'-1970/01/02',
		//maxDate:'+1970/01/02' 
    });
	
	// 时间选择变化 清空关联设备
/*	$("#start_t,#end_t").change(function(){
		$("#glsb").html("&nbsp;&nbsp;:&nbsp;&nbsp;");
	})*/
	
	// 测点信息
	$("#cdName").text(point_detail.name);
	$("#cdImage").attr("src",point_detail.image);
	$("#cdDesc").text(point_detail.positionDesc);

	
	if(point_detail.startTime == -1){
		point_detail.startTime = "";
	}

	if(point_detail.endTime == -1){
		point_detail.endTime = "";
	}
	
	$("#cdStartTime").text(point_detail.startTime);
	$("#cdEndTime").text(point_detail.endTime);
	
	// 设备关联  ：A92001（不在线） 设备ID point_detail.deviceID
	var d_status;
	var d_name = point_detail.deviceName;
	var s_title = point_detail.surveyTitle; // 问卷名
	
	$("#glsb").html("&nbsp;&nbsp;:&nbsp;&nbsp;"+d_name);
	$("#glwj").html("&nbsp;&nbsp;:&nbsp;&nbsp;"+s_title);
	
	if(point_detail.deviceStatus==true){
		d_status = getLangStr("teamBuilding_msg_1");
	}else{
		d_status = getLangStr("teamBuilding_msg_2");
	}

	if(point_detail.deviceId == -1 || point_detail.deviceId == '' || point_detail.deviceId == undefined){
		d_name = "<span class='button_add'>"+ getLangStr("teamBuilding_msg_3") +"</span>";
		d_status = "";
	}

	if(point_detail.surveyID == -1 || point_detail.surveyID == '' || point_detail.surveyID == undefined){
		s_title = "<span class='button_add'>"+ getLangStr("teamBuilding_msg_4") +"</span>";
	}
	$("#cdLink").html(d_name + d_status);
	$("#cdSurveyTitle").html(s_title);
	
	
	var startTime = new Date();
	var endTime = new Date();

	startTimeStamp = startTime.getTime() - 24 * 60 * 60 * 1000;
	endTimeStamp = endTime.getTime();
	
	startTimeStamp = Math.floor(startTimeStamp/1000);
	endTimeStamp = Math.floor(endTimeStamp/1000);
	
	if(point_detail.deviceID == -1){
		$("#tempartureChart").html(getLangStr("devicedata_tem") +" "+ getLangStr("surveyRep_empty"));
		$("#tempartureChart").addClass("charts_nodata");
		$("#humidityChart").html(getLangStr("devicedata_hum") +" "+ getLangStr("surveyRep_empty"));
		$("#humidityChart").addClass("charts_nodata");
		$("#co2Chart").html(getLangStr("devicedata_co2") +" "+ getLangStr("surveyRep_empty"));
		$("#co2Chart").addClass("charts_nodata");
		$("#pmChart").html(getLangStr("devicedata_pm25") +" "+ getLangStr("surveyRep_empty"));
		$("#pmChart").addClass("charts_nodata");
		$("#beamChart").html(getLangStr("devicedata_sun") +" "+ getLangStr("surveyRep_empty"));
		$("#beamChart").addClass("charts_nodata");
	}else{
		var loadingBox = '<br/><br/><br/><br/><div class="ui active inline loader"></div><div>'+ getLangStr("teamBuilding_msg_5") +'</div>';
		$("#tempartureChart,#humidityChart,#co2Chart,#pmChart,#beamChart").html(loadingBox).css({"text-align":"center"});

		$.ajax({
			   type:"post",
			   dataType:"json",
			   //async: false,
			   url:"/project/single/building/point_device_detail",
			   data:{
				   deviceId:point_detail.deviceId,
				   startTime:startTimeStamp,
				   endTime:endTimeStamp,
			   },
			   success:function(data){
				   console.log(data);
				   
				   //removeLoading();
				   extractData(data);
				   console.log(temperature);			   
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
				   
			   },
			   error:function(msg){
				   //console.log(msg.status)
			   }
			});
	}
	
	
		/*整理折线图数据  */
	   function extractData(deviceData){

		   	temperature=[];
		    humidity=[],
		    pm25=[],
		    co2=[],
		    sunshine=[];
		   
		    var tempTemperature={},tempHumidity={},tempPm25={},tempCo2={},tempSunshine={};
		    var tempTemperatureData=[],tempHumidityData=[],tempPm25Data=[],tempCo2Data=[],tempSunshineData=[];
		    var name=deviceData.deviceName;
		
			var data=deviceData.data;
			if(data == undefined) return;
		    console.log(deviceData)
		    
			data.sort(function(a,b){
				return a.time * 1 - b.time * 1;
			});
		    
			var i, len= data.length;
			var datum;
			var time;
			var timeStemp;
			var timeUTC;
			var timeArr=[];
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
				
				timeUTC = Date.UTC(uy,um,ud,uh,umm,ums,umss);
				//console.log(timeUTC);

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

			// console.log(timeArr)

		    tempTemperature.name=name;
		    tempTemperature.data=tempTemperatureData;
		    tempTemperature.type='area';
		    temperature.push(tempTemperature);
		    
		    tempHumidity.name=name;
		    tempHumidity.data=tempHumidityData;
		    tempHumidity.type='area';
		    humidity.push(tempHumidity);
		    
		    tempPm25.name=name;
		    tempPm25.data=tempPm25Data;
		    tempPm25.type='area';
		    pm25.push(tempPm25);

		    tempCo2.name=name;
		    tempCo2.data=tempCo2Data;
		    tempCo2.type='area';
		    co2.push(tempCo2);
		    
		    tempSunshine.name=name;
		    tempSunshine.data=tempSunshineData;
		    tempSunshine.type='area';
		    sunshine.push(tempSunshine);
		    

		}	
	   
	   // 数据查询折线图
	   function sjcx_chart(chartsID,tit,data){

		   	var yAxisTitle="";
		   	var sjcxChartTitle = "";
		   	
	    	if(tit == "temperature"){
	        	yAxisTitle = "Temperature(℃)";
	        	sjcxChartTitle = getLangStr("devicedata_tem") + "(℃)";
	        }else if(tit == "hum"){
	        	yAxisTitle = "Humidity(%)";
	        	sjcxChartTitle = getLangStr("devicedata_hum") + "(%)";
	        }else if(tit == "sunshine"){
	        	yAxisTitle = "Light(lux)";
	        	sjcxChartTitle = getLangStr("devicedata_co2") + "(lux)";
	        }else if(tit == "co2"){
	        	yAxisTitle = "CO2(ppm)";
	        	sjcxChartTitle = getLangStr("devicedata_pm25") + "(ppm)";
	        }else if(tit == "pm25" ){
	        	yAxisTitle = "PM2.5(ug/m<sup>3</sup>)";
	        	sjcxChartTitle = getLangStr("devicedata_sun") + "(ug/m<sup>3</sup>)";
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
			    },
			    yAxis: {
			        title: {
			            //text:yAxisTitle  
			            text:null  
			        },
			    },
	            legend: {
	                enabled: true,
	                labelFormat: '{name}'
	            },
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

	
	//点击添加按钮
	$("body").on("click",".button_add",function(){
		 //先清空添加页的数据
		 //$(".addteam input").val("");
		 //$(".addteam textarea").val("");
		 //$(".portraitStyle").attr("src","");
		 $(".addlogo").children("span").css("display","block");
		 $(".addlogo").children(".addicon").css("display","block");
		 $(".error h4").html("");
		 $('.basic.test.modal.addpoint-modal')
		  .modal('setting', 'closable', false)
		  .modal('show');
		 
	});
	
	$("#submit").click(function(){
		
		var start_time = $("#start_t").val();
		var end_time = $("#end_t").val();
	
		if(start_time!=''){
			if(end_time == ''){
				alertokMsg("开始时间或结束时间不能为空","确定");
				return;
			}
		}
		
		if(end_time != ''){
			if(start_time==''){
				alertokMsg("开始时间或结束时间不能为空","确定");
				return;				
			}
		}
		
/*		if(!reg_time.test(start_time)){
			alertokMsg("开始时间格式不正确","确定");
			return;
		}
		if(!reg_time.test(end_time)){
			alertokMsg("结束时间格式不正确","确定");
			return;
		}*/
		
		//判断时间是否符合规定（开始时间大于结束时间）
		var startTime_cd = new Date(start_time);
		var endTime_cd = new Date(end_time);
		var startTimeStamp = startTime_cd.getTime();
		var endTimeStamp = endTime_cd.getTime();
		startTime_cd = startTime_cd.Format("yyyy-MM-dd");
		endTime_cd = endTime_cd.Format("yyyy-MM-dd");
		
/*		if(startTimeStamp > endTimeStamp){
			alertokMsg("结束时间不能早于开始时间","确定");
			return;
		}*/
		
		if(startTimeStamp>1000 || endTimeStamp>1000){ // 判断日历中是否选择过日期
			if(startTimeStamp > endTimeStamp){
				alertokMsg(getLangStr("surveyRep_messg1"),getLangStr("alert_ok"));
				return;
			}
		}else{
			startTime_cd = -1;
			endTime_cd = -1;
		}
		
		var selectedDevice;
		var selectedSurvey;
		var selectedSurveyTitle;
		var selectedDeviceName;
		
		selectedSurvey = pseID;
		selectedDevice = devID;
		selectedSurveyTitle = stitle;
		selectedDeviceName = dname;
		
		//获取关联设备id		
		if($(".addPointListBox .ui.checkbox.checked").length>0){
			selectedDevice = $(".addPointListBox .ui.checkbox.checked").parent().data("id");
			selectedDeviceName = $(".addPointListBox .ui.checkbox.checked").parent().data("dname");

		}else{
			selectedDevice = devID;
			selectedDeviceName = dname;
		}

		//获取关联问卷id
		if($(".addSurveyListBox .ui.checkbox.checked").length>0){
			selectedSurvey = 	$(".addSurveyListBox .ui.checkbox.checked").parent().data("id");
			selectedSurveyTitle = $(".addSurveyListBox .ui.checkbox.checked").parent().data("stitle");

		}else{
			selectedSurvey = pseID;
			selectedSurveyTitle = stitle;

		}
		//校验
		var pointName = $(".ui.form .name input").val();
		if($.trim(pointName)==""){
			$(".error h4").html(getLangStr("add_point_messg2"));
			return false;	
		}
		var pointPosition = $(".ui.form .position input").val();
		if($.trim(pointPosition)==""){
			$(".error h4").html(getLangStr("add_point_messg3"));
			return false;
		}
		var pointImg = $(".portraitStyle").attr("src");
		if($.trim(pointImg)==""){
			$(".error h4").html(getLangStr("add_point_messg4"));
			return false;
		}
		
		
		//发送
		var url = "/project/single/building/point_update";
		//var json = {"buildingPointID":pid,"surveyID":selectedSurvey,"deviceID":selectedDevice,"name":pointName,"positionDesc":positionDesc,"image":avaimage,"startTime":start_time_add,"endTime":end_time_add};
		var json = {"buildingPointID":pid,"surveyID":selectedSurvey,"deviceID":selectedDevice,"name":pointName,"positionDesc":pointPosition,"image":pointImg,"startTime":startTime_cd,"endTime":endTime_cd};

/*		console.log(json);
		return;*/
		
		function successFunc(data){
			
			$.ajax({
				url:"/project/single/building/point_info",
				type:"POST",
				data:{"buildingID":buildingID},
				success:function(data){
					console.log(data);
					point_detail.deviceID = selectedDevice;
					point_detail.surveyID = selectedSurvey;
					point_detail.startTime = startTime_cd;
					point_detail.endTime = endTime_cd;
					point_detail.positionDesc = pointPosition;
					point_detail.name = pointName;
					point_detail.deviceName = selectedDeviceName;
					point_detail.surveyTitle = selectedSurveyTitle;
					point_detail.deviceStatus = data.list[0].deviceStatus;
					
					alertokMsg(getLangStr("teamBuilding_msg_6"),getLangStr("alert_ok"),"window.location.reload()");
					$.cookie("point_data_detail",JSON.stringify(point_detail)); // 修改成功之后 覆盖原先的cookie;
				}
				
			});

		}
		function errorFunc(data){
			var errormsg = data.messg;
			$(".error h4").html(errormsg);
		}
		sentJson(url,json,successFunc,errorFunc);
		
	});
	
	//添加测点页，选择测点来源点击效果
	var direction = "down";
	$("#setDataSource").on("click",function(){
		if(direction =="down"){
			$(".addpoint .datasource .top i").removeClass("down");
			$(".addpoint .datasource .top i").addClass("up");
			direction ="up";
		}else{
			$(".addpoint .datasource .top i").removeClass("up");
			$(".addpoint .datasource .top i").addClass("down");
			direction ="down";
		}
		$(".addpoint .datasource .top i").remove
		$("#dataSource").slideToggle("slow");
	});

	//添加测点时，点击来源设备，弹出设备列表
	$("#link-device a").click(function(){
		
			var start_time = $("#start_t").val();
			var end_time = $("#end_t").val();

/*			if(!reg_time.test(start_time)){
				alertokMsg("开始时间格式不正确","确定");
				return;
			}
			if(!reg_time.test(end_time)){
				alertokMsg("结束时间格式不正确","确定");
				return;
			}*/
			
			//判断时间是否符合规定（开始时间大于结束时间）
			var startTime_cd = new Date(start_time);
			var endTime_cd = new Date(end_time);
			var startTimeStamp = startTime_cd.getTime();
			var endTimeStamp = endTime_cd.getTime();
			startTime_cd = startTime_cd.Format("yyyy-MM-dd");
			endTime_cd = endTime_cd.Format("yyyy-MM-dd");
			
			if(startTimeStamp>1000 || endTimeStamp>1000){ // 判断日历中是否选择过日期
				if(startTimeStamp > endTimeStamp){
					alertokMsg(getLangStr("surveyRep_messg1"),getLangStr("alert_ok"));
					return;
				}
			}else{
				startTime_cd = -1;
				endTime_cd = -1;
			}
		
			$('.addSurveyListBox').css("display","none");
			$('.addPointListBox').css("display","block");
			/*if(deviceList.length==0){*/
				$("#loadingm").css("display","block");
				$("#child").empty();
				 $.ajax({
				   		type:"post",
				   		url:"/project/single/building/point_device_relevant",
				   		dataType:"json",
				   		data:{
				   			'projectID':teamID,
				   	/*		'startTime':startTime_cd,
				   			'endTime':endTime_cd*/
				   		},
				   		success:function(data){
				   			console.log("__________________");
				   			console.log(data);
				   			
				   			if(data.code==200){
				   				$("#loadingm").css("display","none");
				   				var list=data.list;
				   				deviceList = list;
				   				var listStr='';
				   				for(var i=0;i<list.length;i++){
				   					listStr+='<li class="clearfix" data-id='+list[i].id+' data-dname='+list[i].name+'>'+
						                         '<div class="ui checkbox fl">'+
							                          '<input type="checkbox" name="example">'+
							                          '<label></label>'+
							                      '</div>'+
						                          '<span class="fl">'+list[i].name+'</span>'+
						                     '</li>';
				   				}
				   				$("#child").html(listStr);
				   				
					   			  /*设置列表背景色*/
					   			    var _length=$(".addDeviceList li").length;
					   			    for(var i=0;i<_length;i++){
					   			        if(i%2==0){
					   			            $(".addDeviceList li").eq(i).css("background","#F2F2F2");
					   			        }else{
					   			            $(".addDeviceList li").eq(i).css("background","#FFF");
					   			        }
					   			    }
					   			
					   			 $(".ui.checkbox").checkbox();
					   			 /*s设置滚动条长度*/
					   			    var boxHeight=$("#box").height();
					   			    var contentHeight=$("#child").height();
					   			    var _length=$("#child").children("li").length;
					   			    if(_length<=6){
					   			    	$("#progress").css("display","none");
					   			    	$("#box").css("height",contentHeight);
					   			    }
					   			    else{
					   			    	$("#box").css("height","16rem");
					   			        $("#progress").css("display","block");
					   			        $("#bar").css("height",$("#box").height()/contentHeight*100+"%");
					   			    }
					   			    
					   			    
				   			}else{
				   				alertokMsg(data.messg);
				   			}
				   		},
				   		error:function(){
				   			console.log("error");
				   		}
				   	 });
	});

	//点击添加设备
	$(".confirmBtn").click(function(){
		$('.addPointListBox').css("display","none");
		//获取关联设备id		
		if($(".addPointListBox .ui.checkbox.checked").length>0){
			var selectedDeviceNames = $(".addPointListBox .ui.checkbox.checked").siblings(".fl").html();
			$("#glsb").html("&nbsp;&nbsp;:&nbsp;&nbsp;"+selectedDeviceNames);
		}
	});
	//设备列表单选
	$("#child").on("click","li",function(event){
		$("#child li").children(".ui.checkbox").checkbox('uncheck');
		$(this).children(".ui.checkbox").checkbox('check');
		// $(this).siblings().children(".ui.checkbox").checkbox('uncheck');
	})
	//设备列表上方的查询框，输入后即查询
	$('#searchDevice').keyup(function(event){
		$this = $(this);
		var listStr = "";
	   for(var i=0;i<deviceList.length;i++){
		   var devicename = deviceList[i].name;
		   var searchcontent = $this.val();
		   if(devicename.indexOf(searchcontent) >= 0 || $.trim(searchcontent)==""){
			   listStr+='<li class="clearfix" data-id='+deviceList[i].id+'>'+
	           '<div class="ui checkbox fl">'+
	                '<input type="checkbox" name="example">'+
	                '<label></label>'+
	            '</div>'+
	            '<span class="fl">'+deviceList[i].name+'</span>'+
	       '</li>';
		   }
	   } 
	   $("#child").html(listStr);
	   //设置列表背景色
		    var _length=$(".addDeviceList li").length;
		    for(var i=0;i<_length;i++){
		        if(i%2==0){
		            $(".addDeviceList li").eq(i).css("background","#F2F2F2");
		        }else{
		            $(".addDeviceList li").eq(i).css("background","#FFF");
		        }
		    }
	});
	//添加测点时，点击关联问卷，弹出问卷列表
	$("#link-survey a").click(function(){
		
		$('.addPointListBox').css("display","none");
		$('.addSurveyListBox').css("display","block");
		if(surveyList.length==0){
			$("#loadingmSurvey").css("display","block");
			$("#childSurvey").empty();
		   	 $.ajax({
		   		type:"post",
		   		url:"/project/single/building/point_survey_relevant",
		   		dataType:"json",
		   		data:{projectID:teamID},
		   		success:function(data){
		   			console.log(data);
		   			if(data.code==200){
		   				$("#loadingmSurvey").css("display","none");
		   				var surveys=data.list;
		   				surveyList = surveys;
		   				var listStr='';
		   				for(i in surveys){
		   					var survey = surveys[i];
		   					var id = survey.id;
		   					var name = survey.name;
		   					var title = survey.title;
		   					var host = window.location.host;
		   					listStr+='<li class="clearfix" data-id='+id+' data-stitle='+title+'>'+
		                    '<div class="ui checkbox fl">'+
		                         '<input type="checkbox" name="example">'+
		                         '<label></label>'+
		                     '</div>'+
		                     '<span class="fl">'+title+'</span>'+
		                     '</li>';
		   				}
		   				$("#childSurvey").html(listStr);
		   				
			   			  /*设置列表背景色*/
			   			    var _length=$(".addSurveyList li").length;
			   			    for(var i=0;i<_length;i++){
			   			        if(i%2==0){
			   			            $(".addSurveyList li").eq(i).css("background","#F2F2F2");
			   			        }else{
			   			            $(".addSurveyList li").eq(i).css("background","#FFF");
			   			        }
			   			    }
			   			
			   			 $(".ui.checkbox").checkbox();
			   			 /*s设置滚动条长度*/
			   			    var boxHeight=$("#boxSurvey").height();
			   			    var contentHeight=$("#childSurvey").height();
			   			    var _length=$("#childSurvey").children("li").length;
			   			    if(_length<=6){
			   			    	$("#progressSurvey").css("display","none");
			   			    	$("#boxSurvey").css("height",contentHeight);
			   			    }
			   			    else{
			   			    	$("#boxSurvey").css("height","16rem");
			   			        $("#progressSurvey").css("display","block");
			   			        $("#barSurvey").css("height",$("#box").height()/contentHeight*100+"%");
			   			    }
			   			    
			   			    
		   			}else{
		   				alertokMsg(data.messg);
		   			}
		   		},
		   		error:function(){
		   			console.log("error");
		   		}
		   	 });
		}
	});
	//问卷列表单选
	$("#childSurvey").on("click","li",function(event){
		$(this).children(".ui.checkbox").checkbox('check');
		$(this).siblings().children(".ui.checkbox").checkbox('uncheck');
	})
	//点击添加问卷
	$(".confirmBtnSurvey").click(function(){
		$('.addSurveyListBox').css("display","none");
		//获取关联问卷id
		if($(".addSurveyListBox .ui.checkbox.checked").length>0){
			var selectedSurveyName = 	$(".addSurveyListBox .ui.checkbox.checked").siblings(".fl").html();
			$("#glwj").html("&nbsp;&nbsp;:&nbsp;&nbsp;"+selectedSurveyName);
		}
		
	});
	//设备列表上方的查询框，输入后即查询
	$('#searchSurvey').keyup(function(event){  
		$this = $(this);
		var listStr = "";
	   for(var i=0;i<surveyList.length;i++){
		   var surveyname = surveyList[i].title;
		   var searchcontent = $this.val();
		   if(surveyname.indexOf(searchcontent) >= 0 || $.trim(searchcontent)==""){
			   listStr+='<li class="clearfix" data-id='+surveyList[i].id+'>'+
	           '<div class="ui checkbox fl">'+
	                '<input type="checkbox" name="example">'+
	                '<label></label>'+
	            '</div>'+
	            '<span class="fl">'+surveyname+'</span>'+
	       '</li>';
		   }
	   } 
	   $("#childSurvey").html(listStr);
	   /*设置列表背景色*/
		    var _length=$(".addSurveyList li").length;
		    for(var i=0;i<_length;i++){
		        if(i%2==0){
		            $(".addSurveyList li").eq(i).css("background","#F2F2F2");
		        }else{
		            $(".addSurveyList li").eq(i).css("background","#FFFFFF");
		        }
		    }
	});
	
});
