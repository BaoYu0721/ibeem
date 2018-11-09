//=======全局变量=========
var myChart = {
		histogram_chart_x:null,
		histogram_chart_y:null,
		histogram_chart:null,
		scatter_chart_filter:null,
		scatter_chart_x:null,
		scatter_chart_y:null,
		scatter_chart:null,
		num:10,
		allData:null,
		allData_scatter:null
}
var xAxisUnit = {
		jzmj : "平方米"
}
//文本的列表
var textArr = ["sf","qhq","xj","jzsj","jzlx","jdcs","jncs","jscs","jccs","snhj"];
//所有列表
var allDropdownArr ={ 
		"sf":"省份",
		"qhq":"气候区",
//		"syrs":"使用人数",
		"jzsj":"建造时间",
//		"rzsj":"认证时间",
		"xj":"星级",
		"jzlx":"建筑类型",
		"jzmj":"建筑总面积",
//		"dwpjdh":"单位平均电耗",
//		"dwrymd":"单位人员密度",
		"jn":"节能率",
		"js":"节水率",
		"co2jp":"CO2减排率",
		"rdqd":"热岛强度",
		"kzsnylyl":"可再生能源利用率",
		"fctsylyl":"非传统水源利用率",
		"kzsxhcllyl":"可再生循环材料利用率",
		"kzslycllylsz":"可再生利用材料利用率数值",
		"jdcs":"节地措施",
		"jncs":"节能措施",
		"jscs":"节水措施",
		"jccs":"节材措施",
		"snhj":"室内环境"};

$(function() {
	initUI();
	initEvent();
	getData();
});
function initUI(){
	//初始化下拉	
	$(".wrapper-demo>.default_dropdown>.dropdown").each(function(){
		$(this).empty();
		for(var i in allDropdownArr){
			$(this).append('<li><a data-val="'+i+'">'+allDropdownArr[i]+'</a></li>');
		}
	})
	//初始化下拉默认值	
	//---直方图，X默认为省份
	$("#chart_item_1 #dd1").data("val","sf");
	$("#chart_item_1 #dd1>span").html(allDropdownArr["sf"]);
	//---散点图，Y默认为节地措施
	$("#chart_item_2 #dd").data("val","jdcs");
	$("#chart_item_2 #dd>span").html(allDropdownArr["jdcs"]);
	//---散点图，X默认为省份
	$("#chart_item_2 #dd1").data("val","sf");
	$("#chart_item_2 #dd1>span").html(allDropdownArr["sf"]);
}
function initEvent(){//=====初始化事件=====
	$(".main_box").on("click",".hide-btn",function(){
		$(this).parent().next().slideUp();
		$(this).parent().addClass("show");
	})
	$(".main_box").on("click",".show-btn",function(){
		$(this).parent().next().slideDown();
		$(this).parent().removeClass("show");
	});
	initDropdown();
};
//=====获取数据=====
function getData(){
	addLoading("#chart_item_1>.bottom",1);
	//获取直方图数据
	$.ajax({
		url:"/building/gbd/statistical",
		type:"POST",
		data:{
			number:myChart.num,
			conditions:""
		},
		success:function(response){
			removeLoading("#chart_item_1>.bottom");
 			if(response.code == '200'){
 				showChart("Histogram",response);		 					
 			}
		},
		error:function(data){
			removeLoading("#chart_item_1>.bottom");
// 			alert("系统出错")
 		}
	});
	addLoading("#chart_item_2>.bottom",1);
	//获取散点图数据
	$.ajax({
		url:"/building/gbd/scatter",
		type:"POST",
		data:{
			conditions:""
		},
		success:function(response){
			removeLoading("#chart_item_2>.bottom");
 			if(response.code == '200'){
 				showChart("Scatter",response);		 					
 			}
		},
		error:function(data){
			removeLoading("#chart_item_2>.bottom");
// 			alert("系统出错")
 		}
	});
//	initTextScatter();
}
//=====显示直方图总方法=====
function showChart(type,response){
	//首先更新选项类别	
	updatePara();
	if(type == "Histogram"){
		if(!tools.isNull(response)){
			//更新总条数
			var count= response.data.count;
			$("#num>span").html(count);
		}
		//格式化数据		
		getHistogramData(response);
		//先清空图表
		if(myChart.histogram_chart!=undefined && myChart.histogram_chart.options!=undefined){
			myChart.histogram_chart.destroy();
		}
		$("#chart").html('');
		//显示图表		
		showHistogramChart();
	}else if(type == "Scatter"){
		//格式化数据		
		getScatterData(response);
		//先清空图表
		if(myChart.scatter_chart!=undefined && myChart.scatter_chart.options!=undefined){
			myChart.scatter_chart.destroy();
		}
		//清空筛选用图表
		if(myChart.scatter_chart_filter!=undefined && myChart.scatter_chart_filter.options!=undefined){
			myChart.scatter_chart_filter.destroy();
		}
		$("#chart1").html('');
		$("#chart1_filter").html('');
		//显示图表		
		showScatterChart();
	}
}
//=====显示直方图=====
function showHistogramChart(){
	//判断y是什么类型，获取数据
	if(!tools.isNull(myChart.allData[myChart.histogram_chart_x])){
		if(myChart.allData[myChart.histogram_chart_x].valArr.length==0
			||
			myChart.allData[myChart.histogram_chart_x].valArr[0]==null
		){//无数据
			$("#chart").html('<div class="blank">没有数据</div>')
		}else if(myChart.allData[myChart.histogram_chart_x].fdFlag){
			initHistogram(myChart.allData[myChart.histogram_chart_x]);
		}else{
			initColumn(myChart.allData[myChart.histogram_chart_x]);
		}
	}else{
		//无数据
		$("#chart").html('<div class="blank">没有数据</div>')
	}
}
//=====显示散点图=====
function showScatterChart(){
	//x，y
	var x = myChart.scatter_chart_x;
	var y = myChart.scatter_chart_y;
	var list = myChart.allData_scatter;
	var data = [];
	//初始化变量
	var x_categories = null;
	var y_categories = null;
	//有四种情况
	//1)x,y都是数值
	if($.inArray(x, textArr)==-1 && $.inArray(y, textArr)==-1){
		//整理每个点数据，拼出data即可
		for(var i in list){
			var item = list[i];
			var thisData = [];
			if(!tools.isNull(item[x]) && !tools.isNull(item[y])){
				thisData.push(item[x]);
				thisData.push(item[y]);
				data.push(thisData);
			}
			
		}
	}
	//2)x数值，y文本
	else if($.inArray(x, textArr)==-1 && $.inArray(y, textArr)!=-1){
		//y拼出categories,data:{x:1,y:1},y值为索引
		//先拼出y的categories
		y_categories = [];
		for(var i in list){
			var item = list[i];
			if(!tools.isNull(item[x]) && !tools.isNull(item[y])){
				var y_Arr = item[y];
				for(var j in y_Arr){
					var thisData = {};
					thisData.x=item[x];
					if($.inArray(y_Arr[j], y_categories)!=-1){
						thisData.y=$.inArray(y_Arr[j], y_categories);
					}else{
						y_categories.push(y_Arr[j]);
						thisData.y = y_categories.length-1;
					}
					data.push(thisData);
				}
			}
		}
	}
	//3)x文本，y数值
	else if($.inArray(x, textArr)!=-1 && $.inArray(y, textArr)==-1){
		//x拼出categories,data:{x:1,y:1},x值为索引
		//先拼出x的categories
		x_categories = [];
		for(var i in list){
			var item = list[i];
			if(!tools.isNull(item[x]) && !tools.isNull(item[y])){
				var x_Arr = item[x];
				for(var j in x_Arr){
					var thisData = {};
					thisData.y=item[y];
					if($.inArray(x_Arr[j], x_categories)!=-1){
						thisData.x=$.inArray(x_Arr[j], x_categories);
					}else{
						x_categories.push(x_Arr[j]);
						thisData.x = x_categories.length-1;
					}
					data.push(thisData);
				}
			}
		}
	}
	//4)x文本，y文本
	else{
		//x，y拼出categories,data:{x:1,y:1,marker:{radius:8}}	
		x_categories = [];
		y_categories = [];
		var temp_data = {};
		var max_num = 1;
		var min_radius = 5;
		var max_radius = 20;
		for(var i in list){
			var item = list[i];
			var thisData = {};
			if(!tools.isNull(item[x]) && !tools.isNull(item[y])){
				var x_Arr = item[x];
				var y_Arr = item[y];
				//x，y拼出categories
				for(var n in x_Arr){
					for(var m in y_Arr){
						if($.inArray(x_Arr[n], x_categories)!=-1){
							thisData.x=$.inArray(x_Arr[n], x_categories);
						}else{
							x_categories.push(x_Arr[n]);
							thisData.x = x_categories.length-1;
						}
						if($.inArray(y_Arr[m], y_categories)!=-1){
							thisData.y=$.inArray(y_Arr[m], y_categories);
						}else{
							y_categories.push(y_Arr[m]);
							thisData.y = y_categories.length-1;
						}
						var index_str = thisData.x+"-"+thisData.y;
						//统计当前组合的个数				
						if(temp_data[index_str] ==null){
							temp_data[index_str] = {
									x:thisData.x,
									y:thisData.y,
									num:1
							}
						}else{
							temp_data[index_str].num +=1;
							//获取当前最大的数量
							if(temp_data[index_str].num>max_num){
								max_num = temp_data[index_str].num;
							}
						}
					}
				}
			}
		}
		for(var i in temp_data){
			data.push({
				x:temp_data[i].x,
				y:temp_data[i].y,
				marker:{
					radius:parseInt((temp_data[i].num)/max_num*(max_radius-min_radius))+min_radius
				},
				num:temp_data[i].num
			})
		}
	}
	if(data.length==0){
		$("#chart1").html('<div class="blank">没有数据</div>')
	}else{
		var data_final ={
				data:data,
				x:x,
				y:y
		} 
		initScatter(data_final,x_categories,y_categories);
	}
}
//=====整理直方图数据=====
function getHistogramData(response){
	if(!tools.isNull(response)){//如果不为空，那么重新格式化并更新数据
		myChart.allData = response.data;
		
		//整理数据
		for(var para in myChart.allData){
			var thisParaData = myChart.allData[para];
			var valArr = [];
			var percentArr = [];
			var categories = [];
			var fdFlag = false;
			
			if(para=="jzsj"){
				for(var i=0;i<thisParaData.length;i++){
					//把时间变为年份格式
					thisParaData[i][2] = tools.getLocalTime(thisParaData[i][2]);
					thisParaData[i][3] = tools.getLocalTime(thisParaData[i][3]);
				}
				for(var i=0;i<thisParaData.length-1;i++){
					if(thisParaData[i][0]==null)continue;
					//判断后一个年份是否大于前一个年份
					if(thisParaData[i][3] == thisParaData[i][2]){
						thisParaData[i][0] = thisParaData[i][0]+thisParaData[i+1][0];
						thisParaData[i][1] = thisParaData[i][1]+thisParaData[i+1][1];
						thisParaData[i][3] = thisParaData[i+1][3];
						thisParaData.splice(i+1,1);
						i--;
					}
				}
			}
			for(var i in thisParaData){
				valArr.push(thisParaData[i][0]);
				percentArr.push(thisParaData[i][1]);
				categories.push(formatXAxis(thisParaData[i][2],para));
				
				if(i==(thisParaData.length-1)){
					if(thisParaData[i].length==4){//说明是分段的
						fdFlag = true;
						valArr.push(null);
						percentArr.push(null);
						categories.push(formatXAxis(thisParaData[i][3],para));
//						categories.push(thisParaData[i][3]);
					}
				}
			}
			myChart.allData[para] = {
					valArr:valArr,
					percentArr:percentArr,
					categories:categories,
					fdFlag:fdFlag
			};
		}
	}
}
//=====整理散点图数据=====
function getScatterData(response){
	if(!tools.isNull(response)){//如果不为空，那么重新格式化并更新数据
		myChart.allData_scatter = response.list;
		var newAllData_scatter = [];
		var newTimeArr = [];
		for(var i in myChart.allData_scatter){
			var building = myChart.allData_scatter[i];
			//建筑时间转为年份	
			if(!tools.isNull(building.jzsj)){
				building.jzsj = tools.getLocalTime(building.jzsj);
			}
			//将list中文本字段都格式化为数组（字符串变为长度为1的数组）
			for(var j in building){
				var val = building[j];
				if(!tools.isNull(val) && $.inArray(j, textArr)!=-1){
					if(!tools.isArray(val)){
						building[j] = [val];
					}
				}
			}
			if(newAllData_scatter.length==0){
				newAllData_scatter.push(building);
				newTimeArr.push(building.jzsj);
			}else{
				//按照建筑时间排序,将建筑数据按照时间从小到大顺序插入新数组
				if(tools.isNull(building.jzsj)){
					newAllData_scatter.push(building);
					newTimeArr.push(building.jzsj);
				}else{
					for(var j =0;j<newAllData_scatter.length;j++){
						if(!tools.isNull(newAllData_scatter[j].jzsj) && newAllData_scatter[j].jzsj>=building.jzsj){
							newAllData_scatter.splice(j, 0, building);  
							newTimeArr.push(building.jzsj);
							break;
						}			
						if(j == newAllData_scatter.length-1){
							newAllData_scatter.splice(0, 0, building);
							newTimeArr.push(building.jzsj);
							break;
						}
					}
				}
			}
		}
		myChart.allData_scatter = newAllData_scatter;
	}
}
//=====格式化X轴数据（定制单位）=====
function formatXAxis(xAxis,type){
	if(type=="jzmj"){//建筑面积，面积以万为单位
		var x = xAxis;
		//小数点后保留两位
		x = tools.toDecimal(x);
		//给数字加单位
		x = tools.decimalAddUnit(x);
		return  x;
	}else if(type=="jzsj"){//建造时间加上'年'
		return xAxis+"年";
	}else if(type=="rdqd"){//热岛强度
		return tools.toDecimal(xAxis);
	}else if(type=="jn"){//节能率，变为百分比
		return tools.toPercent(xAxis);
	}else if(type=="js"){//节水率，变为百分比
		return tools.toPercent(xAxis);
	}else if(type=="co2jp"){//CO2减排，变为百分比
		return tools.toPercent(xAxis);
	}else if(type=="kzsnylyl"){//可再生能源利用率，变为百分比
		return tools.toPercent(xAxis);
	}else if(type=="fctsylyl"){//非传统水源利用率，变为百分比
		return tools.toPercent(xAxis);
	}else if(type=="kzsxhcllyl"){//可再生循环材料利用率，变为百分比
		return tools.toPercent(xAxis);
	}else if(type=="kzslycllylsz"){//可再生利用材料利用率数值，变为百分比
		return tools.toPercent(xAxis);
	}else{
		return xAxis;
	}
}
//=====更新x，y=====
function updatePara(){
	myChart.histogram_chart_y = $("#chart_item_1 #dd").data("val");
	myChart.histogram_chart_x = $("#chart_item_1 #dd1").data("val");
	myChart.scatter_chart_y = $("#chart_item_2 #dd").data("val");
	myChart.scatter_chart_x = $("#chart_item_2 #dd1").data("val");
}
//=====初始化分段直方图=====
function initHistogram(paramdata){
	//根据X轴选项判断显示什么数据	
	var data;
	if(myChart.histogram_chart_y=="bfb"){
		data = paramdata.percentArr;
	}else if(myChart.histogram_chart_y=="sl"){
		data = paramdata.valArr;
	}
	var categories = paramdata.categories;
//	var data = [5,10,50,80,130,200,190,160,120,100,80,50,70,10,20];
//	var categories = [300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700];
	 myChart.histogram_chart = Highcharts.chart('chart', {
	    title: {
	        text: ''
	    },
	    chart: {
	        height: '300'  
	    },
	    legend: {
	        enabled: true
	    },
	    credits: {
	        enabled: false  
	    },
	    xAxis: [{
//	    			type: 'datetime',
			        title: { text: '' },
			        categories:categories,
			    	tickColor: 'transparent'
	    }],
	    yAxis: [{
	        title: { text: '' },
	        labels: {//y轴刻度文字标签  
                formatter: function () {  
                	if(myChart.histogram_chart_y=="bfb"){
                		return (this.value*100) + '%';//y轴加上%  
                	}
                	else{
                		return this.value;
                	}
                }  
            }
	    }],
	    series: [{
	        name: '筛选数据',
	        type: 'histogram',
	        animation: {
	            duration: 500
	        },
	        binWidth:0.2,
	        borderRadius:3,
	        borderColor:'transparent',
//	        colors:['#47B391','#36ceb9','#47B391','#36ceb9','#47B391','#36ceb9'],
	        // colorIndex:0,
	        // colorByPoint:true,
	        color: "#36ceb9",
	        // cursor:'pointer',
	        // dashStyle:'LongDashDotDot',
	        // enableMouseTracking:false,
	        groupPadding:0.05,
	        // maxPointWidth: 50,
	        // minPointLength:1,
	        showInLegend:false,
	        states: {
	            hover: {
	                brightness: -0.1 // darken
	            }
	        },
	        shadow:{ 
	            color:'#F0F0F0',
	            offsetX:1,
	            offsetY:1,
	            opacity:1,
	            width:2
	        },
	        tooltip: {
//	            pointFormat: '{series.name}<br>区间：{series.xAxis.categories[{point.x}]}-{series.xAxis.categories[{point.x}+1]}: <b>{point.y}</b><br/>',
//	            formatter: function () {
////	            	return this.series.name + 
////	            	"区间："+categories[this.x]+"-"+categories[this.x+1]+" :"+this.y
//	            	return this.x+":"+this.y;
//	            	
//	            },
	            pointFormatter:function(){
	            	return "区间:"+categories[this.x]+"-"+categories[this.x+1]+
	            	(myChart.histogram_chart_y=="sl"?" 数量为:":" 百分比为:")+
	            	(myChart.histogram_chart_y=="sl"?this.y:tools.toPercent(this.y))
	            	
	            },
	            valueSuffix: ' count',
	            
	            shared: true
	        },
	        data: data,
//	        pointInterval: 5,
	        zIndex: -1,
//	        pointStart: Date.UTC(2016,12),
//	        pointIntervalUnit: 'month',
	    }]
	});
//	 //这里有一个补充操作，因为直方图在使用xAxis传入x轴数据的时候，最后一个x轴数据不显示
//	 //所以修改成，数值数组补充一个空值放在最后，然后渲染完图表之后，把最后一列宽度设置为0	 
//	 myChart.histogram_chart.series[0].data[data.length-1].pointWidth=1;
//	 myChart.histogram_chart.series[0].data[data.length-1].shapeArgs.width=1;
//	 myChart.histogram_chart.redraw();
//	 ....不好使，就不用了，记录一下得了
}
//=====初始化不分段柱状图=====
function initColumn(paramdata){
	//根据X轴选项判断显示什么数据	
	var data;
	if(myChart.histogram_chart_y=="bfb"){
		data = paramdata.percentArr;
	}else if(myChart.histogram_chart_y=="sl"){
		data = paramdata.valArr;
	}
	var categories = paramdata.categories;
	//给数据排序,冒泡
	for(var i=data.length;i>0;i--){
		for(var j=0;j<i-1;j++){
			if(data[j]<data[j+1]){
				var temp = data[j];
				data[j] = data[j+1];
				data[j+1] = temp;
				
				var temp = categories[j];
				categories[j] = categories[j+1];
				categories[j+1] = temp;
			}
		}
	}
//	var data = [5,10,50,80,130,200,190,160,120,100,80,50,70,10,20];
//	var categories = [300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700];
	 myChart.histogram_chart = Highcharts.chart('chart', {
	    title: {
	        text: ''
	    },
	    chart: {
	        height: '300'  
	    },
	    legend: {
	        enabled: true
	    },
	    credits: {
	        enabled: false  
	    },
	    xAxis: [{
			        title: { text: '' },
			        categories:categories,
			    	tickColor: 'transparent'
	    }],
	    yAxis: [{
	        title: { text: '' },
	        labels: {//y轴刻度文字标签  
                formatter: function () {  
                	if(myChart.histogram_chart_y=="bfb"){
                		return (this.value*100) + '%';//y轴加上%  
                	}
                	else{
                		return this.value;
                	}
                }  
            }
	    }],
	    series: [{
	        name: '筛选数据',
	        type: 'column',
	        animation: {
	            duration: 500
	        },
//	        binWidth:0.2,
	        borderRadius:3,
	        borderColor:'transparent',
//	        colors:['#47B391','#36ceb9','#47B391','#36ceb9','#47B391','#36ceb9'],
	        // colorIndex:0,
	        // colorByPoint:true,
	        color: "#36ceb9",
	        // cursor:'pointer',
	        // dashStyle:'LongDashDotDot',
	        // enableMouseTracking:false,
	        groupPadding:0.05,
	        // maxPointWidth: 50,
	        // minPointLength:1,
	        showInLegend:false,
	        states: {
	            hover: {
	                brightness: -0.1 // darken
	            }
	        },
	        shadow:{ 
	            color:'#F0F0F0',
	            offsetX:1,
	            offsetY:1,
	            opacity:1,
	            width:2
	        },
	        tooltip: {
	            pointFormatter:function(){
	            	return (myChart.histogram_chart_y=="sl"?" 数量为:":" 百分比为:")+
	            	(myChart.histogram_chart_y=="sl"?this.y:tools.toPercent(this.y));
	            },
	            valueSuffix: ' count',
	            
	            shared: true
	        },
	        data: data,
//	        pointInterval: 5,
	        zIndex: -1,
	    }]
	});
}
function initScatter(data,xCategories,yCategories){
	//根据Y轴数组长度，确定height，1长度==35px
	var min_height = 400;
	var height = min_height;
	if(!tools.isNull(yCategories)){
		height = yCategories.length*25>min_height?yCategories.length*25:min_height;
	}
	//只有有面积时需要缩放
	var zoomType = "";
	if(data.x == "jzmj" && data.y!="jzmj"){
		zoomType = "x";
	}else if(data.x != "jzmj" && data.y=="jzmj"){
		zoomType = "y";
	}else if(data.x == "jzmj" && data.y=="jzmj"){
		zoomType = "xy";
	}
	var options = {
        chart: {
            type: 'scatter',
            zoomType: zoomType,
            height: height
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        credits: {
	        enabled: false  
	    },
        xAxis: {
            title: {
                enabled: true,
                text: ''
            },
//            showFirstLabel:false,
//            showLastLabel:false,
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            labels:{
					formatter: function () {
	                    return formatXAxis(this.value,data.x);
	                }
            },
        },
        yAxis: {
            title: {
                text: ''
            },
//            showFirstLabel:false,
//            showLastLabel:false,
            labels:{
				formatter: function () {
					var yAxixStr = formatXAxis(this.value,data.y);
					if(tools.isString(yAxixStr)){
						if(yAxixStr.length>12){
							yAxixStr = yAxixStr.substring(0,12)+"..";
						}
					}
					return yAxixStr;
                }
            }
        },
        legend: {
        	enabled:false
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>'
                }
            }
        },
        series: [{
            name: '筛选数据',
            turboThreshold:4000,
            color: 'rgba(223, 83, 83, .5)',
            data: data.data
        }]
    }
	//x,y轴显示数据整理
	if(!tools.isNull(xCategories)){
		options.xAxis.categories = xCategories;
	}
	if(!tools.isNull(yCategories)){
		options.yAxis.categories = yCategories;
	}
	//改变鼠标浮动显示
	options.plotOptions.scatter.tooltip.pointFormatter=function(){
		var xAxisVal = this.x;
		var yAxisVal = this.y;
		var pointNum = this.num;
		if($.inArray(data.x, textArr)!=-1){
			//	如果x轴是文字，x显示为对应的文字
			xAxisVal = xCategories[this.x];
		}
		if($.inArray(data.y, textArr)!=-1){
			//	如果y轴是文字，y显示为对应的文字
			yAxisVal = yCategories[this.y];
		}
		tooltipPointStr =allDropdownArr[data.x]+':'+formatXAxis(xAxisVal,data.x)+'<br/>'+allDropdownArr[data.y]+':'+formatXAxis(yAxisVal,data.y); 
		//如果x，y都是文字，还要额外显示数量
		if(pointNum!=null){tooltipPointStr+="<br/>数量:"+pointNum}
		return tooltipPointStr;
	};
	myChart.scatter_chart = Highcharts.chart('chart1',options);
	//生成建筑面积过滤图表，并且过滤原图表数据	
	if(data.x == "jzmj" || data.y=="jzmj"){
		initMasterChart("chart1_filter",zoomType,data);
	}
}
function initMasterChart(ele,xory,data){
	var options = {
	        chart: {
	        	type: 'scatter',
	        	height:100,
	            reflow: false,
	            borderWidth: 0,
	            backgroundColor: null,
	            marginLeft: 50,
	            marginRight: 20,
	            //x轴可以拖动缩放
	            zoomType: xory,
	            inverted:false,
	            events: {
	                selection: function (event) {
	                    // 选中x区域
	                    var extremesObject = event[xory+"Axis"][0],
	                        // 最小值
	                        min = extremesObject.min,
	                        // 最大值
	                        max = extremesObject.max,
	                        detailData = [],
	                        // x轴数据
	                        xAxis = this[xory+"Axis"][0];
	                    // reverse engineer the last part of the data
	                    var yArr = [];
	                    $.each(this.series[0].data, function () {
	                        //把符合选中区域的数值放入detailData
	                        if (this[xory] > min && this[xory] < max) {
	                            detailData.push([this.x, this.y]);
	                            if(xory=="x" && textArr.indexOf(data.y)!=-1){//面积是x轴，y轴还是文字项的时候
	                            	if(yArr.indexOf(this.y)==-1){
		                            	yArr.push(this.y);
		                            }
	                            }
	                            
	                        }
	                    });
	                    // move the plot bands to reflect the new detail span
	                    xAxis.removePlotBand('mask');
	                    xAxis.addPlotBand({
	                        id: 'mask',
	                        from: min,
	                        to: max,
	                        color: 'rgba(0, 0, 0, 0.2)'
	                    });
	                    if(detailData.length==0){
	                    	if($("#chart1>.blank").length>0){
	                    		$("#chart1>.highcharts-container").hide();
	                    		$("#chart1>.blank").show();
	                    	}else{
	                    		$("#chart1>.highcharts-container").hide();
	                    		$("#chart1").append('<div class="blank">没有数据</div>');
	                    	}
	                    }else{
	                    	$("#chart1>.blank").hide();
	                    	$("#chart1>.highcharts-container").show();
	                    }
	                    //根据Y轴数组长度，确定height，1长度==35px
	                	var min_height = 400;
	                	var height = min_height;
	                	if(!tools.isNull(yArr)){
	                		height = yArr.length*25>min_height?yArr.length*25:min_height;
	                	}
	                	if(height!=$("#chart1>.highcharts-container").height()){
	                		myChart.scatter_chart.setSize(undefined,height);
	                	}
	                    myChart.scatter_chart.series[0].setData(detailData);
	                    return false;
	                }
	            }
	        },
	        title: {
	            text: ""
	        },
	        xAxis: {
	            title: {
	                text: "建筑总面积筛选"
	            },
	            labels:{
					formatter: function () {
	                    return formatXAxis(this.value,"jzmj");
	                }
	            },
	            lineWidth:1,
                tickWidth:1,
	            gridLineWidth:0
	        },
	        yAxis:{
	                gridLineWidth: 0,
	                labels: {
	                    enabled: false
	                },
	                title: {
	                    text: null
	                },
	                lineWidth:0,
	                tickWidth:0,
	                showFirstLabel: false
	         },
	        tooltip: {
	            formatter: function () {
	                return false;
	            }
	        },
	        legend: {
	            enabled: false
	        },
	        credits: {
	            enabled: false
	        },
	        plotOptions: {
	            series: {
	            	marker: {
	                    radius: 1,
	                    fillColor:'rgba(223, 83, 83, .5)',
	                    states: {
	                        hover: {
	                            enabled: false,
	                        }
	                    }
	                },
	                turboThreshold:4000
	            }
	        },
	        series: [{
	            name: '建筑总面积筛选',
	            data: data.data
	        }],
	        exporting: {
	            enabled: false
	        }
	    }
	if(xory=="y"){
		options.chart.inverted=true;
		//x轴和y轴的配置反过来
		var xAxisOptions = options.xAxis;
		var yAxisOptions = options.yAxis;
		options.xAxis = yAxisOptions;
		options.yAxis = xAxisOptions;
	}else if(xory=="xy"){
		options.chart.zoomType = "x";
		xory = "x";
		options.chart.events.selection = function(event){
			// 选中x区域
            var extremesObject = event[xory+"Axis"][0],
                // 最小值
                min = extremesObject.min,
                // 最大值
                max = extremesObject.max,
                detailData = [],
                // x轴数据
                xAxis = this[xory+"Axis"][0];
            // reverse engineer the last part of the data
            $.each(this.series[0].data, function () {
                //把符合选中区域的数值放入detailData
                if (this.x > min && this.x < max && this.y > min && this.y < max ) {
                    detailData.push([this.x, this.y]);
                }
            });
            // move the plot bands to reflect the new detail span
            xAxis.removePlotBand('mask');
            xAxis.addPlotBand({
                id: 'mask',
                from: min,
                to: max,
                color: 'rgba(0, 0, 0, 0.2)'
            });
            if(detailData.length==0){
            	if($("#chart1>.blank").length>0){
            		$("#chart1>.highcharts-container").hide();
            		$("#chart1>.blank").show();
            	}else{
            		$("#chart1>.highcharts-container").hide();
            		$("#chart1").append('<div class="blank">没有数据</div>');
            	}
            }else{
            	$("#chart1>.blank").hide();
            	$("#chart1>.highcharts-container").show();
            }
            myChart.scatter_chart.series[0].setData(detailData);
            return false;
		}
	}
	//生成图表	
	myChart.scatter_chart_filter = Highcharts.chart(ele,options)
	//设置遮罩区域
	 var xAxis = myChart.scatter_chart_filter[xory+"Axis"][0];
	 var min = xAxis.min,
	 max = xAxis.max,
	 start = 0,end = max/2,
	 detailData=[];
	 
     // reverse engineer the last part of the data
     $.each(myChart.scatter_chart_filter.series[0].data, function () {
         //把符合选中区域的数值放入detailData
         if (this[xory] > min && this[xory] < max) {
             detailData.push([this.x, this.y]);
         }
     });
     xAxis.addPlotBand({
         id: 'mask-before',
         from: min,
         to: max,
         color: '#F0F0F0'
     });
     xAxis.addPlotBand({
         id: 'mask',
         from: start,
         to: end,
         color: 'rgba(0, 0, 0, 0.2)'
     });
	
}
//=======下拉插件=========
function DropDown(el) {
	this.dd = el;
	this.initEvents();
}
DropDown.prototype = {
	initEvents : function() {
		var obj = this;
		obj.dd.on('click', function(event){
			$('.wrapper-dropdown').removeClass('active');
			$(this).addClass('active');
			event.stopPropagation();
			
			if(event.target.localName=='a'){
				if($(event.target).data("val")!=$(this).data("val")){//如果选项值改变了
					$(this).children("span").html(event.target.innerHTML);
					$(this).data("val",$(event.target).data("val"));
					var type = $(this).data("type");
					showChart(type);
				}
				$(this).removeClass('active');
			}
		});	
	}
}
//=====初始化下拉=====
function initDropdown(){
	var dd = new DropDown( $('#chart_item_1 #dd') );
	var dd1 = new DropDown( $('#chart_item_1 #dd1') );
	var dd2 = new DropDown( $('#chart_item_2 #dd') );
	var dd3 = new DropDown( $('#chart_item_2 #dd1') );
	var dd4 = new DropDown( $('#chart_item_3 #dd') );
	var dd5 = new DropDown( $('#chart_item_3 #dd1') );
	
	$(document).click(function() {
		// all dropdowns
		$('.wrapper-dropdown').removeClass('active');
	});
}
 
function dateFtt(fmt,date)   
{ //author: meizz   
var o = {   
"M+" : date.getMonth()+1,                 //月份   
"d+" : date.getDate(),                    //日   
"h+" : date.getHours(),                   //小时   
"m+" : date.getMinutes(),                 //分   
"s+" : date.getSeconds(),                 //秒   
"q+" : Math.floor((date.getMonth()+3)/3), //季度   
"S"  : date.getMilliseconds()             //毫秒   
};   
if(/(y+)/.test(fmt))   
fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
for(var k in o)   
if(new RegExp("("+ k +")").test(fmt))   
fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
return fmt;   
} 
//=====工具方法=====
var tools = {
		toDecimal : function(x){ 
		      var f = parseFloat(x); 
		      if (isNaN(f)) { 
		        return; 
		      } 
		      f = Math.round(x*100)/100; 
		      return f; 
		 },
		 decimalAddUnit : function(x){
			 var f = "";
			 if(x>100000000){
				 return this.toDecimal(x/100000000)+"亿";
			 }else if(x>10000){
				 return this.toDecimal(x/10000)+"万";
			 }else{
				 return f+x;
			 } 
		 },
		 toPercent : function(x){
			 x = x*100;
			 //小数点后保留两位
			 x = tools.toDecimal(x);
			 return x+"%";
		 },
		 isArray:function (o){
			 return Object.prototype.toString.call(o)=='[object Array]';
		 },
		 getLocalTime:function (nS) {//时间戳转换     
		 	   var date = new Date(parseInt(nS*1000));
		 	   return parseInt(dateFtt("yyyy",date));
		 },
		 isNull:function(str){
			 return str==null || str=="" || str.length==0;
		 },
		 isString:function (str){ 
			 return (typeof str=='string')&&str.constructor==String; 
		} 
}  