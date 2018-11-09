var maxCount = 1;
var data  = {};

var tooltip = d3.select("body").append("div")
.attr("class","tooltip") 
.attr("opacity",0.0);


function updateGeoMap(id,geojson, width, height, center_lat, cent_lon, scale, translatey){ 
    var svg = d3.select("#"+id).html("").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0,"+translatey+")");
    
    var projection = d3.geo.mercator()
              .center([center_lat, cent_lon])
              .scale(scale)
       		.translate([width/2, height/2]);
    
    var path = d3.geo.path()
            .projection(projection);
    
    
    d3.json(geojson, function(error, root) {
      
      if (error) 
        return console.error(error);
      console.log(root.features);
      
      svg.selectAll("path")
        .data( root.features )
        .enter()
        .append("path")
        .attr("stroke","#B7B7B7")
        .attr("stroke-width",1)
        .attr("fill", function(d,i){
          return "#F5F5F5";
        })
        .attr("d", path )
        .on("mouseover",function(d,i){
	          d3.select(this)
	            .attr("fill","green")
	            .attr("fill-opacity",0.4);
        })
        .on("mouseout",function(d,i){
              d3.select(this)
                .attr("fill","#F5F5F5")
                .attr("fill-opacity",1.0);;
         });
  
          updateAiportCircle(svg,projection,data.airports);
        });
}
       
function updateAiportCircle(svg,projection,data){
	var coordinates;
	var i;
	
	for(i = 0; i < data.length; i++){
		coordinates = projection([data[i].latitude,data[i].longtitude]);
		svg.append("circle")
        .attr("cx", coordinates[0])
        .attr("cy", coordinates[1])
        .attr("r",  2+data[i].stationCount * 1.0 / maxCount * 10)
        .attr("bid",data[i].id)
        .attr("title",data[i].name + "<br>" + data[i].description)
        .on('mouseover', function(){
			tooltip.html($(this).attr("title"))
					.style("left",(d3.event.pageX)+"px")
					.style("top",(d3.event.pageY+20)+"px")
					.style("opacity",1.0);
        })
  	    .on('mouseout', function(){
  	    	tooltip.style("opacity",0.0);
  	    })
        .on('click', function(){
          window.location.href = "/page/airport/building/"+$(this).attr("bid");
        });
	}
	/*
    function repeat(){
  	  svg.selectAll("circle")
  	  .transition()
        .duration(300)
        .ease("linear")
        .attr("r",  function(d) { count = (count + 1) % 10; return count; })
        .each("end", repeat);
    }
    repeat();*/
}

function resizeGeoMap(){
	var width, height, scale,translatey;
	
	width = $("#china-map").width();
	height = width * 0.58;
	scale = width * 0.70;
	translatey = width * 0.15;
	updateGeoMap("china-map","static/airport/geojson/china.geojson",width,height,103,28,scale,translatey);
	
//	width = $("#world-map").width();
//	height = width * 0.56;
//	scale = width * 0.14;
//	translatey = width * 0.15;
//    updateGeoMap("world-map","../../../static/geojson/world.geojson",width,height,0,-10,scale,translatey);
}

function resizeRow2(){
	$(".row-2").height(250);//$(".row-2").width() * 0.53
  //$(".row-2").css("font-size",$(".row-2").width() * 0.08);
}


function bindCarame(){
	$('input[name="pic"]').on('change',function() {
	    if(typeof this.files == 'undefined'){
	      return;
	    }
	    var img		 = this.files[0];//获取图片信息
	    var type		 = img.type;//获取图片类型，判断使用
	    var url		 = getObjectURL(this.files[0]);//使用自定义函数，获取图片本地url
	    var fd			 = new FormData();//实例化表单，提交数据使用
	    fd.append('img',img);//将img追加进去
	    if(url)
	      $('.pic_show').attr('src',url).show();//展示图片
	    if(type.substr(0,5) != 'image'){//无效的类型过滤
	      alert('非图片类型，无法上传！');
	      return;
	    }
	    //开始ajax请求，后台用的tp
	    
	    $.ajax({
	      type	 : 'post',
	      url	 : '/upload/image',
	      data	 : fd,
	      processData: false,  // tell jQuery not to process the data  ，这个是必须的，否则会报错
	      contentType: false,   // tell jQuery not to set contentType  
	      dataType : 'text',
	      xhr	 : function() {//这个是重点，获取到原始的xhr对象，进而绑定upload.onprogress
	        var xhr	 = jQuery.ajaxSettings.xhr();
	        xhr.upload.onprogress	 = function(ev) {
	          //这边开始计算百分比
	          var parcent = 0;
	          if(ev.lengthComputable) {
	                    percent = 100 * ev.loaded / ev.total;
	                    percent = parseFloat(percent).toFixed(2);
	                  $('.bgpro').css('width',percent + '%').html(percent + '%');
	          }
	        };
	        return xhr;
	      },
	      success: function (img_url) {
	         //更新设备信息
	    	  buildingImgUrl = img_url;
	      },
	        error:function (XMLHttpRequest, textStatus, errorThrown) 
	        { 
	        	alert(textStatus);
	        }
	    });
	    
	 });

	  
}

function showAirportStationCountChart(cats,wsCountList,hqCountList,co2CountList ){
	$('#buildingStationCountChart').highcharts({
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
            }
        },
        series: [{
            name: '温湿仪布点个数',
            data: wsCountList

        }, {
            name: '黑球仪布点个数',
            data: hqCountList

        }, {
            name: 'CO2仪布点个数',
            data: co2CountList

        }]
    });
}

function showStationCountChair(wsCount,hqCount,co2Count){
	$('#stationCountChart').highcharts({
        chart: {
            type: 'bar'
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

//自定义获取图片路径函数
function getObjectURL(file) {
  var url = null ; 
  if (window.createObjectURL!=undefined) { // basic
    url = window.createObjectURL(file) ;
  } else if (window.URL!=undefined) { // mozilla(firefox)
    url = window.URL.createObjectURL(file) ;
  } else if (window.webkitURL!=undefined) { // webkit or chrome
    url = window.webkitURL.createObjectURL(file) ;
  }
  return url ;
}

function bindAddBuildingBtn(){
	$("#addBuildingBtn").click(function(){
		var buildingName = $("#buildingName").val();
		var buildingDescription = $("#buildingDescription").val();
		var buildingLatitude = $("#buildingLatitude").val() * 1.0;
		var buildingLontitude = $("#buildingLontitude").val() * 1.0;
		
		$.ajax({
	        type: "post",
	        dataType: "json",
	        url: '/airport/addBuilding',
	        data: {
	        	name:buildingName,
	        	description:buildingDescription,
	        	latitude:buildingLatitude,
	        	lontitude:buildingLontitude,
	        	imgUrl:buildingImgUrl
	        },
	        success: function (data) {
	            if (data.status == 0) {
	            	window.location.href = "/page/airport/overview";
	            }
	        },
	        error:function (XMLHttpRequest, textStatus, errorThrown) 
	        { 
	        	alert(textStatus);
	        }});
	});
}

function loadBuildingData(){
	$.ajax({
        type: "post",
        dataType: "json",
        url: '/airport/buildinglist',
        success: function (data) {
            if (data.status == 0) {
            	showOverviewData(data.list);
            	
            }
        },
        error:function (XMLHttpRequest, textStatus, errorThrown) 
        { 
        	alert(textStatus);
        }});
}

function showOverviewData(list){
	var i;
	var listTableContent = "";
	var stationCount = 0;
	var buildingNames = new Array();
	var wsCountList = new Array();
	var hqCountList = new Array();
	var co2CountList = new Array();
	for(i = 0; i < list.length; i++){
		if(list[i].stationCount > maxCount){
			maxCount = list[i].stationCount;
		}
		stationCount += list[i].stationCount;
		
		listTableContent += "<tr><td><a href=\"/page/airport/building/"+list[i].id+"\">"+list[i].name+"</a></td><td>"+(list[i].description == ""?"暂无":list[i].description.substr(0,10))+"</td><td>"+list[i].stationCount+"</td><td>"+list[i].wsCount+"</td><td>"+list[i].hqCount+"</td><td>"+list[i].co2Count+"</td></tr>"
	
		buildingNames.push(list[i].name);
		wsCountList.push(list[i].wsCount);
		hqCountList.push(list[i].hqCount );
		co2CountList.push(list[i].co2Count);
	}
	
	
	
	
	//更新地图
	data.airports = list;
	resizeGeoMap();
	
	//显示列表
	$("#buildingListTable").append(listTableContent);
	
	//显示统计数据：机场航站楼个数和布点个数
	$("#buildingCount").html(list.length);
	$("#stationCount").html(stationCount);
	
	//显示统计数据：各机场布点数目统计
	showAirportStationCountChart(buildingNames,wsCountList,hqCountList,co2CountList);
	
	//显示统计数据：各类布点个数统计
	showStationCountChair(eval(wsCountList.join("+")),eval(hqCountList.join("+")),eval(co2CountList.join("+")))
}

var buildingImgUrl ="";

$(function(){
	resizeRow2();
	bindCarame();
	bindAddBuildingBtn();
	loadBuildingData();
	
	$(window).bind("resize", function(){
		resizeRow2();
		resizeGeoMap();
	});
	
});