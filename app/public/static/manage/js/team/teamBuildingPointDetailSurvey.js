/*//左侧导航
$("#team").removeClass("active");
//所属项目和建筑	
var teamname = $.cookie("teamname");
var buildingname = $.cookie("buildingname");
$(".teamTitleTit").html(teamname);
$(".tit-teamname").html(teamname);
$(".tit-buildingname").html(buildingname);*/
//顶端选择的维度
var selectedTeam="";
var selectedBuilding="";
var selectedPoint="";

var relation = 3;


$(function(){

	// 问卷ID pseID = 166
	// 测点ID pid = 34
	
/*	pseID = point_detail.surveyID
	pid = point_detail.id*/
	
	var pseID = point_detail.surveyID;
	var pid = point_detail.id;
	var devID = point_detail.deviceID;
	
	if(pseID == -1){
		$(".bottom-container").html("<div style='text-align:center;margin-top:20px;'>"+ getLangStr("surveyRep_empty") +"</div>");
		// removeLoading();
		return;
	}
	
	
	var json = {"surveyID":pseID,"beginTime":time_s,"endTime":time_e,"relation":3,"objectID":pid};
	$.ajax({
		url:"/project/single/building/point_survey_detail",
		type:"POST",
		data:json,
		success:function(data){
			console.log(data);
			//initData(data.suvery);
		}
	})
	
/*	var url = "/survey/statisticalSurvey";
	var json = {"surveyID":pseID,"beginTime":time_s,"endTime":time_e,"relation":3,"objectID":pid};
	function successFunc(data){
		console.log(data)
		initData(data.suvery);
	}
	function errorFunc(data){
		var errormsg = data.messg;
		//$(".error h4").html(errormsg);
	}
	sentJson(url,json,successFunc,errorFunc);	*/
})


//初始化界面数据方法
function initData(list){

	//单选或多选题添加到自变量和因变量list中
	var surveyintro = list.introduction;
	var questionlist = list.question;
	var peoplecount = list.peoplecount;
	
	var $container = $(".bottom-container");
	if(peoplecount==0){
		$container.html("<div style='text-align:center;margin-top:20px;'>"+ getLangStr("surveyRep_empty") +"</div>");
		return;
	}
	for(var i=0;i<questionlist.length;i++){
		var question = questionlist[i];
		var questiontitle = question.title;
		var questiontype = question.type;
		
		var ismust = question.required==0?true:false;
		var questionId = i+1;
		//====================单选多选====================
		if(questiontype==1 || questiontype==2){
			var setting = question.setting;
			var items = setting.items;
			getComponent("/static/manage/components/tjDX.html",
					function(resultHTML){
						$container.append(resultHTML);
					},
					{"-id-":questionId,"-title-":questiontitle,"-count-":peoplecount})
			var $root =  $container.find("#question_"+questionId);
			var zztData = [];
			var optionarr = [];
			var bztData = [];
			//拼表格数据
			for(var n =0;n<items.length;n++){
				var itemid = n+1;
				var item = items[n];
				//判断选项类型
				var has_img = item.has_img;
				var can_input = item.can_input;
				var count = item.count;
				var content ;
				var text = item.text;
				var $newTr = $("<tr></tr>");
				if(has_img=="true"){
					var img_url = item.img_url;
					content = $("<td><img src='"+img_url+"'/></td>");
					$newTr.append(content);
				}else if(can_input=="true"){
					var input_content = item.input_content;
					content = input_content;
					$newTr.append("<td>"+content+"</td>");
				}else{
					content = text;
					$newTr.append("<td>"+content+"</td>");
				}
				$newTr.append("<td>"+count+"</td>");
				$newTr.append("<td><div class='ui indicating progress' id='progress_"+questionId+"_"+itemid+"'>"+
											  "<div class='bar'><div class='progress'></div></div>"+
											"</div></td>")
				$root.find("table tbody").append($newTr);
				//进度条初始化
				var percent = count/peoplecount;
				initProgress("progress_"+questionId+"_"+itemid,percent);
				//柱状图拼data
				zztData.push(count);
				//柱状图拼x轴数据				
				if(has_img=="true"){//如果是图片题，取text值
					content = text;
				}
				optionarr.push(content);
				//饼状图拼data
				var bzt = [];
				bzt.push(content);
				bzt.push(count);
				bztData.push(bzt);
			}
			//柱状图初始化
			initZZT("zzt_"+questionId,optionarr,zztData,peoplecount);
			//选饼状图初始化	
			initBZT("bzt_"+questionId,bztData);
		}
		//====================填空====================
		else if(questiontype==0){
			var items = question.items;
			getComponent("/static/manage/components/tjTK.html",
					function(resultHTML){
						$container.append(resultHTML);
					},
					{"-id-":questionId,"-title-":questiontitle});
			getComponent("/static/manage/components/tjTKModal.html",
					function(resultHTML){
						$("body").append(resultHTML);
					},
					{"-id-":questionId,"-title-":questiontitle});
			var $tkmodal = $("#tk-modal_"+questionId);
			
			for(var n=0;n<items.length;n++){
				var $newTr = $("<tr></tr>")
				$newTr.append("<td>"+(n+1)+"</td>");
				$newTr.append("<td>"+items[n].time+"</td>");
				$newTr.append("<td>"+items[n].answer+"</td>");
				$tkmodal.find("#datatable_body").append($newTr);
			}
			//初始化table
			initDatatable("datatable_"+questionId);
		}
		//====================量表题====================
		else if(questiontype==3){
			getComponent("/static/manage/components/tjLB.html",
					function(resultHTML){
						$container.append(resultHTML);
					},
					{"-id-":questionId,"-title-":questiontitle});
			var $root =  $container.find("#question_"+questionId);
			var statistical = question.statistical;
			var setting =  question.setting;
			var y_axis = setting.y_axis;
			var x_axis = eval("(" + setting.x_axis + ")")
			var options = {};
			for(var n=0;n<statistical.length;n++){
				var item = statistical[n];
				for(var order in item){
					options[order] = item[order];
				}
			}
			var lbzxtData = [];
			var xaxis = [];
			//拼首行	
			var $newFirstTr = $("<tr></tr>");
			$newFirstTr.append(getLangStr("surveyRep_lb1"));
			for(var x=0;x<x_axis.length;x++){
				$newFirstTr.append("<th>"+x_axis[x].tag+"</th>");
				xaxis.push(x_axis[x].tag);
			}
			$newFirstTr.append("<th>"+ getLangStr("surveyRep_lb2") +"</th>");	
			//set首行
			$root.find("table thead").append($newFirstTr);
			//拼其他行			
			for(var y =1;y<=y_axis.length;y++){
				var $newTr = $("<tr></tr>");
				var lefttitle = y_axis[y-1].left;
				var avg = y_axis[y-1].avg;
				var lbzxtData_item_data = [];
				var lbzxtData_item = {"name":lefttitle,"data":lbzxtData_item_data};
				$newTr.append("<td>"+lefttitle+"</td>");
				for(var x=0;x<x_axis.length;x++){
					var order = y+"_"+x;
					var count =  options[order];
					var p = count/peoplecount*100;
					var percent = p.toFixed(2)+"%";
					$newTr.append(" <td>"+count+"("+percent+")</td>");
					lbzxtData_item_data.push(count);
				}
				$newTr.append("<td>"+avg+"</td>"); /* avg.toFixed(2) */
				$root.find("table thead").append($newTr);
//				xaxis.push(lefttitle);
//				lbzxtData.push(avg);
				lbzxtData.push(lbzxtData_item);
			}
			//初始化量表折线图
			initLBZXT("lbzxt_"+questionId,xaxis,lbzxtData);
		}
		//====================滑块题====================
		else if(questiontype==4){
			getComponent("/static/manage/components/tjHK.html",
					function(resultHTML){
						$container.append(resultHTML);
					},
					{"-id-":questionId,"-title-":questiontitle});
			var $root =  $container.find("#question_"+questionId);
			
//			var avgArr = question.avg;
//			var sum = 0;
//			var count = 0;
//			var xaxis = [];
//			var hkzxtData = [];
//			for(var lefttitle in avgArr ){
//				var avg = avgArr[lefttitle];
//				sum+=avg;
//				count++;
//				
//				var $newTr = $("<tr></tr>")
//				$newTr.append("<td>"+lefttitle+"</td>")
//				$newTr.append("<td>"+avg+"</td>")
//				$root.find("table tbody").append($newTr);
//				xaxis.push(lefttitle);
//				hkzxtData.push(avg);
//			}
//			var sumAvg =  (sum/count).toFixed(2);
//			$root.find("table tfoot").append("<tr><th colspan='2'>小计："+sum+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;平均："+sumAvg+"</th></tr>");
//			initHKZXT("hkzxt_"+questionId,xaxis,hkzxtData)
			var hkArr = question.statistical;
			var sum = 0;
			for(var n=0;n<hkArr.length;n++){
				var item = hkArr[n];
				var avg = item.avg;
				sum+=avg;
				var lefttitle = item.title;
				var dataArr = item.data;
				var hkid = item.id;
				var $newTr = $("<tr></tr>")
				$newTr.append("<td>"+lefttitle+"</td>")
				$newTr.append("<td>"+avg+"</td>") /*avg.toFixed(2)*/
				$root.find("table tbody").append($newTr);
				var xaxis = [];
				var hkzxtData_item_data = [];
				var hkzxtData = [{"name":lefttitle,"data":hkzxtData_item_data}];
				for(var key in dataArr){
					var count = dataArr[key];
					hkzxtData_item_data.push(count);
					xaxis.push(key);
				}
				addHKZXT(questionId,hkid,xaxis,hkzxtData);
			}
			var sumAvg =  (sum/(hkArr.length)).toFixed(2);
			$root.find("table tfoot").append("<tr><th colspan='2'>"+ getLangStr("surveyRep_ht1") +"："+sum +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+ getLangStr("surveyRep_ht2") +"："+sumAvg+"</th></tr>"); /*sum.toFixed(2)*/
		}
	}
}
//初始化单选多选题的，进度条
function initProgress(id,percent){
	$("#"+id)
	  .progress({
	    total    : 100,
	    value    : percent,
	    showActivity:false,
	    text     : {
	      active: '{value} of {total} done'
	    }
	  })
}
//初始化填空题的，表格
function initDatatable(id){
	$("#"+id).DataTable(
			{
			"pageLength": 8,
			"lengthChange": false,
			"ordering": true,
			"order": [],
			"language": {
				"info":"",
				"infoFiltered":   getLangStr("datatable_infoFiltered"),
		  	"infoEmpty": getLangStr("datatable_infoEmpty"),
		  	"search":""
			}
		});
}
//初始化单选多选的，柱状图
function initZZT(id,optionarr,data,total){
	
	    $("#"+id).highcharts({
	        chart: {
	            type: 'column'
	        },
	        credits: {
	        	enabled: false
	        },
	        legend: {
	        	enabled: false
	        },
	        title: {
	            text: null
	        },
	        subtitle: {
	            text: null
	        },
	        xAxis: {
	            categories: optionarr,
	            crosshair: true
	        },
	        yAxis: {
	            min: 0,
	            title: {
	                text: null
	            }
	        },
	        tooltip: {
	            headerFormat: '<table><tr><td><span style="font-size:10px">{point.key}:</span></td>',
	            pointFormat: '<td style="color:{series.color};padding:0"><b>{point.y}</b> </td></tr>' ,
	            footerFormat: '</table>',
	            shared: true,
	            useHTML: true
	        },
	        plotOptions: {
	            column: {
	                pointPadding: 0.2,
	                borderWidth: 0,
	                colorByPoint: true
	            }
	        },
	        series: [{
	            data:data,
	            dataLabels: {
	            	enabled: true,
	            	formatter : function() {
	            		var b = this.y/total*100;
	            		return b.toFixed(2)+"%";
	                }
	            }
	        }]
	    });
}
//单选多选题，饼状图
function initBZT(id,data){
	$(function () {
	    $("#"+id).highcharts({
	        chart: {
	            plotBackgroundColor: null,
	            plotBorderWidth: null,
	            plotShadow: false
	        },
	        credits: {
	        	enabled: false
	        },
	        title: {
	            text: null
	        },
	        tooltip: {
	            headerFormat: ' ',
	            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
	        },
	        plotOptions: {
	            pie: {
	                allowPointSelect: true,
	                cursor: 'pointer',
	                dataLabels: {
	                    enabled: true,
	                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
	                    style: {
	                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
	                    }
	                }
	            }
	        },
	        series: [{
	            'type': 'pie',
	            'data': data
	        }]
	    });
	});
}
//量表题，折线图
function initLBZXT(id,x,data){
//	var chart = new Highcharts.Chart(id, {
//	    title: {
//	        text: null
//	    },
//	    credits: {
//        	enabled: false
//        },
//	    subtitle: {
//	        text: null
//	    },
//	    xAxis: {
//	        categories: x
//	    },
//	    yAxis: {
//	        title: {
//	            text: null
//	        },
//	        plotLines: [{
//	            value: 0,
//	            width: 1,
//	            color: '#808080'
//	        }]
//	    },
//	    tooltip: {
//	    	shared: true,
//            useHTML: true,
//            headerFormat: '<small>{point.key}</small><table>',
//            pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
//            '<td style="text-align: right"><b>{point.y} </b></td></tr>',
//            footerFormat: '</table>',
//            valueDecimals: 2
//        },
//        legend: {
//            layout: 'vertical',
//            align: 'right',
//            verticalAlign: 'middle',
//            borderWidth: 0
//        },
//        series: data
//	    
//	});
	$("#"+id).highcharts({
        chart: {
            type: 'column'
        },
        credits: {
        	enabled: false
        },
        title: {
            text: null
        },
        xAxis: {
            categories: x,
            crosshair: true
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
            }
        },
        series: data
    });
	
	
	 
}
function addHKZXT(questionid,hkid,x,data){
	$("#hkzxt_"+questionid).append("<div id='hkzxt_"+questionid+"_"+hkid+"' class='hkzxt' ></div>");
	initHKZXT("hkzxt_"+questionid+"_"+hkid,x,data);
}
//滑块题，折线图
function initHKZXT(id,x,data){
	var chart = new Highcharts.Chart(id, {
	    title: {
	        text: null
	    },
	    credits: {
        	enabled: false
        },
	    subtitle: {
	        text: null
	    },
	    xAxis: {
	        categories: x
	    },
	    yAxis: {
	        title: {
	            text: null
	        },
	        plotLines: [{
	            value: 0,
	            width: 1,
	            color: '#808080'
	        }]
	    },
	    tooltip: {
            headerFormat: '<table><tr><td><span style="font-size:10px">{point.key}:</span></td>',
            pointFormat: '<td style="color:{series.color};padding:0"><b>{point.y}</b> </td></tr>' ,
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
	    legend: {
            align: 'center',
            borderWidth: 0
	    },
//	    series: [{
//	        data: data,
//	        dataLabels: {
//            	enabled: true,
//            	formatter : function() {
//            		return this.y;
//                }
//            }
//	    }]
	    series:data
	});
}