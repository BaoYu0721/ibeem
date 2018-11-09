//=====初始化地图=====
$(function(){
	//初始化地图
	myMap.getData();
})
var myMap = {
		myChartObj:{},
		addPoint:function(param){
//			this.myChartObj.addSeries({
//				type: 'mappoint',
//				name: '建筑',
//				data:buildingList,
//				turboThreshold:5000,
//			});
			this.myChartObj.addSeries(param);
		},
		initMap:function(){
			this.getData();
		},
		getData:function(){
			addLoading("#map_container");
			$this = this;
			$.ajax({
		 		type:"post",
		 		dataType:"json",
		 		url:"/building/gbd/list",
		 		success:function(response){
		 			if(response.code == 200){
							//说明已经点进地图页了，并且正在等待loading，那么直接渲染loading不取消		
		 					responseData = response.list;
			 				var buildingList = [];
			 				//过滤掉城市，省份，经纬度为空的数据（不显示）
			 				for(var i in responseData){
			 					var building = responseData[i];
			 					var prov = building.province;
			 					var city = building.city;
			 					var lat = building.lat;
			 					var lon = building.lon;
			 					if(prov==null || prov=="" || city==null || city=="" || lat==null || lat=="" || lon==null || lon==""){
			 						continue;
			 					}
			 					buildingList.push(building);
			 				}
			 				mapDataArr = buildingList;
			 				$this.initJZPointMap(mapDataArr);
		 			}
		 		},
		 		error:function(data){
		 			removeLoading();
//		 			alert("系统出错")
		 		}
		 	});
		},
		initJZPointMap:function(buildingList){
			//设置地图高度
			$("#map").height($(".main_box_a").height()*0.9);
			var data = [];
			data.push({
				type: 'mappoint',
				name: '建筑',
				data:buildingList,
				turboThreshold:5000,
			});
			
			
			//统计建筑所在省份的建筑数量，放在对象里
			var buildingNumData = {};
			var featuresData = Highcharts.maps['cn/china'].features ;
			for(var i in buildingList){
				var building = buildingList[i];
				var city = building.city;
				//通过城市名获取省份名
				var provinceName = building.province;  
				if(building.province==""){
					provinceName = getProvinceName(city);
				}
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
				this.myChartObj = Highcharts.mapChart('map', {
				        chart: {
//				            spacingBottom:50,
//				            backgroundColor: 'rgba(240,240,240,.7)'
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
				            minColor: 'rgba(71, 179, 145,0.4)',
//				            maxColor: '#088860',
				            maxColor: '#0a3625',
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
				            	dataLabels: {
				            		enabled:false
				            	},
				            	tooltip:{
				 		        	headerFormat: '',
				 		            pointFormat: '{point.name}<br/> <b>省份:{point.province}<b/><br/><b>城市:{point.city}</b>',
				 		            borderColor:'#47B390'
				 		        },
					            "marker": {
					            	symbol:'circle',//圆点显示  
				                    radius:3,  
				                    lineWidth:1,  
				                    lineColor:'rgba(0,0,0,.5)',  
				                    fillColor:'rgba(255, 255, 255,.5)',  
				                    states:{  
				                        hover:{  
				                        	 fillColor:'rgb(255, 255, 255)', 
				                        	 lineWidth:2,
				                        	 lineColor:'rgb(0,0,0)'
				                        }  
				                    }  
//					            	radius:3,  
//				                    lineWidth:0,  
//				                    lineColor:'rgba(0,0,0,.5)',  
//				                    fillColor:'rgba(13, 77, 52,.5)',  
//				                    states:{  
//				                        hover:{  
//				                        	 fillColor:'rgb(13, 77, 52)', 
//				                        	 lineWidth:2,
//				                        	 lineColor:'rgb(255, 255, 255)'
//				                        }  
//				                    } 

					            }

				            }
				        },
				        series : series
				    });
					//不显示缩放图标
//				    $(".highcharts-map-navigation").css("display","none");
					removeLoading();
			}
		
}