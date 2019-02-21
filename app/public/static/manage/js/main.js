//require.config({
//	paths:{
//		"jquery":"/static/common/js/jquery.min",
//		"jqueryCookie":"/static/common/js/jquery.cookie",
//		"semantic":"/static/common/js/semantic.min",
//		"tools":"/static/common/js/tools",
//		"common":"/static/manage/js/team/teamCommon"
//	}
//});

//require.config({
//	paths:{
//		"jquery":"/static/common/js/jquery.min"
//	}
//});

//require(['jquery','jqueryCookie','semantic','tools','common','myMapHighchart'],function(jquery,jqueryCookie,semantic,tools,common,myMapHighchart){
	$("#sjgl").addClass("active");
	//左侧导航栏，姓名
	var LocalName = $.cookie("ibeem");
	LocalName = decodeURI(LocalName.split('^_^')[1]);
	localStorage.setItem("LocalName",LocalName);
	//右侧筛选框，是否隐藏状态
	var hideFilter = false;
	//全局变量，用于记录过滤框的展开状态
	var onshow = false;
	//用于初始化地图的数组
	var mapdata =[];
	//建筑数据全局缓存
	var buildingListData = [];
	$(function init(){
		//定义地图div的宽高，和80%content
		var mapcontainer_height = $("#content").height();
		var mapcontainer_width = $("#content").width();
		$("#container").height(mapcontainer_height);
		$("#container").width((mapcontainer_width-30));
//		$("#container").css("margin-top",mapcontainer_height*0.075)
		$("#container").css("margin-left")
		//如果是英文，修改样式
		var lang = window.localStorage.getItem("language");
		if(lang=="en"){
			//顶端三个按钮			
			$(".top-button.building").css("margin-left","-12.1428rem");
			$(".top-button.point").css("margin-left","-6.6428rem");
			$(".top-button.point").css("width","9rem");
			$(".top-button.survey").css("margin-left","2.8571rem");
			//右下角切换按钮
			$(".ui.toggle.checkbox.mytoggle").addClass("en");
						
		}
		$("#button_group").css("display","block");
	    $("#filter").css("display","block");
		//顶部三个按钮点击事件
		$("#button_group").on("click",".top-button",function(){
			$(this).siblings().removeClass("active");
			$(this).addClass("active");
			
			//判断是哪个维度
			if($(this).hasClass("building")){
				//查询并初始化建筑数据	
				getBuildingMsg();
			}else if($(this).hasClass("point")){
				//查询并初始化测点数据		
				initDeviceMsg();
			}else if($(this).hasClass("survey")){
				//查询并初始化问卷数据			
				initSurveyMsg();
			}
		})
		//重新生成点击事件
		$("#filter_confirm").click(function(){
			var newBuildingList = []; 
			newBuildingList = buildingListData.slice(0); 
			//获取过滤的值，过滤buildingListData
			$("#filter_menu>.item").each(function(){
				var filterType = $(this).data("type");
				var filterText = $(this).find(".text").attr("data-text");
				if(filterText!=undefined && filterText!=""){
					var totalLength = newBuildingList.length;
					for(var i=0;i<newBuildingList.length;i++){
						var data = newBuildingList[i];
						var text = data[filterType];
						if(filterText != text){
							newBuildingList.splice(i,1);
							i--;
							totalLength--;
						};
						if((i+1)==totalLength)return;
					}
				}
			})
			//传参重新生成
			initBuildingMsg(newBuildingList);
		})
		//获取建筑信息，默认先显示建筑
		getBuildingMsg();
	})
//=================初始化建筑维度数据building==================
	function getBuildingMsg(){
		//获取建筑信息
		var url = "/index/building_list";
		var json = {};
		function func(data){
			var buildingList = data.list;
			buildingListData = buildingList;
			//清除界面数据			
			clearData();
			//生成过滤			
			initBuildingFilter(buildingListData);
			//初始化地图及图表			
			initBuildingMsg(buildingList);
			//toogleLabel
			$("#toogleLabel").html(getLangStr("main_switchtolist"));
//			$("#map_list_div").transition("hide");
			$("#mytoggle").checkbox({
				onChange:function(){
					if($("#mytoggle").hasClass("checked")){
						//显示列表
						$("#toogle_tip").removeClass("hidden");
						$("#container").transition();
						$("#map_list_div").transition('show');
					}else{
						//显示地图
						$("#toogle_tip").addClass("hidden");
						$("#map_list_div").transition('horizontal flip');
						$("#container").transition();
//						$("#map_list_div").transition("hide");
					}
				}
			});
			//列表中点击跳转事件
			$("#map_list_div").on("click",".redirect",function(){
				var buildingId = $(this).data("id");
				var teamId = $(this).data("teamid");
        		$.cookie("buildingid",buildingId);
        		$.cookie("teamid",teamId);
        		//获取项目名称
        		var url="/index/single_building";
        		var json={"projectId":teamId, "buildingId": buildingId};
        		var successFunc = function(data){
        			$.cookie("teamname",data.projectName);
        			window.location.href="/project?project_name=" + data.projectName + "&item=building&building_name=" + data.buildingName;
        		}
        		sentJson(url,json,successFunc);
			})
		}
		sentJson(url,json,func);
	}
	function initBuildingMsg(buildingList){
		var legendLength =  buildingList.length;
		$("#countNum>span").html(getLangStr("main_quantity")+":"+legendLength);
		
		//初始化地图		
		initJZPointMap(buildingList);
		
		
		var qhqData = {};
		var typeData = {};
		var levelData = {};
		var buildingNameList = [];
		
		for(var i in buildingList){
			var qhq = buildingList[i].climaticProvince;
			if(qhqData[qhq]!= undefined){
				qhqData[qhq] =  qhqData[qhq]+1;
			}else{
				qhqData[qhq] = 1;
			}
			
			var type = buildingList[i].type;
			if(typeData[type]!= undefined){
				typeData[type] =  typeData[type]+1;
			}else{
				typeData[type] = 1;
			}
			
			var level = buildingList[i].level;
			if(levelData[level]!= undefined){
				levelData[level] =  levelData[level]+1;
			}else{
				levelData[level] = 1;
			}
			
			var name = buildingList[i].name;
			var id = buildingList[i].id;
			var city = buildingList[i].city;
			var projectID = buildingList[i].projectID;
			buildingNameList.push({'name':name,'id':id,'city':city,'projectID':projectID});
			
		}
		//生成气候区图表
		var qhqSeries = [];
		for(var key in qhqData){
			var count = qhqData[key]
			qhqSeries.push({"name":key,"y":count});
		}
		newZzt("chart_top_left",getLangStr("main_qhqfb"),[{"name":getLangStr("main_qhq"),"data":qhqSeries}]);
		
		//生成建筑类型图表
		var typeSeries = [];
		for(var key in typeData){
			var count = typeData[key]
			typeSeries.push({"name":key,"y":count});
		}
		newZzt("chart_bottom_left",getLangStr("main_jzlxfb"),[{"name":getLangStr("main_jzlx"),"data":typeSeries}]);
		
		//生成建筑星级图表
		var levelSeries = [];
		for(var key in levelData){
			var count = levelData[key]
			levelSeries.push({"name":key,"y":count});
		}
		newSmallZzt("chart_medium_left",getLangStr("main_jzxjfb"),[{"name":getLangStr("main_jzxj"),"data":levelSeries}]);
		
		//生成列表
		var scrollWidth = getScrollWidth();
		$("#map_list_div").empty();
		$("#map_list_div").append('<table id="map_list" class="ui celled table" cellspacing="0" > </table>');
		$("#map_list").append("<thead></thead><tbody></tbody>")
		$("#map_list>thead").append("<tr><th style='width:18rem;'>"+getLangStr("main_buildingname")+"</th> <th style='width:5rem'>"+getLangStr("main_city")+"</th> </tr> ")
		for(var i in buildingNameList){
			$("#map_list>tbody").append("<tr><td class='redirecttd'><a class='redirect' href='javascript:void(0)' data-id='"+buildingNameList[i].id+"' data-teamid='"+buildingNameList[i].projectID+"'>"+buildingNameList[i].name+"</a></td><td class='redirecttd'><a class='redirect' href='javascript:void(0)' data-id='"+buildingNameList[i].id+"'  data-teamid='"+buildingNameList[i].projectID+"'>"+buildingNameList[i].city+"</a></td></tr>")
		}
		$(document).ready(function() {
		    $('#map_list').DataTable({
		    	"pageLength": 8,
		    	"ordering": false, 
		    	"info": false,
		    	"lengthChange":false
		    });
		});
		$("#map_list_paginate").parent().removeClass("nine");
		$("#map_list_paginate").parent().removeClass("wide");
		$("#map_list_paginate").parent().removeClass("column");
		$("#map_list_paginate").parent().addClass("sixteen");
		$("#map_list_paginate").parent().addClass("wide");
		$("#map_list_paginate").parent().addClass("column");
		
	}
	
//=================初始化测点维度数据device==================
	function initDeviceMsg(){
		var url = "/index/device_list";
		var json = {};
		function func(data){
			var list = data.list;
			var deviceList = [];
			var deviceNameList = [];
			var onlineLength = 0;
			for(var i=0;i<list.length;i++){
				var lat = list[i].latitude;
				var lon = list[i].longitude;
				var name = list[i].deviceName;
				var status = list[i].status;
				var id = list[i].id;
				var address = list[i].address;
				var province = list[i].province;
				if(status=="true"){
					onlineLength++;
				}
				deviceList.push({lat:lat,lon:lon,name:name,province:province});
				//用于生成测点列表
				deviceNameList.push({'name':name,'id':id,'address':address});
			}
			var legendLength =  deviceList.length;
			$("#countNum>span").html(getLangStr("main_device")+'：('+onlineLength+'/'+legendLength+')');
			mapdata.splice(0,mapdata.length);
			mapdata.push({
				type: 'mappoint',
				name: getLangStr("main_device")+'('+onlineLength+'/'+legendLength+')',
				color: '#f15c80',
				data:deviceList
			});
			//初始化地图		
			initMap(mapdata);
			//清除界面数据			
			clearData();
			//隐藏筛选框
			$("#filter").css("display","none");
			$("#filter_confirm").css("display","none");
			removeLoading();
			//生成列表
			var scrollWidth = getScrollWidth();
			$("#map_list_div").empty();
			$("#map_list_div").append('<table id="map_list" class="ui celled table" cellspacing="0" > </table>');
			$("#map_list").append("<thead></thead><tbody></tbody>")
			$("#map_list>thead").append("<tr><th style='width:10rem;'>"+getLangStr("main_devicename")+"</th> <th style='width:13rem'>"+getLangStr("main_location")+"</th> </tr> ")
			for(var i in deviceNameList){
				$("#map_list>tbody").append("<tr><td>"+deviceNameList[i].name+"</td><td>"+deviceNameList[i].address+"</td></tr>")
			}
			$(document).ready(function() {
			    $('#map_list').DataTable({
			    	"pageLength": 8,
			    	"ordering": false, 
			    	"info": false,
			    	"lengthChange":false
			    });
			});
			$("#map_list_paginate").parent().removeClass("nine");
			$("#map_list_paginate").parent().removeClass("wide");
			$("#map_list_paginate").parent().removeClass("column");
			$("#map_list_paginate").parent().addClass("sixteen");
			$("#map_list_paginate").parent().addClass("wide");
			$("#map_list_paginate").parent().addClass("column");
		}
		sentJson(url,json,func);
	}
//=================初始化问卷维度数据survey==================
	function initSurveyMsg(){
		var url = "/index/survey_list";
		var json = {};
		function func(data){
			var surveyList = data.list;
			var legendLength =  surveyList.length;
			
			
			$("#countNum>span").html(getLangStr("main_surveyamount")+"："+legendLength);
			mapdata.splice(0,mapdata.length);
			mapdata.push({
				type: 'mappoint',
				name: getLangStr("main_survey")+'('+legendLength+')',
				color: '#f7a35c',
				data:surveyList
			});
			//初始化地图		
			initMap(mapdata);
			//清除界面数据			
			clearData();
			//生成列表
			var scrollWidth = getScrollWidth();
			$("#map_list_div").empty();
			$("#map_list_div").append('<table id="map_list" class="ui celled table" cellspacing="0" > </table>');
			$("#map_list").append("<thead></thead><tbody></tbody>")
			$("#map_list>thead").append("<tr><th style='width:10rem;'>"+getLangStr("main_survey")+"</th> <th style='width:13rem'>"+getLangStr("main_surveytime")+"</th> </tr> ")
			for(var i in surveyList){
				var name = surveyList[i].name;
				var intro = surveyList[i].introduction;
				var time = surveyList[i].time;
				$("#map_list>tbody").append("<tr><td>"+name+"</td><td>"+time+"</td></tr>")
			}
			$(document).ready(function() {
			    $('#map_list').DataTable({
			    	"pageLength": 8,
			    	"ordering": false, 
			    	"info": false,
			    	"lengthChange":false
			    });
			});
			$("#map_list_paginate").parent().removeClass("nine");
			$("#map_list_paginate").parent().removeClass("wide");
			$("#map_list_paginate").parent().removeClass("column");
			$("#map_list_paginate").parent().addClass("sixteen");
			$("#map_list_paginate").parent().addClass("wide");
			$("#map_list_paginate").parent().addClass("column");
			//隐藏筛选框
			$("#filter").css("display","none");
			$("#filter_confirm").css("display","none");
			removeLoading();
		}
		sentJson(url,json,func);
	}
	//定时执行方法
	function doAfterStatus(status,func,type){
		if(status){
			func();
		}else{
			if(type=='building'){
				setTimeout(function(){doAfterStatus(buildingReady,func,'building')},100);
			}
			else if(type=='device'){
				setTimeout(function(){doAfterStatus(deviceReady,func,'device')},100);
			}
			else if(type=='question'){
				setTimeout(function(){doAfterStatus(questionReady,func,'question')},100);
			}
			
		}
		
	}


//})
	function newZzt(id,title,data){
	    $("#"+id).highcharts({
	        chart: {
	        	backgroundColor: 'rgba(255,255,255,0.3)',
	        	borderWidth:1,
	        	borderColor:'#e2dfdf',
	        	borderRadius:'.2857rem',
	        	color:['rgba(124,181,236,0.8)','rgba(67,67,72,0.8)','rgba(144,237,125,0.8)','rgba(247,263,92,0.8)','rgba(128,133,233)','rgba(241,92,128)'],
	            type: 'column',
	            marginBottom: 70,
	        },
	        title: {
	            text: title
	        },
	        credits:{
	        	enabled:false
	        },
	        navigations :{
	        	buttonOptions:{
	        		enabled:false
	        	}
	        },
	        xAxis: {
	        	type: 'category'
	        },
	        yAxis: {
	            min: 0,
	            title: {
	                text: ''
	            }
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
	                colorByPoint: true
	            }
	        },
	        series: data 
	    });
	    
	}
	function newSmallZzt(id,title,data){
	    $("#"+id).highcharts({
	        chart: {
	        	backgroundColor: 'rgba(255,255,255,0.3)',
	        	borderWidth:1,
	        	borderColor:'#e2dfdf',
	        	borderRadius:'.2857rem',
	        	color:['rgba(124,181,236,0.8)','rgba(67,67,72,0.8)','rgba(144,237,125,0.8)','rgba(247,263,92,0.8)','rgba(128,133,233)','rgba(241,92,128)'],
	            type: 'column',
	            marginBottom: 70,
	        },
	        title: {
	            text: title
	        },
	        credits:{
	        	enabled:false
	        },
	        navigations :{
	        	buttonOptions:{
	        		enabled:false
	        	}
	        },
	        xAxis: {
	        	type: 'category',
	        	labels: {
                    style: {
                        fontSize:'8px'  //字体
                    }
                }
	        },
	        yAxis: {
	            min: 0,
	            title: {
	                text: ''
	            }
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
	                colorByPoint: true
	            }
	        },
	        series: data 
	    });
	    
	}
	function rebuilding(){
		var newBuildingList = []; 
		newBuildingList = buildingListData.slice(0); 
		//获取过滤的值，过滤buildingListData
		$("#filter_menu>.item").each(function(){
			var filterType = $(this).data("type");
			var filterText = $(this).find(".text").attr("data-text");
			if(filterText!=undefined && filterText!=""){
				var totalLength = newBuildingList.length;
				for(var i=0;i<newBuildingList.length;i++){
					var data = newBuildingList[i];
					var text = data[filterType];
					if(filterText != text){
						newBuildingList.splice(i,1);
						i--;
						totalLength--;
					};
					if((i+1)==totalLength)return;
				}
			}
		})
		//传参重新生成
		initBuildingMsg(newBuildingList);
	}
	
//	===========================生成过滤列表===========================
	function initBuildingFilter(buildingList){
		//解析数据
		var projectData = {};
		var cityData = {};
		var qhqData = {};
		var typeData = {};
		var levelData = {};
		
		
		
		for(var i in buildingList){
			var qhq = buildingList[i].climaticProvince;
			if(qhqData[qhq]!= undefined){
				qhqData[qhq] =  qhqData[qhq]+1;
			}else{
				qhqData[qhq] = 1;
			}
			
			var type = buildingList[i].type;
			if(typeData[type]!= undefined){
				typeData[type] =  typeData[type]+1;
			}else{
				typeData[type] = 1;
			}
			
			var level = buildingList[i].level;
			if(levelData[level]!= undefined){
				levelData[level] =  levelData[level]+1;
			}else{
				levelData[level] = 1;
			}
			
			var city = buildingList[i].city;
			if(cityData[city]!= undefined){
				cityData[city] =  cityData[city]+1;
			}else{
				cityData[city] = 1;
			}
			
			var projectId = buildingList[i].projectID;
			var projectName = buildingList[i].projectName;
			if(projectData[projectId]== undefined){
				projectData[projectId] =  projectName;
			}
			
			
		}
		
		//1.项目
        $("#filter_menu").append("<div class='item' data-type='projectID'>"+
	      "<i class='left dropdown icon'></i>"+
	      "<span class='text'>"+getLangStr("main_project")+"</span>"+
	      "<div class='left menu' id='dropdown_jz_project'>"+
	      "</div>"+
	    "</div>");
        $("#dropdown_jz_project").append("<div class='item option' data-value=''>"+getLangStr("main_allproject")+"</div>")
		for(var id in projectData){
			var projectName = projectData[id];
			//给项目下拉列表添加值
			  $("#dropdown_jz_project").append("<div class='item option' data-value='"+id+"'>"+projectName+"</div>")
		}
		
		//2.地区
		$("#filter_menu").append("<div class='item'  data-type='city'>"+
			      "<i class='left dropdown icon'></i>"+
			      "<span class='text'>"+getLangStr("main_region")+"</span>"+
			      "<div class='left menu' id='dropdown_jz_city'>"+
			      "</div>"+
			    "</div>");
		$("#dropdown_jz_city").append("<div class='item option' data-value=''>"+getLangStr("main_allregion")+"</div>")
		for(var cityname in cityData){
			//给项目下拉列表添加值
			  $("#dropdown_jz_city").append("<div class='item option'>"+cityname+"</div>")
		}
		
		//3.气候区
		$("#filter_menu").append("<div class='item'  data-type='climaticProvince'>"+
			      "<i class='left dropdown icon'></i>"+
			      "<span class='text'>"+getLangStr("main_qhq")+"</span>"+
			      "<div class='left menu' id='dropdown_jz_qhq'>"+
			      "</div>"+
			    "</div>");
		$("#dropdown_jz_qhq").append("<div class='item option' data-value=''>"+getLangStr("main_allqhq")+"</div>")
		for(var name in qhqData){
			//给项目下拉列表添加值
			  $("#dropdown_jz_qhq").append("<div class='item option'>"+name+"</div>")
		}
		
		//4.建筑类型
		$("#filter_menu").append("<div class='item'  data-type='type'>"+
			      "<i class='left dropdown icon'></i>"+
			      "<span class='text'>"+getLangStr("main_buildingtype")+"</span>"+
			      "<div class='left menu' id='dropdown_jz_type'>"+
			      "</div>"+
			    "</div>");
		$("#dropdown_jz_type").append("<div class='item option' data-value=''>"+getLangStr("main_allbuildingtype")+"</div>")
		for(var name in typeData){
			//给项目下拉列表添加值
			  $("#dropdown_jz_type").append("<div class='item option'>"+name+"</div>")
		}
		
		//5.建筑星级
		$("#filter_menu").append("<div class='item'  data-type='level'>"+
			      "<i class='left dropdown icon'></i>"+
			      "<span class='text'>"+getLangStr("main_level")+"</span>"+
			      "<div class='left menu' id='dropdown_jz_level'>"+
			      "</div>"+
			    "</div>");
		$("#dropdown_jz_level").append("<div class='item option' data-value=''>"+getLangStr("main_alllevel")+"</div>")
		for(var name in levelData){
			//给项目下拉列表添加值
			  $("#dropdown_jz_level").append("<div class='item option'>"+name+"</div>")
		}
		
		//筛选框js
		$('#filter').dropdown({
		    action:"nothing",
		    onHide:function(){
		    	return false;
		    },
		    onShow:function(){
		    	onShow = true;
		    }
		})
		$('#filter').dropdown('show');
		$("#filter>.text").html(getLangStr("main_filter"));
		$('#filter .item.option.selected').removeClass("active selected");
		$('#filter').click(function(event){
			var $this = $(this);
			setTimeout(function(){
				if($(event.target).hasClass("clickme") && !onShow){
					if($this.hasClass("active")){
						$this.removeClass("active");
						$this.removeClass("visible");
						$("#filter_menu").removeClass("visible");
						$("#filter_menu").addClass("hidden");
					}
				}else{
					onShow = false;
				}
			},100)
			
		});
		$('#filter').on("click",".option",function(){
			  $(this).parent().removeClass("visible");
		      $(this).parent().addClass("hidden");
			  $(this).addClass("active");
			  $(this).siblings().removeClass("active");
			  var value = $(this).data("value");
			  var text = $(this).html();
			  
			  $(this).parent().siblings("span").attr("data-text",text);
		      if(value!=undefined){
		    		$(this).parent().siblings("span").attr("data-text",value);
		    	}
		      $(this).parent().siblings("span").html(text.length>6?text.substring(0,6)+'..':text);
		      
		      rebuilding();
		})
	}
	
	
	
	//切换维度时，界面上数据清空
	function clearData(){
		//生成建筑筛选框，先清空数据
		$("#filter").css("display","block");
		$("#filter_confirm").css("display","block");
		$("#filter_menu").empty();
		//清除三个chart
		$("#chart_top_left").empty();
		$("#chart_bottom_left").empty();
		$("#chart_medium_left").empty();
		//地图可见，列表不可见
		if($("#container").hasClass("hidden")){
//			$("#container").removeClass("hidden");
//			$("#container").addClass("visible");
//			$("#map_list_div").removeClass("visible");
//			$("#map_list_div").addClass("hidden");
			$("#mytoggle").checkbox("uncheck");
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