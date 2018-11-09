function initJZPointMap(buildingList){
	var data = [];
	data.push({
		type: 'mappoint',
		name: '建筑',
		color: '#8085e9',
		data:buildingList,
        tooltip:{
        	headerFormat: '',
            pointFormat: '{point.name}<br/> <b>设备数:{point.deviceCount}<b/><br/><b>问卷数:{point.surveyCount}</b>',
            borderColor:'#47B390'
        },
        events:{
        	click:function(event){
        		var buildingId = event.point.id;
        		var teamId = event.point.projectID;
        		$.cookie("buildingid",buildingId);
        		$.cookie("teamid",teamId);
        		//获取项目名称
        		var url="/project/getProjectByID";
        		var json={"projectID":teamId};
        		var successFunc = function(data){
        			var teamMsg = data.project;
        			var name = teamMsg.name;
        			$.cookie("teamname",name);
        			window.location.href="/redirect?url=manage/teamBuildingContent.jsp";
        		}
        		sentJson(url,json,successFunc);
        	}
        }    
	});
	
	
	//统计建筑所在省份的建筑数量，放在对象里
	var buildingNumData = {};
	var featuresData = Highcharts.maps['cn/china'].features ;
	for(var i in buildingList){
		var building = buildingList[i];
		var city = building.city;
		//通过城市名获取省份名
		var provinceName = getProvinceName(city);
		//根据省份和省份编码对照获取省份编码
		for(var j in featuresData){
			if(provinceName == featuresData[j].properties.fullname){
				var provinceCode = featuresData[j].properties.filename;
				//存在buildingNumData中   buildingNumData[省份编码]=省份中建筑个数
				if(buildingNumData[provinceCode]==undefined){
					buildingNumData[provinceCode] = 1;
				}else{
					buildingNumData[provinceCode] = buildingNumData[provinceCode]+1;
				}
			}
		}
	}
		var series = [{
	        name: '省份',
	        data: $.map(['shanghai','xicang','beijing','tianjin','zhongqing','liaoning','jilin','heilongjiang','xinjiang','qinghai','gansu','ningxia','shanxi2','sichuan','yunnan','guizhou','xizang','shandong','jiangsu','anhui','zhejiang','fujian','guangdong','guangxi','hainan','hubei','hunan','henan','jiangxi','hebei','shanxi','neimenggu','taiwan','xianggang','aomen'], function (code,index) {
	            return { code: code ,value:(buildingNumData[code]!=undefined?buildingNumData[code]:0)};
	        }),
	        borderColor:'#f0f0f0'
	    },{
	        name: '南海',
	        data: $.map(['nanhai'], function (code,index) {
	            return { code: code ,value:(buildingNumData[code]!=undefined?buildingNumData[code]:0)};
	        }),
	        borderColor:'#cccccc'
	    }];
		series = series.concat(data);
		// 初始化
		var map = null;
		var mapdataFull = null;
			$('#container').highcharts('Map', {
		        chart: {
//		            spacingBottom:50,
		            backgroundColor: '#f0f0f0'
		        },
		        title : {
		            text : ''
		        },
		        colors: ['#47b391', 'rgba(71, 179, 145,0.9)', 'rgba(71, 179, 145,0.8)', 'rgba(71, 179, 145,0.7)', 'rgba(71, 179, 145,0.6)', 
		                 'rgba(71, 179, 145,0.4)', 'rgba(71, 179, 145,0.3)', 'rgba(71, 179, 145,0.2)', 'rgba(71, 179, 145,0.1)'],
			    credits:{
			    	enabled: false
			    },
			    legend:{
			    	enabled:false
			    },
			    colorAxis: {
		            min: 0,
		            minColor: 'rgba(71, 179, 145,0.5)',
		            maxColor: '#088860',
		            labels:{
		                style:{
		                    "color":"red","fontWeight":"bold"
		                }
		            }
		        },
		        mapNavigation: {
		        	enabled: true
		        },
		        plotOptions: {
		            map: {
		                allAreas: false,
		                joinBy: ['filename', 'code'],
		                dataLabels: {
		                    enabled: false,
		                    color: 'white',
		                    format: null,
		                    style: {
		                        fontWeight: 'bold'
		                    }
		                },
		                mapData: Highcharts.maps['cn/china'],
		                tooltip: {
		                    headerFormat: '',
		                    pointFormat: '{series.name}: <b>{point.name}</b>'
		                }
		            },
		            mappoint : {
		            "marker": {
		            	symbol:'circle',//圆点显示  
	                    radius:3,  
	                    lineWidth:1,  
	                    lineColor:'black',  
	                    fillColor:'white',  
	                    states:{  
	                        hover:{  
	                            enabled:false  
	                        }  
	                    }  
		            }

		            }
		        },
		        series : series
		    });
			//不显示缩放图标
		    $(".highcharts-map-navigation").css("display","none");
	}   


//==================================================================

	function initMap(data){
		$("#container").empty();
		var featuresData = Highcharts.maps['cn/china'].features ;
		//根据经纬度调用百度接口解析成省份
		var devicelist = data[0].data;
		var deviceNumData = {};
//		var n=0;
		useBaiduApiGetProvince();
		
		function useBaiduApiGetProvince(){
			for(n in devicelist){
				var device =  devicelist[n];
				var latitude = device.lat;
				var longitude = device.lon;
				if(longitude==null || latitude==null || latitude=="" || longitude==""){
					continue;
				}
				var province = device.province;
				for(var j in featuresData){
		 			if(province == featuresData[j].properties.fullname){
						var provinceCode = featuresData[j].properties.filename;
						//存在buildingNumData中   buildingNumData[省份编码]=省份中建筑个数
						if(deviceNumData[provinceCode]==undefined){
							deviceNumData[provinceCode] = 1;
						}else{
							deviceNumData[provinceCode] = deviceNumData[provinceCode]+1;
						}
						break;
					}
//		 			if(j == featuresData.length-1){
//		 				alert(province+"不存在");
//		 			}
	 			}
//				$.ajax({
//					type:"post",
//					dataType:"JSONP",
//					async: false,
//					jsonp:"callback",
//					jsonpCallback:"renderReverse",
//					url:'http://api.map.baidu.com/geocoder/v2/?location='+latitude+','+longitude+'&output=json&pois=1&ak=MYANI1W4YFRUTd4sSvsW9iKEoge5LZx7',
//			 		success:function(msg){
//			 			addLoading();
//			 			var province = msg.result["addressComponent"].province;
//			 			for(var j in featuresData){
//				 			if(province == featuresData[j].properties.fullname){
//								var provinceCode = featuresData[j].properties.filename;
//								//存在buildingNumData中   buildingNumData[省份编码]=省份中建筑个数
//								if(deviceNumData[provinceCode]==undefined){
//									deviceNumData[provinceCode] = 1;
//								}else{
//									deviceNumData[provinceCode] = deviceNumData[provinceCode]+1;
//								}
//							}
//			 			}
//			 			n++;
//			 			useBaiduApiGetProvince();//递归调用，查询省份编码
//			 		}
//				});
			}
//			else if(devicelist.length==n){//查询结束，开始初始化地图

				var series = [{
			        name: '省份',
			        data: $.map(['shanghai','xicang','beijing','tianjin','zhongqing','liaoning','jilin','heilongjiang','xinjiang','qinghai','gansu','ningxia','shanxi2','sichuan','yunnan','guizhou','xizang','shandong','jiangsu','anhui','zhejiang','fujian','guangdong','guangxi','hainan','hubei','hunan','henan','jiangxi','hebei','shanxi','neimenggu','taiwan','xianggang','aomen'], function (code,index) {
			            return { code: code ,value:(deviceNumData[code]!=undefined?deviceNumData[code]:0)};
			        }),
			        borderColor:'#f0f0f0'
			    },{
			        name: '南海',
			        data: $.map(['nanhai'], function (code,index) {
			            return { code: code ,value:(deviceNumData[code]!=undefined?deviceNumData[code]:0)};
			        }),
			        borderColor:'#cccccc'
			    }];
				series = series.concat(data);
				// 初始化
				var map = null;
				var mapdataFull = null;
					$('#container').highcharts('Map', {
				        chart: {
//				            spacingBottom:50,
				            backgroundColor: '#f0f0f0'
				        },
				        title : {
				            text : ''
				        },
				        colors: ['#47b391', 'rgba(71, 179, 145,0.9)', 'rgba(71, 179, 145,0.8)', 'rgba(71, 179, 145,0.7)', 'rgba(71, 179, 145,0.6)', 
				                 'rgba(71, 179, 145,0.4)', 'rgba(71, 179, 145,0.3)', 'rgba(71, 179, 145,0.2)', 'rgba(71, 179, 145,0.1)'],
					    credits:{
					    	enabled: false
					    },
					    legend:{
					    	enabled:false
					    },
					    colorAxis: {
				            min: 0,
				            minColor: 'rgba(71, 179, 145,0.5)',
				            maxColor: '#088860',
				            labels:{
				                style:{
				                    "color":"red","fontWeight":"bold"
				                }
				            }
				        },
				        mapNavigation: {
				        	enabled: true
				        },
				        plotOptions: {
				            map: {
				                allAreas: false,
				                joinBy: ['filename', 'code'],
				                dataLabels: {
				                    enabled: false,
				                    color: 'white',
				                    format: null,
				                    style: {
				                        fontWeight: 'bold'
				                    }
				                },
				                mapData: Highcharts.maps['cn/china'],
				                tooltip: {
				                    headerFormat: '',
				                    pointFormat: '{series.name}: <b>{point.name}</b>'
				                }
				            },
				            mappoint : {
				            "marker": {
				            	symbol:'circle',//圆点显示  
			                    radius:3,  
			                    lineWidth:1,  
			                    lineColor:'black',  
			                    fillColor:'white',  
			                    states:{  
			                        hover:{  
			                            enabled:false  
			                        }  
			                    }  
				            }

				            }
				        },
				        series : series
				    });
					//不显示缩放图标
				    $(".highcharts-map-navigation").css("display","none");
				    removeLoading();
			}
		
	}   


	//==================================================================

	function initSurveyMap(data){
		var series = [{
	        name: '直辖市',
	        data: $.map(['shanghai','beijing','tianjin','zhongqing','nanhai'], function (code,index) {
	            return { code: code };
	        })
	    },{
	        name: '东北',
	        data: $.map(['liaoning','jilin','heilongjiang'], function (code) {
	            return { code: code };
	        })
	    },{
	        name: '西北西南',
	        data: $.map(['xinjiang','xicang','qinghai','gansu','ningxia','shanxi2','sichuan','yunnan','guizhou','xizang'], function (code) {
	            return { code: code };
	        })
	    },{
	        name: '华东',
	        data: $.map(['shandong','jiangsu','anhui','zhejiang','fujian'], function (code) {
	            return { code: code };
	        })
	    },{
	        name: '华南',
	        data: $.map(['guangdong','guangxi','hainan'], function (code) {
	            return { code: code };
	        })
	    },{
	        name: '华中华北',
	        data: $.map(['hubei','hunan','henan','jiangxi','hebei','shanxi','neimenggu'], function (code) {
	            return { code: code };
	        })
	    },{
	        name: '港澳台',
	        data: $.map(['taiwan','xianggang','aomen'], function (code) {
	            return { code: code };
	        })
	    }];
		//根据经纬度调用百度接口解析成省份
		
//		//获取项目名称
//		for(var n in data){
//			var latitude = data[n].latitude;
//			var longitude = data[n].longitude;
//			$.ajax({
//				type:"post",
//				dataType:"JSONP",
//				async: false,
//				jsonp:"callback",
//				jsonpCallback:"renderReverse",
//				url:'http://api.map.baidu.com/geocoder/v2/?location='+latitude+','+longitude+'&output=json&pois=1&ak=MYANI1W4YFRUTd4sSvsW9iKEoge5LZx7',
//		 		success:function(data){
//		 			alert(data);
//		 		}
//			});
//		}
		
		series = series.concat(data);
		// 初始化
		var map = null;
		var mapdataFull = null;
		var geochina = 'https://data.jianshukeji.com/jsonp?filename=geochina/';
//		$.getJSON(geochina + 'china.json&callback=?',function(mapdata) {
			$('#container').highcharts('Map', {
		        chart: {
		            spacingBottom:50,
		            backgroundColor: '#f0f0f0'
		        },
		        title : {
		            text : ''
		        },
//		        colors: ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', 
//		                 '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'],
		        colors: ['#47b391', 'rgba(71, 179, 145,0.9)', 'rgba(71, 179, 145,0.8)', 'rgba(71, 179, 145,0.7)', 'rgba(71, 179, 145,0.6)', 
		                 'rgba(71, 179, 145,0.4)', 'rgba(71, 179, 145,0.3)', 'rgba(71, 179, 145,0.2)', 'rgba(71, 179, 145,0.1)'],
			    credits:{
			    	enabled: false
			    },
			    legend:{
			    	enabled:false
//			    	layout: 'vertical',
//			        align: 'right',
//			        verticalAlign: 'middle',
//			        borderWidth: 0,
//			        itemStyle:{
//			        	"font-size":"1.2rem",
//			        	"line-height":"2.4rem"
//			        },
//			        x:-50,
//			        y:-100
			    },
			    colorAxis: {
		            min: 0,
		            minColor: '#fff',
		            maxColor: '#006cee',
		            labels:{
		                style:{
		                    "color":"red","fontWeight":"bold"
		                }
		            }
		        },
		        mapNavigation: {
		        	enabled: true
		        },
		        plotOptions: {
		            map: {
		                allAreas: false,
		                joinBy: ['filename', 'code'],
		                dataLabels: {
		                    enabled: false,
		                    color: 'white',
		                    formatter: function () {
//		                        if (this.point.properties ) {
//		                            return this.point.properties['name'];
//		                        }
		                    },
		                    format: null,
		                    style: {
		                        fontWeight: 'bold'
		                    }
		                },
		                mapData: Highcharts.maps['cn/china'],
//		                mapData:mapdata,
		                tooltip: {
		                    headerFormat: '',
		                    pointFormat: '{series.name}: <b>{point.name}</b>'
		                }
		            },
		            mappoint : {
		            "marker": {
		            	symbol:'circle',//圆点显示  
	                    radius:3,  
	                    lineWidth:1,  
	                    lineColor:'black',  
	                    fillColor:'white',  
	                    states:{  
	                        hover:{  
	                            enabled:false  
	                        }  
	                    }  
		            }
//		            ,
//		            "tooltip":{
//		            	headerFormat: '',
//		                pointFormat: '{point.name}: <b>lat:{point.lat},lon:{point.lon}</b>'}
		            }
		        },
		        series : series
		    });
			//不显示缩放图标
		    $(".highcharts-map-navigation").css("display","none");


	    
	}   