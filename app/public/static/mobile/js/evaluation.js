// 雷达图
function result_ldt(num,data){
	var title,data1,data2,data3;
	if(num==1){
		title = "IEQ雷达图（本城市/本气候区）";
		if(data){
			data1 = data.part1.data.series[0].data; // 当前
			data2 = data.part1.data.series[1].data; // 本省
			data3 = data.part1.data.series[2].data; // 全国
		}
	}else if(num==2){
		title = "满意度投票（-3~3）";
		if(data){
			data1 = data.part2.data.series[0].data;		
			data2 = data.part2.data.series[1].data;
			data3 = data.part2.data.series[2].data;
		}
	}
	
	console.log("雷达图数据：1当前、2本省、3全国");
	console.log(data1);
	console.log(data2);
	console.log(data3);
	// var json = {
    //     chart: {
    //         polar: true,
    //         type: 'line',
    //         backgroundColor:"#3fb493"
    //     },
    //     title: {
    //         text: title,
    //         style:{
    //             color:"#ffffff"
    //         }
    //     },
    //     xAxis: {
    //         categories: ['综合评价','热环境', '空气品质', '光环境', '声环境'],
    //         tickmarkPlacement: 'on',
    //         lineWidth: 0,
    //         gridLineWidth:"3px",
    //         labels: {
    //         	style: { 
    //         		color: "#FFFFFF" ,
    //         		fontSize:"14px"
    //         	}
    //         }
    //     },
    //     yAxis: {
    //         gridLineInterpolation: 'polygon',
    //         lineWidth: 0,
    //         min: 0,
    //         gridLineWidth:"3px",
    //         labels: {
    //         	style: { 
    //         		color: "#FFFFFF" ,
    //         		fontSize:"14px"
    //         	}
    //         }
    //     },
    //     legend: {
	//       	  itemStyle: {
	//       	    color: '#fff',
	//       	    fontSize:'14px',
	//       	    fontWeight:"normal"
	//       	  },
	//       	  layout:"vertical",
    //     },

    //     plotOptions: {
    //         spline: {
    //         	lineColor:"#FFFFFF",
    //         	lineWidth: 1
    //         }
    //     },

    //     tooltip: {
    //         shared: true,
    //         pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.2f}</b><br/>'
    //     },
    //     credits: {
    //         enabled:false
    //     },
    //     series: [{
    //         name: '本建筑',
    //         data: data1,
    //         pointPlacement: 'on',
    //         color:"#af1234"
    //     }, {
    //         name: '同气候区建筑',
    //         data: data2,
    //         pointPlacement: 'on',
    //         color:"#7744de"
    //     },{
    //         name: '全国建筑',
    //         data: data3,
    //         pointPlacement: 'on',
    //         color:"#036df1"
	// 	}]
	// };
	var json = {
		chart: {
            type: 'column',
            backgroundColor: 'rgba(0,0,0,0)',
        },
		title: {
			text: title,
		},
		subtitle: {
			text: "www.ibeem.cn"
		},
		xAxis: {
			categories: ['综合评价','热环境', '空气品质', '光环境', '声环境']
		},
		yAxis: {
			title: {
				text: '^_^'
			}
		},
		tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.2f}</b><br/>'
        },
		series: [{
			name: '本建筑',
			data: data1
		}, {
			name: '同气候区建筑',
			data: data2
		}, {
			name: '全国建筑',
			data: data3
		}]
	};
	console.log(json.series);
	try {
		$('#evaluation_chart').highcharts(json);
	} catch (error) {
		console.log(error)
		console.log('hightcharts error!');
		return -1;
	}
}

// 达标图
function result_dbt(data){
	// var gaugeOptions = {
	//         chart: {
	//             type: 'solidgauge',
	//            // backgroundColor:"#3fb493"
	//         },
	//         title:"达标率",
	//         pane: {
	//             center: ['50%', '50%'],
	//             size: '100%',
	//             startAngle: -90,
	//             endAngle: 90,
	//             background: {
	//                 backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
	//                 innerRadius: '60%',
	//                 outerRadius: '100%',
	//                 shape: 'arc'
	//             }
	//         },
	//         tooltip: {
	//             enabled: false
	//         },
	//         // the value axis
	//         yAxis: {
	//             stops: [
	//                 [0.1, '#55BF3B'], // green
	//                 [0.5, '#DDDF0D'], // yellow
	//                 [0.9, '#DF5353'] // red
	//             ],
	//             lineWidth: 0,
	//             minorTickInterval: null,
	//             tickPixelInterval: 400,
	//             tickWidth: 0,
	//             title: {
	//                 y:50
	//             },
	//             labels: {
	//                 y: 1000 // 超出范围隐藏
	//             }
	//         },
	//         plotOptions: {
	//             solidgauge: {
	//                 dataLabels: {
	//                     y: 0,
	//                     borderWidth: 0,
	//                     useHTML: true
	//                 }
	//             }
	//         }
	//     };
	
		// 0-3为当前 4-7为本省 8-11为全国
		var dbtStr ="<div id='dbt_box'>"+
						"<div style='font-size:14px;text-align:center;color:#ffffff;font-weight:bold'>本建筑达标率</div>" +
						"<div class='dbt_list' id='dbt_chart_0'></div>"+
						"<div class='dbt_list' id='dbt_chart_1'></div>"+
						"<div class='dbt_list' id='dbt_chart_2'></div>"+
						"<div class='dbt_list' id='dbt_chart_3'></div>"+
						"<div style='clear:both; font-size:14px;text-align:center;color:#ffffff;font-weight:bold'>同气候区建筑达标率</div>" +
						"<div class='dbt_list' id='dbt_chart_4'></div>"+
						"<div class='dbt_list' id='dbt_chart_5'></div>"+
						"<div class='dbt_list' id='dbt_chart_6'></div>"+
						"<div class='dbt_list' id='dbt_chart_7'></div>"+
						"<div style='clear:both;font-size:14px;text-align:center;color:#ffffff;font-weight:bold'>全国建筑达标率</div>" +
						"<div class='dbt_list' id='dbt_chart_8'></div>"+
						"<div class='dbt_list' id='dbt_chart_9'></div>"+
						"<div class='dbt_list' id='dbt_chart_10'></div>"+
						"<div class='dbt_list' id='dbt_chart_11'></div>"+
						"<div style='clear:both; margin-bottom:100px;'></div>"+
					"</div>";
					
		$('#evaluation_chart').html(dbtStr);
		//$('#evaluation_chart').after(dbtStr);

		for(var i=0;i<12;i++){
			var titleText = '';
			var dataPer = null;
			if(data){
				titleText = data.part1.data.seriesDBL[i].titleText;
				dataPer = data.part1.data.seriesDBL[i].dataPer;
			}
			console.log(dataPer);
			// var json = Highcharts.merge(gaugeOptions, {
			// 	yAxis: {
			// 		min: 0,
			// 		max: 100,
			// 		title: {
			// 			text: titleText
			// 		}
			// 	},
			// 	credits: {
			// 		enabled: false
			// 	},
			// 	series: [{
			// 		name: titleText,
			// 		data: dataPer,
			// 		dataLabels: {
			// 			format: '<div style="fontsize:12px;color:#777777;text-align:center;"><span>{y:.1f}%</span></div>'
			// 		},
			// 		tooltip: {
			// 			valueSuffix: '%'
			// 		}
			// 	}]
			// 	//series: []
			// });
			var json = {
				chart: {
					type: 'column',
					backgroundColor: 'rgba(0,0,0,0)',
				},
				title: {
					text: '',
				},
				credits: {
					enabled: false
				},
				legend: {
					enabled: false,
				},
				tooltip: {
					//shared: true,
					pointFormat: '<div>{series.name}</div><div style="fontsize:12px;color:#777777;text-align:center;"><span>{point.percentage:.1f}%</span></div>'
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
						   enabled: false           
						},
						showInLegend: false
					 }
				},
				series: [{
					type: 'pie',
					name: titleText,
					data: [
					   ['达标率',   dataPer[0]],
					   ['未达标率', 100 - dataPer[0]]
					]
				 }]
			};
			try {
				$('#dbt_chart_' + i).highcharts(json);
			} catch (error) {
				console.log('hightcharts error!');
				return -1;
			}
		}
}

// 绿建技术
function result_ljjs(){
	
	var img_str = '<div class="swiper-container swiper-container1">'+
				    	'<div class="swiper-wrapper">'+
					        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/lj_img1_'+ $this_ID +'.jpg"></div>'+
					        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/lj_img2_'+ $this_ID +'.jpg"></div>'+
					        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/lj_img3_'+ $this_ID +'.jpg"></div>'+
					        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/lj_img4_'+ $this_ID +'.jpg"></div>'+
					        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/lj_img5_'+ $this_ID +'.jpg"></div>'+
					        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/lj_img6_'+ $this_ID +'.jpg"></div>'+
					    '</div>'+
				    	'<div class="swiper-pagination swiper-pagination1"></div>'+
					'</div>';	
	
	$("#evaluation_chart").html("<div class='evl_title'>本建筑绿色技术体系</div>"+
								"<div class='img_box'>"+ img_str +"</div><br><br>"+
								"<div class='evl_title'>全国绿建技术应用比例</div>"+
								"<div class='img_box'>"+
								"<img src='http://www.ibeem.cn/file/image/evaluation/lj_img7_"+ $this_ID +".jpg'></div>"+
								"<br><br><br><br><br><br>");
	
	var mySwiper = new Swiper ('.swiper-container1', {
		loop: true,
		autoplay : 2000,
		pagination: '.swiper-pagination1',
	   	observer:true,//修改swiper自己或子元素时，自动初始化swiper
	   	observeParents:true//修改swiper的父元素时，自动初始化swiper
	});  
}
// 建筑物性
function result_jzwx(){
	var img_str = '<div class="swiper-container swiper-container2">'+
		'<div class="swiper-wrapper">'+
	        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/jzwx_img1_'+ $this_ID +'.jpg"></div>'+
	        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/jzwx_img2_'+ $this_ID +'.jpg"></div>'+
	        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/jzwx_img3_'+ $this_ID +'.jpg"></div>'+
	        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/jzwx_img4_'+ $this_ID +'.jpg"></div>'+
	        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/jzwx_img5_'+ $this_ID +'.jpg"></div>'+
	        '<div class="swiper-slide"><img src="http://www.ibeem.cn/file/image/evaluation/jzwx_img6_'+ $this_ID +'.jpg"></div>'+
	    '</div>'+
		'<div class="swiper-pagination swiper-pagination2"></div>'+
	'</div>';	
	
	$("#evaluation_chart").html("<div class='img_box'>"+ img_str +"</div><br><br><br><br><br><br>");
	
	var mySwiper = new Swiper ('.swiper-container2', {
		loop: true,
		autoplay : 2000,
		pagination: '.swiper-pagination2',
		observer:true,//修改swiper自己或子元素时，自动初始化swiper
		observeParents:true//修改swiper的父元素时，自动初始化swiper
	});  
}

// 能耗
function result_nh(){
	var img_str_1 = "<img src='http://www.ibeem.cn/file/image/evaluation/jznnh_img1_"+ $this_ID +".jpg'>";	
	var img_str_2 = "<img src='http://www.ibeem.cn/file/image/evaluation/jznnh_img2_"+ $this_ID +".jpg'>";
	var $intro = '';
	
	if($this_ID==93){ //天津
		$intro = "总面积5700m<sup>2</sup><br />年总电耗（实测）27.08万kWh<br />单位面积电耗47.5 kWh/m<sup>2</sup>";
	}else if($this_ID==237){ // 苏州
		$intro = "总面积70690m<sup>2</sup><br />年总电耗（实测）305.5万kWh<br />单位面积电耗43.2 kWh/m<sup>2</sup>";
	}else if($this_ID==101){ // 上海
		$intro = "总面积9992m<sup>2</sup><br />年总电耗（实测）50.9万kWh<br />单位面积电耗50.9 kWh/m<sup>2</sup>";
	}else if($this_ID==291){ // 北京 
		$intro = "总面积30191m<sup>2</sup><br />年总电耗（实测）189.17万kWh<br />单位面积电耗62.7 kWh/m<sup>2</sup>";
	}
	
	$("#evaluation_chart").html("<div class='evl_title'>在同气候区同类建筑中的能耗水平</div>"+
			"<div class='img_box'>"+ img_str_1 +"</div><br><br>"+
			"<div class='evl_title'>在全国同类建筑中的能耗水平</div>"+
			"<div class='img_box'>"+ img_str_2 +"</div><br><br>"+
			"<div style='color:#ffffff;font-size:14px;font-weight:bold;text-align:left;min-height:5rem;'>"+ $intro +"</div>");
}

function changeParam(){
	var order = $(this).attr("order") * 1;
	$("#param_select_index").animate({"left":$(document).width() * (0.1117 + order * 0.1552) + "px"});
	if(isNaN(order)){
		currentParameter = "result_1";
	}else{
		currentParameter  = ["result_1","result_2","result_3","result_4","result_5"][order];
	}
	result_show(currentParameter);
}

function result_show(method){
	
	// $("#dbt_box").remove(); // 去掉达标率图的BOX

	if(method=="result_1"){
		//result_ldt(1,all_data);
		result_dbt(all_data);
	}
	if(method=="result_2"){
		result_ldt(2,all_data);
	}
	if(method=="result_3"){
		result_ljjs();
	}
	if(method=="result_4"){
		result_jzwx();
	}
	if(method=="result_5"){
		result_nh();
	}
}

$(document).ready(function(){ 
	
	addMobileLoading();
	
	// 获取数据源
	$this_ID = localStorage.getItem("device_id");
	
	$.ajax({
		url:"/weixin/device/evaluation",
		type:"POST",
		dataType:"JSON",
		data:{deviceID:$this_ID},
		success:function(data){
			if(data.code==200){
				
				//all_data = eval("("+ data.content +")");
				if(!data.content){
					removeLoading();
					return;
				}
				all_data = JSON.parse(data.content);
				changeParam();
			}else{
				//alert("获取数据失败！");
			}
			removeLoading();
		},
		error:function(error){
			removeLoading();
			//alert("获取数据失败！");
		}
	});

	if(localStorage.getItem("language")=="en"){
		$(".return_to_list_float_btn").addClass("en");
	}	

	var docHeight = $(document).height();
	var docWidth = $(document).width();
	
	$("#param_logo_box").css("width",docWidth * 0.7765);
	$("#param_logo_box").css("height",docHeight * 0.0609);
	$("#param_logo_box").css("left",docWidth * 0.1117);
	$("#param_logo_box").css("top",docHeight * 0.0341);
	
	$(".param_logo").css("width",docWidth * 0.1552);
	$(".param_logo").css("height",docHeight * 0.0608);
	$(".param_logo").css("background-size-y",docHeight * 0.0608);
	
	$("#param_txt_box").css("width",docWidth * 0.7765);
	$("#param_txt_box").css("height",docHeight * 0.0316);
	$("#param_txt_box").css("left",docWidth * 0.1117);
	$("#param_txt_box").css("top",docHeight * 0.1066);
	
	$(".param_txt").css("width",docWidth * 0.1552);
	$(".param_txt").css("height",docHeight * 0.0315);
	
	$("#param_select_line").css("top",docHeight * 0.1418);
	
	$("#param_select_index").css("width",docWidth * 0.1552);
	var his_target = localStorage.getItem("his_target");
	if(his_target != null  && his_target != ""){
		var order = his_target * 1;
		currentParameter  = ["tem","hum","sun","co2","pm25"][order];
		$("#param_select_index").css("left",docWidth * (0.1117 + order * 0.1552));
	}else{
		$("#param_select_index").css("left",docWidth * 0.1117);
	}
	
	
	
	$(".param_logo").click(changeParam);
	
	//$("#current_time_range").css("height",20);
	$("#current_time_range").css("width",docWidth * 0.4);
	$("#current_time_range").css("top",docHeight * 0.18);
	$("#current_time_range").css("left",docWidth * 0.3);
	//$("#current_time_range").css("paddingTop",docHeight * 0.032-10);
	//$("#current_time_range").css("paddingBottom",docHeight * 0.032-10);
	//$("#current_time_range").css("borderRadius",docHeight * 0.032 + 10);
	//$("#current_time_range").css("background-position-x",docWidth * 0.7611);
	//$("#current_time_range").css("background-position-y",(docHeight * 0.0516 - 40)/2);
	
	
	$("#time_range_list").css("width",docWidth * 0.4);
	$("#time_range_list").css("top",docHeight * 0.18);
	$("#time_range_list").css("left",docWidth * 0.3);
	$("#time_range_list").css("height",$("#current_time_range").css("height"));
	$("#time_range_list").css("paddingTop",$("#current_time_range").css("paddingTop"));
	$("#time_range_list").css("paddingBottom",$("#current_time_range").css("paddingBottom"));
	$("#time_range_list").css("borderRadius",$("#current_time_range").css("borderRadius"));
	
	$(".time_range").css("paddingBottom",docHeight * 0.016);
	
	$("#time_range_list div:first-child").css("marginTop","1.5rem");//docHeight * 0.042+15);
	$("#time_range_list div:last-child").css("marginBottom","0.25rem");//docHeight * 0.01);
	
	$("#evaluation_chart").css("top",docHeight * 0.264);
	$("#evaluation_chart").css("height",docHeight * 0.372);
	
	$("#bottom_line").css("top",docHeight * 0.6658);

	
});