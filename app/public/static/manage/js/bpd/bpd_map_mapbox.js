//总气象数据
var buildingData ;
//按zoom分组后数据
var zoomData = {};
//按照来源分组后的数据 {sourceName:{data:[],icon:"",marker:[]},....}
var groupWeatherData = {};
var count =0;
//地图对象
var map;
//用于存放点图标
var iconArr = [];
//用于循环点图标
var imgUrlIndex = 1;
var iconIdArr = {}; 
//数据总长度，用于progressbar
var dataLength;
//数据当前渲染长度，用于progressbar计数
var barCurrCount=1;
//layerObj,layerId,source 对照{source:{layerObj:obj,layerId:100}} 
var layerArr = {}
//控制zoom
var zoomNow = 3;
var zoomMax = 20;
var zoomGroupMax = 10;
var zoomMin = 3;
var distanceArr = [8000000,5000000,3000000,600000,300000,100000,40000,20000,10000,5000]
var mapboxMap = {
		initMapbox:function(){
		    this.getData();
		},
		remove:function(){
			map.remove();
		},
		initMapboxMap:function(list){			
			if(map!=null){
				mapboxMap.remove();
			}
			//渲染地图
			$("#map").height($("#map").parent().parent().height()-50);
		    this.createMap();
		    //添加南海图标
		    $.ajax({
		        type:"get",
		        url:"/static/manage/components/southchinasea.html",
		        async: false,
		        dataType:"html",
		        success:function(result){
		        	$("#southsea_container").html(result);
		        },
		    	error:function(){
		    		alert("显示南海失败！");
				}
		    });
		    map.on('load', function() {
		    	buildingData = list;
				//将数据按照数据来源以及距离分组{sourceName:{data:[],icon:""},....}
				groupingDataBySource();
				
				groupingDataByDistance();
				//按照分组，向页面上放置点
				addPoint();
				//给列表添加点击事件
				addListener();
				removeLoading();
		    })
		},
		getData:function(){
			addLoading("#map_container");
			$this = this;
			$.ajax({
		 		type:"post",
		 		dataType:"json",
		 		url:"/building/gbd/list",
		 		data:{
		 			conditions:globleData_send
		 		},
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
		 					buildingList.push({
		 						location:{
		 							name:building.name,
		 							city:city,
		 							province:prov,
		 							latitude:lat,
		 							longitude:lon,
		 							source:"ibeem"
		 						},
		 						id:building.id
		 					});
		 				}
		 				mapDataArr = buildingList;	 
		 				mapboxMap.initMapboxMap(mapDataArr);
		 			}
		 		},
		 		error:function(data){
		 			removeLoading();
//		 			alert("系统出错")
		 		}
		 	});
		},
		createMap:function(){
			mapboxgl.accessToken = 'pk.eyJ1IjoicWNqayIsImEiOiJjajdpbzV0bjcwNWV4MzNvNnBlMnJsa3NnIn0.UT3Uz_VoMNgh8KI5RYeAQw';
			map = new mapboxgl.Map({ 
			    container: 'map',
			    style: 'mapbox://styles/mapbox/light-v9',
			    attributionControl: false,
			    minZoom:zoomMin,
			    maxZoom:zoomMax,
			    scrollZoom:true,
			    maxTileCacheSize:1000,
			    center: [104.21, 36.42],
			    zoom: zoomNow
			});
			var nav = new mapboxgl.NavigationControl();
			map.addControl(nav, 'top-right');
			var language = new MapboxLanguage();
			map.addControl(language);
//			map.setLayoutProperty('country-label-lg', 'text-field', '{name_zh}');
		}	
}		
//根据不同来源分组
function groupingDataBySource(){
	dataLength = buildingData.length;
	groupWeatherData = {};
	for(var n=0;n<buildingData.length;n++){
		var item = buildingData[n];
		var lat = item.location.latitude;
		var lon = item.location.longitude;
		var sourceStr = item.location.source;
		item.num = 1;
		var source = sourceStr.split(" ")[0];
		var source = source.split("-")[0];
		var source = source.split("/")[0] ;
		if(groupWeatherData[source]==undefined){
			var imgArr = getImgUrl();
			var imgUrl = imgArr[0];
		    var imgUrl_single = imgArr[1];
			layerArr[source] = {layerId:"layer"+n};
			var newItem = {
					data : [item],
					imgUrl : imgUrl,
					imgUrl_single:imgUrl_single,
					layerId:"layer"+n,
			}
			groupWeatherData[source]=newItem;
		}else{
			groupWeatherData[source].data.push(item);
		}
	}
}
//算法，分组
function groupingDataByDistance(){
	//获取zoom
//	var zoom = map.getZoom();
//	zoomData
	
	for(var zoomnum =zoomMin;zoomnum<=zoomMax;zoomnum++){
		if(zoomnum >= zoomGroupMax){
			var str = JSON.stringify(groupWeatherData);
			zoomData["zomm_"+zoomnum] = $.parseJSON(str);
		}else{
			var pointList = [];
			var max_distance = distanceArr[zoomnum]; // 最大距离 （单位：米）
			
			var str = JSON.stringify(groupWeatherData);
			var newGroupWeatherData = $.parseJSON(str); 
			for(var source in groupWeatherData){
				var dataAttr = groupWeatherData[source].data;
				pointList = [];
				for(var n=0;n<dataAttr.length;n++){
					var item = dataAttr[n];
					var lat = item.location.latitude;
					var lon = item.location.longitude;
					var newObj = cloneObj(item)
					newObj.num = 1;
					if(pointList.length==0){
						pointList.push(newObj);
					}else{
						for(var i in pointList){
							var newItem = pointList[i];
							var newlat = newItem.location.latitude;
							var newlon = newItem.location.longitude;
							var dis = getFlatternDistance(lat,lon,newlat,newlon);
							if(dis<max_distance){
								newItem.num = newItem.num+1;
								break;
							}else if(i == (pointList.length-1)){
								pointList.push(newObj);
								break;
							}
						}
					}
				}
				newGroupWeatherData[source].data = pointList;
			}
			zoomData["zomm_"+zoomnum] = newGroupWeatherData;
		}
	}
}

function addList(){
	//去掉分组列表里的loading
	document.getElementById("source_list").innerHTML="";
	//创建列表
	for(var source in groupWeatherData){
		var group = groupWeatherData[source];
		var imgUrl = group.imgUrl;
		//列表添加来源li
		var node=document.createElement("LI");
		var node_img =document.createElement("img");
		node_img.setAttribute("src",imgUrl);
		var node_span =document.createElement("span");
		var textnode=document.createTextNode(source);
		node_span.appendChild(textnode);
		node.appendChild(node_img);
		node.appendChild(node_span);
		node.setAttribute("data-source",source);
		showEle("source_list",node);
	}
	document.getElementById("sourcelist_panel").style.display ="block";
}
function showEle(target,node){
	var targetEle = document.getElementById(target);
	 targetEle.appendChild(node)
	 var classname = node.className+" show";
	 node.className =classname; 
}
function addClass(target,newClassName){
	var classname = target.className+" newClassName";
	target.className =classname; 
}

function addPoint(){
		var popup = new mapboxgl.Popup();
		groupWeatherData = zoomData["zomm_"+zoomNow];
		for(var source in groupWeatherData){
			var group = groupWeatherData[source];
			var data_out = group.data;
			var imgUrl_out = group.imgUrl;
			var imgUrl_single_out = group.imgUrl_single; 
			var layerId_out = group.layerId;
			(function(c,data,imgUrl,imgUrl_single,layerId){
				//判断当前source的图标是否已有	
				
				map.loadImage(imgUrl_single, function(error, image_s) {
					map.addImage('pointsingle'+c, image_s);
					
				map.loadImage(imgUrl, function(error, image) {
			        if (error) throw error;		
			        iconIdArr[c]='point'+c;
			        map.addImage('point'+c, image);
			        var features = getFeatures(c,data);
			        map.addSource(layerId, {
			            "type": "geojson",
			            "data": {
			                "type": "FeatureCollection",
			                "features": features
			            }
			        });
			        map.addLayer({
			            "id": layerId,
			            "type": "symbol",
			            "source": layerId,
			            "layout": {
			            	"icon-image": "{icon}",
			                "text-field": "{count}", 
			                "text-size": 12,
			                "text-font": ["Open Sans Semibold"],
			                "text-offset": [0, -.6],
			                "text-anchor": "top",
			                "icon-size":.6,
			                "icon-allow-overlap":true,
			                "icon-ignore-placement":true
			            },
			            "paint":{
			            	"text-color":"#ffffff",
			            	"text-halo-color":"#F0F0F0"
			            }
			        });
			     // Change the cursor to a pointer when the mouse is over the places layer.
			        map.on('mouseenter',layerId,function (e) {
			            map.getCanvas().style.cursor = 'pointer';
			            if(e.features[0].properties.num==1){
			            	popup.setLngLat(e.features[0].geometry.coordinates)
				            .setHTML(e.features[0].properties.description)
				            .addTo(map);
			            }else{
			            	popup.remove();
			            }
			        });
			        map.on('click',layerId,function (e) {
			            if(e.features[0].properties.num!=1){
			            	map.flyTo({center: e.features[0].geometry.coordinates,zoom:(zoomNow+1)});
			            }else{
			            	map.flyTo({center: e.features[0].geometry.coordinates});
			            }
			        });
			        // Change it back to a pointer when it leaves.
			        map.on('mouseleave',layerId,function (e) {
			            map.getCanvas().style.cursor = '';
			            popup.remove();
			        });
			    });
				})
				
			})(source,data_out,imgUrl_out,imgUrl_single_out,layerId_out);
		}	
		
}
function updatePoint(){
	if(zoomNow == zoomMin){
		$("#southsea_container").show();
	}else{
		$("#southsea_container").hide();
	}
		//TODO
	groupWeatherData = zoomData["zomm_"+zoomNow];
	for(var source in groupWeatherData){
		var group = groupWeatherData[source];
		var data = group.data;
		var layerId = group.layerId;
		var features = getFeatures(source,data);
		console.log("features=========");
		console.log(JSON.stringify(features));
        map.getSource(layerId).setData({
        	"type": "FeatureCollection",
            "features": features
        });
	}	
	
}
function getFeatures(source,data){
	var features = [];
	for(var n=0;n<data.length;n++){
    	var item = data[n];
    	var lat = item.location.latitude;
		var lon = item.location.longitude;
		var id = item.id;
		var name = item.location.name;
//	  	var infoId = item.location.wmo;
		var infoCity = item.location.city;
		var infoProvince = item.location.province;
//		var infoCountry = item.location.country;
		var infoSource = item.location.source;
		var featureItem = { "type": "Feature",
		                    "geometry": {
		                        "type": "Point",
		                        "coordinates": [lon, lat]
		                    },
		                    "properties": {
		                        "count": item.num==1?"":item.num,
		                        "iconsize":item.num==1?.2:1.5,
		                        "icon":item.num==1?('pointsingle'+source):('point'+source),
		                        "num":item.num,
		                        "description":'<div class="myInfoWindow">'+
		                          '<span class="name">建筑名：'+name+'</span><br>'+
								  '<span class="province">省份：'+infoProvince+'</span><br>'+
								  '<span class="city">城市：'+infoCity+'</span><br>'+
//								  '<span class="source">来源：'+infoSource+'</span><br>'+
								  '<span class="lon">经度：'+lon+'</span><br>'+
								  '<span class="lat">纬度：'+lat+'</span><br>'+
//								  '<button id="redirectToChart" class="redirectToChart" onclick="window.open(\'/views/chart.jsp?id='+id+'\');" >查看数据</button>'+
								  '</div>'
		                    }
						  }
		features.push(featureItem);
    }
	return features;
}
function getImgUrl(){
	//目前做了N种颜色的点，如果超出了，从头开始循环
	var N = 13;
	var urlStr = "/public/static/manage/img/markers_u/markers_"+imgUrlIndex+".png";
	var urlStr_single = "/public/static/manage/img/markers_u/markers_"+imgUrlIndex+"_single.png";
//	if(imgUrlIndex==N){
//		imgUrlIndex=1;
//	}else{
//		imgUrlIndex++;
//	}
	return [urlStr,urlStr_single];
}
function updateWhenZoom(){
	var zoom = map.getZoom();
	if(Math.round(zoom)!=zoomNow){
		zoomNow = Math.round(zoom);
		updatePoint();
	}
}
function addListener(){
	if($(window).width()<750){
		$(".sourcetitle").click(function(){
			$("#source_list").slideToggle();
		})
	}
//	$('body').mousewheel(function(event, delta) {
//        var dir = delta > 0 ? 'Up' : 'Down';
//        if (dir == 'Up') {
//            console.log('向上滚动');
//        } else {
//            console.log('向下滚动');
//        }
//        return false;
//
//    });
	map.on('zoom',function() {
		
		throttle(updateWhenZoom);
    });
	
	console.log("zoom:"+map.getZoom());
	$("#source_list").on("click","li",function(){
		//点击后隐藏对应点
		if($(this).hasClass("show")){
			$(this).removeClass("show");
			$(this).addClass("hide");
		}else{
			$(this).removeClass("hide");
			$(this).addClass("show");
		}
		var source = $(this).data("source");
		var layerItem = layerArr[source];
		var id = layerItem.layerId;
		var visibility = map.getLayoutProperty(id, 'visibility');
        if (visibility == undefined || visibility === 'visible') {
            map.setLayoutProperty(id, 'visibility', 'none');
        } else {
            map.setLayoutProperty(id, 'visibility', 'visible');
        }
	});
	//弹出框关闭
//	$("#map").on("mouseout",".mapboxgl-popup",function(){
//		$(this).remove();
//	})
}


function ajax(options) {
    options = options || {};
    options.type = (options.type || "GET").toUpperCase();
    options.dataType = options.dataType || "json";
    var params = formatParams(options.data);

    //创建 - 非IE6 - 第一步
    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
    } else { //IE6及其以下版本浏览器
        var xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    //接收 - 第三步
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if (status >= 200 && status < 300) {
                options.success && options.success(xhr.responseText, xhr.responseXML);
            } else {
                options.fail && options.fail(status);
            }
        }
    }

    //连接 和 发送 - 第二步
    if (options.type == "GET") {
        xhr.open("GET", options.url + "?" + params, true);
        xhr.send(null);
    } else if (options.type == "POST") {
        xhr.open("POST", options.url, true);
        //设置表单提交时的内容类型
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(params);
    }
}
//格式化参数
function formatParams(data) {
    var arr = [];
    for (var name in data) {
        arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
    }
    arr.push(("v=" + Math.random()).replace(".",""));
    return arr.join("&");
}
//节流函数
function throttle(method, context) {
	console.log("zoomNow in throttle:"+zoomNow);
	  //清除执行函数的定时器，第一次进入为空
	  clearTimeout(method.tId); 
	  //设置一个100ms后在指定上下文中执行传入的method方法的定时器。
	  method.tId = setTimeout(function () {
	    method.call(context);
	  }, 100);
	}
/***********************   经纬度距离计算设备数量 *******************/
 function getRad(d){
     return d * Math.PI/180.0;
 }  
 
function getFlatternDistance(lat1,lng1,lat2,lng2){
     var f = getRad((lat1 + lat2)/2);
     var g = getRad((lat1 - lat2)/2);
     var l = getRad((lng1 - lng2)/2);  
       
     var sg = Math.sin(g);  
     var sl = Math.sin(l);  
     var sf = Math.sin(f);  
       
     var s,c,w,r,d,h1,h2;  
     var a = 6378137.0;  // EARTH_RADIUS 地球半径
     var fl = 1/298.257;  
       
     sg = sg*sg;  
     sl = sl*sl;  
     sf = sf*sf;  
       
     s = sg*(1-sl) + (1-sf)*sl;  
     c = (1-sg)*(1-sl) + sf*sl;  
       
     w = Math.atan(Math.sqrt(s/c));  
     r = Math.sqrt(s*c)/w;  
     d = 2*w*a;  
     h1 = (3*r -1)/2/c;  
     h2 = (3*r +1)/2/s;  
    
     distanceResult = d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));
     return distanceResult;
 } 
	/*********************** 经纬度距离计算  *********************/
function cloneObj (obj) {  
    var newObj = {};  
    if (obj instanceof Array) {  
        newObj = [];  
    }  
    for (var key in obj) {  
        var val = obj[key];  
        //newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。  
        newObj[key] = typeof val === 'object' ? cloneObj(val): val;  
    }  
    return newObj;  
};  