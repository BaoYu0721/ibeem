//左侧导航
$(".leftmenu").removeClass("active");
//所属项目和建筑	
var teamname = $.cookie("teamname")==undefined?"":$.cookie("teamname");
var buildingname = $.cookie("buildingname")==undefined?"":$.cookie("buildingname");
$(".teamTitleTit").html(teamname.length>10?teamname.substring(0,10)+"..":teamname);
$(".tit-teamname").html(teamname.length>8?teamname.substring(0,8)+"..":teamname);
$(".tit-buildingname").html(buildingname.length>8?buildingname.substring(0,8)+"..":buildingname);
////顶端选择的维度
var selectedTeam="";
var selectedBuilding="";
var selectedPoint="";
////获取统计数据json
//var isgx = $.cookie("gx");
//var starttime = $.cookie("tjstarttime");
//var endtime = $.cookie("tjendtime");
//var relation = $.cookie("tjrelation");
//var objectID = $.cookie("tjobjectId");
//var surveyId = $.cookie("tjsurveyId");
////获取当前统计是哪个维度下的（1项目2建筑）
//var paramRelation = getQueryString("relation");
//var paramTeamId = $.cookie("gxteamId");
//var paramBuildingId = $.cookie("gxbuildingId");
//var paramTeamName = $.cookie("gxteamName");
//var paramBuildingName = $.cookie("gxbuildingName");
//if(isgx && isgx!=null && isgx=="true"){
//	var starttime = $.cookie("gxstarttime");
//	var endtime = $.cookie("gxendtime");
//	var relation = $.cookie("gxrelation");
//	var objectID = $.cookie("gxobjectId");
//	//初始化
//	$.cookie("gx",false);
//	//如果是更新，将数据回写到顶端input中
//	$("#startTime").val(starttime);
//	$("#endTime").val(endtime);
//	var gxteamId = $.cookie("gxteamId");
//	var gxteamName = $.cookie("gxteamName");
//	var gxbuildingId = $.cookie("gxbuildingId");
//	var gxbuildingName = $.cookie("gxbuildingName");
//	var gxpointId = $.cookie("gxpointId");
//	var gxpointName = $.cookie("gxpointName");
//	if(relation=="1" || relation=="2" || relation=="3" ){
//		$("#dropdownTeam").find("input").val(gxteamId);
//		selectedTeam = gxteamId;
//		$("#dropdownTeam").find(".text").removeClass("default");
//		$("#dropdownTeam").find(".text").html(gxteamName);
//		objectID = gxteamId;
//	}
//	if(relation=="2" || relation=="3" ){
//		$("#dropdownBuilding").find("input").val(gxbuildingId);
//		selectedBuilding = gxbuildingId;
//		$("#dropdownBuilding").find(".text").removeClass("default");
//		$("#dropdownBuilding").find(".text").html(gxbuildingName);
//		objectID = gxbuildingId;
//	}
//	if(relation=="3" ){
//		$("#dropdownPoint").find("input").val(gxpointId);
//		selectedPoint = gxpointId;
//		$("#dropdownPoint").find(".text").removeClass("default");
//		$("#dropdownPoint").find(".text").html(gxpointName);
//		objectID = gxpointId;
//	}
//}
//获取统计数据json
//var isgx = $.cookie("gx");
//var starttime = $.cookie("tjstarttime");
//var endtime = $.cookie("tjendtime");
//var relation = $.cookie("tjrelation");
//var objectID = $.cookie("tjobjectId");
var surveyId = $.cookie("gxsurveyId");
//获取当前统计是哪个维度下的（1项目2建筑）
var paramRelation = getQueryString("relation");
var paramTeamId = $.cookie("gxteamId");
var paramBuildingId = $.cookie("gxbuildingId");
var paramTeamName = $.cookie("gxteamName");
var paramBuildingName = $.cookie("gxbuildingName");
//if(isgx && isgx!=null && isgx=="true"){
	var starttime = $.cookie("gxstarttime");
	var endtime = $.cookie("gxendtime");
	var relation = $.cookie("gxrelation");
	var objectID = $.cookie("gxobjectId");
	//初始化
//	$.cookie("gx",false);
	//如果是更新，将数据回写到顶端input中
	$("#startTime").val(starttime);
	$("#endTime").val(endtime);
	var gxteamId = $.cookie("gxteamId");
	var gxteamName = $.cookie("gxteamName");
	var gxbuildingId = $.cookie("gxbuildingId");
	var gxbuildingName = $.cookie("gxbuildingName");
	var gxpointId = $.cookie("gxpointId");
	var gxpointName = $.cookie("gxpointName");
	if(relation=="1" || relation=="2" || relation=="3" ){
		$("#dropdownTeam").find("input").val(gxteamId);
		selectedTeam = gxteamId;
		$("#dropdownTeam").find(".text").removeClass("default");
		$("#dropdownTeam").find(".text").html(gxteamName);
		objectID = gxteamId;
	}
	if(relation=="2" || relation=="3" ){
		$("#dropdownBuilding").find("input").val(gxbuildingId);
		selectedBuilding = gxbuildingId;
		$("#dropdownBuilding").find(".text").removeClass("default");
		$("#dropdownBuilding").find(".text").html(gxbuildingName);
		objectID = gxbuildingId;
	}
	if(relation=="3" ){
		$("#dropdownPoint").find("input").val(gxpointId);
		selectedPoint = gxpointId;
		$("#dropdownPoint").find(".text").removeClass("default");
		$("#dropdownPoint").find(".text").html(gxpointName);
		objectID = gxpointId;
	}
//}

var url = "/survey/statistics";
var json = {"surveyID":surveyId,"beginTime":starttime,"endTime":endtime,"relation":relation,"objectID":objectID};
function successFunc(data){
	initData(data.suvery);
}
function errorFunc(data){
	var errormsg = data.messg;
	$(".error h4").html(errormsg);
}
sentJson(url,json,successFunc,errorFunc);


//初始化界面数据方法
function initData(list){
	var surveytitle = list.title;
	$('#headtitle').html(getLangStr("surveyRep_title")+":"+surveytitle);
	//单选或多选题添加到自变量和因变量list中
	var surveyintro = list.introduction;
	var paragraph = list.paragraph;
//	var questionlist = list.question;
	var peoplecount = list.peoplecount;
	var $container = $(".bottom-container");
	if(peoplecount==0){
		$container.append(getLangStr("surveyRep_empty"));
		return;
	}
	var orderNum = 1;
	for(var para in paragraph){
		var paragraphItem = paragraph[para];
		var paraTitle = paragraphItem.title;
		var questionlist = paragraphItem.questionList;
		if($.trim(paraTitle)!=""){
			$container.append('<div class="question dl" id="dl_'+(para+1)+'"><span>'+paraTitle+'</span></div>');
		}
		for(var i=0;i<questionlist.length;i++){
		var question = questionlist[i];
		var questiontitle = question.title;
		var questiontype = question.type;
		var ismust = question.required==0?true:false;
		var questionId = orderNum;
		var peoplecount = question.peoplecount;
		
		orderNum++;
		//====================单选多选====================
		if(questiontype==1 || questiontype==2){
			var setting = question.setting;
			var items = setting.items;
			if(peoplecount==0){
				$container.append('<div class="question dx" id="question_'+questionId+'">'+
						  '<span class="title">'+questionId+'.'+questiontitle+getLangStr("surveyRep_empty1")+'</span>'+
						'</div>');
			}else{
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
						content = text;
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
					var percent = count/peoplecount*100;
					
					initProgress("progress_"+questionId+"_"+itemid,percent<10?percent.toFixed(0):percent.toFixed(2));
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
		}
		//====================填空====================
		else if(questiontype==0){
			var items = question.items;
			if(items.length==0){
				$container.append('<div class="question" id="question_'+questionId+'">'+
						  '<span class="title">'+questionId+'.'+questiontitle+getLangStr("surveyRep_empty1")+'</span>'+
						'</div>');
			}else{
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
		}
		//====================量表题====================
		else if(questiontype==3){
			if(peoplecount==0){
				$container.append('<div class="question" id="question_'+questionId+'">'+
						  '<span class="title">'+questionId+'.'+questiontitle+getLangStr("surveyRep_empty1")+'</span>'+
						'</div>');
			}else{
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
				$newFirstTr.append("<th>"+getLangStr("surveyRep_lb1")+"</th>");
				for(var x=0;x<x_axis.length;x++){
					$newFirstTr.append("<th>"+x_axis[x].tag+"</th>");
					xaxis.push(x_axis[x].tag);
				}
				$newFirstTr.append("<th>"+getLangStr("surveyRep_lb1")+"</th>");	
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
					$newTr.append("<td>"+avg.toFixed(2)+"</td>");
					$root.find("table thead").append($newTr);
//					xaxis.push(lefttitle);
//					lbzxtData.push(avg);
					lbzxtData.push(lbzxtData_item);
				}
				//初始化量表折线图
				initLBZXT("lbzxt_"+questionId,xaxis,lbzxtData);
			}
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
				$newTr.append("<td>"+avg.toFixed(2)+"</td>")
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
			$root.find("table tfoot").append("<tr><th colspan='2'>"+getLangStr("surveyRep_ht1")+"："+sum.toFixed(2)+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+getLangStr("surveyRep_ht2")+"："+sumAvg+"</th></tr>");
		}
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
				"infoFiltered":  getLangStr("datatable_infoFiltered"),
		  	"infoEmpty":  getLangStr("datatable_infoEmpty"),
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
//显示填空题列表
$("#content .bottom-container").on("click",".question.tk .intro",function(){
	var questionId = $(this).data("id");
	$("#tk-modal_"+questionId)
	  .modal('setting', 'closable', false)
	  .modal('show');
	
})

//点击顶端来源项目
$('.combo.dropdown')
  .dropdown({
    action: 'combo'
  })
;
$("#dropdownTeam").dropdown({
	onShow:function(){
		//如果是项目问卷统计，只能显示当前项目
		//如果是建筑问卷统计，只能显示当前建筑所属项目
		var $this = $(this);
		if(paramRelation==1 || paramRelation==2){
			$this.find(".menu").empty();
			$this.find(".menu").append(" <div class='item' data-value='"+paramTeamId+"'>"+(paramTeamName.length>10?paramTeamName.substring(0,10)+"..":paramTeamName)+"</div>");
			$this.dropdown("show");
		}else{
			$this.find(".menu").empty();
			$(this).find(".menu").append("<img src='/public/static/manage/img/team/loding.gif'/>");
			$(this).dropdown("show");
			var url = "/project/getProjectListByUser";
			var json = {};
			function func(data){
				 teamList = data.list;
				 //清除当前项目列表的数据
				 $this.find(".menu").empty();
				 if(teamList.length>0){
					 $this.find(".menu").append(" <div class='item' data-value=''>"+getLangStr("surveyRep_allproject")+"</div>");
				 }else if((teamList.length==0)){
					 $this.find(".menu").append(" <div class='item' data-value=''>"+getLangStr("surveyRep_nullproject")+"</div>");
				 } 
				 for(var i=0;i<teamList.length;i++){
					 var name = teamList[i].name;
					 var image = teamList[i].image;
					 var id = teamList[i].id;
					 var decribe = teamList[i].decribe;
					 $this.find(".menu").append(" <div class='item' data-value='"+id+"'>"+(name.length>10?name.substring(0,10)+"..":name)+"</div>");
				 }
				 $this.dropdown("show");
			}
			sentJson2(url,json,func);
		}
	},
	onChange:function(value, text, $choice){
		selectedTeam = value;
//		if(value==""){
			$("#dropdownBuilding>.text").html("来源建筑");
			$("#dropdownBuilding>.text").addClass("default");
			$("#dropdownBuilding>input").val("");
			$("#dropdownPoint>.text").html("来源测点");
			$("#dropdownPoint>.text").addClass("default");
			$("#dropdownPoint>input").val("");
//		}
	}	
})
$("#dropdownBuilding").dropdown({
	onShow:function(){
		var $this = $(this);
		if(selectedTeam==""){
			$this.find(".menu").empty();
			$this.find(".menu").append(" <div class='item' data-value=''>"+getLangStr("surveyRep_chooseproject")+"</div>");
			return;
		}
		if(paramRelation==2){
			$this.find(".menu").empty();
			$this.find(".menu").append(" <div class='item' data-value='"+paramBuildingId+"'>"+(paramBuildingName.length>10?paramBuildingName.substring(0,10)+"..":paramBuildingName)+"</div>");
			$this.dropdown("show");
		}else{
			$this.find(".menu").empty();
			$(this).find(".menu").append("<img src='/public/static/manage/img/team/loding.gif'/>");
			$(this).dropdown("show");
			var url="/project/single/building";
			var json={"projectID":selectedTeam};
			var successFunc = function(data){
				var buildingArr = data.list;
				//清除当前项目列表的数据
				 $this.find(".menu").empty();
				 if(buildingArr.length>0){
//					 $this.find(".menu").append(" <div class='item' data-value=''>"+getLangStr("surveyRep_allbuilding")+"</div>");
				 }else if((buildingArr.length==0)){
					 $this.find(".menu").append(" <div class='item' data-value=''>"+getLangStr("surveyRep_nullbuilding")+"</div>");
				 } 
				for(var i=0;i<buildingArr.length;i++){
					var id = buildingArr[i].id;
					var name = buildingArr[i].name;
					var city = buildingArr[i].city;
					$this.find(".menu").append(" <div class='item' data-value='"+id+"'>"+(name.length>10?name.substring(0,10)+"..":name)+"</div>");
				}
				$this.dropdown("show");
			}
			sentJson2(url,json,successFunc);
		}
	},
	onChange:function(value, text, $choice){
		selectedBuilding = value;
//		if(value==""){
		$("#dropdownPoint>.text").html("来源测点");
		$("#dropdownPoint>.text").addClass("default");
		$("#dropdownPoint>input").val("");
//		}
	}	
})
$("#dropdownPoint").dropdown({
	onShow:function(){
		var $this = $(this);
		if(selectedBuilding==""){
			$this.find(".menu").empty();
			$this.find(".menu").append(" <div class='item' data-value=''>"+getLangStr("surveyRep_choosebuilding")+"</div>");
			return;
		}
		$this.find(".menu").empty();
		$(this).find(".menu").append("<img src='/public/static/manage/img/team/loding.gif'/>");
		$(this).dropdown("show");
		var url="/buildingPoint/getBuildingPointListByBuilding";
		var json={"buildingID":selectedBuilding};
		var func = function(data){
			var points = data.list;
			//清除当前项目列表的数据
			 $this.find(".menu").empty();
			 if(points.length>0){
				 $this.find(".menu").append(" <div class='item' data-value=''>"+getLangStr("surveyRep_allpoint")+"</div>");
			 }else if((points.length==0)){
				 $this.find(".menu").append(" <div class='item' data-value=''>"+getLangStr("surveyRep_nullpoint")+"</div>");
			 } 
			for(i in points){
				var point = points[i];
				var id = point.id;
				var name = point.name;
				$this.find(".menu").append(" <div class='item' data-value='"+id+"'>"+(name.length>10?name.substring(0,10)+"..":name)+"</div>");
			 }
			 $this.dropdown("show");
		}
		sentJson2(url,json,func);
	},
	onChange:function(value, text, $choice){
		selectedPoint = value;
	}	
})
$("#refresh").click(function(){
	var objectID;
	var relation;
	var starttime = $("#startTime").val();
	var endtime = $("#endTime").val();
	if(starttime && $.trim(starttime)!="" && endtime && $.trim(endtime)!=""){
		if(starttime>=endtime){
			alertokMsg(getLangStr("surveyRep_messg1"),getLangStr("alert_ok"));
			return false;
		}
	}
	var tjteamId = $("#dropdownTeam").find("input").val();
	var tjteamName = $("#dropdownTeam").find(".text").html();
	var tjbuildingId = $("#dropdownBuilding").find("input").val();
	var tjbuildingName = $("#dropdownBuilding").find(".text").html();
	var tjpointId = $("#dropdownPoint").find("input").val();
	var tjpointName = $("#dropdownPoint").find(".text").html();
	if(tjpointId!=""){
		objectID = tjpointId;
		relation = 3;
	}else if(tjbuildingId!=""){
		objectID = tjbuildingId;
		relation = 2;
	}else if(tjteamId!=""){
		objectID = tjteamId;
		relation = 1;
	}else{
		objectID = "-1";
		relation = 0;
	}
	$.cookie("gxstarttime",starttime);
	$.cookie("gxendtime",endtime);
	$.cookie("gxrelation",relation);
	$.cookie("gxobjectId",objectID);
	//将所有维度的信息都存在缓存里
	$.cookie("gxteamId",tjteamId);
	$.cookie("gxteamName",tjteamName);
	$.cookie("gxbuildingId",tjbuildingId);
	$.cookie("gxbuildingName",tjbuildingName);
	$.cookie("gxpointId",tjpointId);
	$.cookie("gxpointName",tjpointName);
	window.location.reload();
});
//顶端时间选择
$('.some_class').datetimepicker({
	format:"Y-m-d H:i:s"
});

function getQueryString(name) { 
	var url = window.location.href;
	if(url.indexOf(".jsp?")!=-1){
		var params = url.split(".jsp?")[1];
		var paramArr = params.split("&");
		var paramObj = {};
		for(var i in paramArr){
			paramObj[paramArr[i].split("=")[0]] = paramArr[i].split("=")[1];
		}
		return paramObj[name]==undefined?null:paramObj[name];
	}else{
		return null;
	}
}

 

 