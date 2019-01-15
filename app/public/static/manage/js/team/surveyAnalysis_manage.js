//==============================初始化设置开始==============================
//添加左侧导航栏
getComponent("/common/admin/leftpanel",
		function(result){
			$(".fl.mainleft").html(result);
			/*左侧导航的选中效果*/
			$( ".leftmenu").click(function(){
			    $(this).addClass("active").siblings(".leftmenu").removeClass("active");
			});
			$("#surveypanel").addClass("active");
});
//左侧导航
$(".leftmenu").removeClass("active");
//所属项目和建筑	
var teamname = $.cookie("teamname");
var buildingname = $.cookie("buildingname");
$(".teamTitleTit").html(teamname);
$(".tit-teamname").html(teamname);
$(".tit-buildingname").html(buildingname);
//获取浏览器包括滚动条在内的宽度
window.getWidth= function(){  
  if(window.innerWidth!= undefined){  
      return window.innerWidth;  
  }  
  else{  
      var scrollWidth = getScrollWidth();
      return $(window).width()+scrollWidth;
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
//设置页面高度宽度
function init(){
	//初始化时，将右侧content高度设置为屏幕高度减导航栏高度	
	var window_height = $(window).height();
	var window_width = window.getWidth();
	var nav_height = $(".main .ui.inverted.menu").height();
	//var content_height = window_height - nav_height;
	//右侧content是absolute，距离上侧55px，直接减去55
	$("#content").css("height",window_height);
	//main的宽度是，屏幕宽度减去左侧导航栏宽度
	$('#content').css("width",window_width-60);
//	$('.ui.grid').css("min-width",1200);
	
//	设置头部添加题目导航栏，顶部悬浮
	var scrollWidth = getScrollWidth();
	var contentWidth = $(".content-team").width()-scrollWidth;
	var containerWidth = $(".content .container").width();
	var leftWidth2 = (contentWidth/2)-(containerWidth/2);
	if(containerWidth>contentWidth){
		$(".content .container .top").css("left",0);
		$(".content .container").css("margin-left",0);
	}else{
		$(".content .container .top").css("left",leftWidth2);
		$(".content .container").css("margin-left",leftWidth2);
	}
}

$(window).resize(function(){
	/*动态设置内容区高度  */
	init();
});
init();

//==============================初始化下拉列表==============================
$("#add").click(function(){
	//显示弹出框
	$('.ui.modal.add').modal('setting', 'closable', false).modal('show');
})
//问卷ID
var surveyId = $.cookie("fxsurveyId");
//获取当前维度
function getQueryString(name) { 
	var params = decodeURI(window.location.search);
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	var r = params.substr(1).match(reg);
	if (r!=null) return unescape(r[2]); return null;
}
var paramRelation = getQueryString("relation");
var paramObjectId = getQueryString("objectID")==""?null:getQueryString("objectID");

//问卷自变量选项
var ziList = [];
//分类枚举题，数据存储
var dataFLMJ = [];
//顶端时间选择
$('.some_class').datetimepicker({
	format:"Y-m-d H:i:s"
});
//根据问卷ID获取题目列表，放到自变量和因变量的下拉框中
$(function(){
	var url = "/admin/survey/getSurveyById";
	var json = {"surveyID":surveyId};
	function successFunc(data){
		var dlList = data.list;
		var surveyName = data.title;
		$('#headtitle').html(getLangStr("surveyAna_title")+":"+surveyName);
		for(var j in dlList){
			var questionList = dlList[j].questionList;
			//单选或多选题添加到自变量和因变量list中
			for(var i=0;i<questionList.length;i++){
				var questionId = questionList[i].questionID;
				var title = questionList[i].title;
				var type = questionList[i].type;
				var itemsJson = eval('(' + questionList[i].setting + ')');
				var setting = itemsJson.items;
				if(setting==undefined)setting=[];
				if(type==0){
					title +="（"+getLangStr("survey_question1")+"）";
				}
				else if(type==1){
					title +="（"+getLangStr("survey_question2")+"）";
				}else if(type==2){
					title +="（"+getLangStr("survey_question3")+"）";
				}else if(type==3){
					title +="（"+getLangStr("survey_question4")+"）";
				}else if(type==4){
					title +="（"+getLangStr("survey_question5")+"）";
				}
				var obj = {id:questionId,title:title,type:type,setting:setting};
				ziList.push(obj);
				if(type == 1 ||type == 2){
					setZi(obj);
					setYin(obj);
				}else{
					setYin(obj);
				}
			}
		}
		
		//拼凑维度的setting选项值
		var wdSetting = getSetting(surveyId);
		//给自变量加进维度
		if(paramRelation==1){
			setZi({id:"building",title:getLangStr("survey_building"),type:"building",setting:wdSetting.buildingSettingList});
			ziList.push({id:"building",title:getLangStr("survey_building"),type:"building",setting:wdSetting.buildingSettingList});
		}else if(paramRelation==2){
			
		}else{
			setZi({id:"project",title:getLangStr("survey_project"),type:"project",setting:wdSetting.projectSettingList});
			ziList.push({id:"project",title:getLangStr("survey_project"),type:"project",setting:wdSetting.projectSettingList});
			setZi({id:"building",title:getLangStr("survey_building"),type:"building",setting:wdSetting.buildingSettingList});
			ziList.push({id:"building",title:getLangStr("survey_building"),type:"building",setting:wdSetting.buildingSettingList});
		}
		setZi({id:"buildingPoint",title:getLangStr("survey_point"),type:"buildingPoint",setting:wdSetting.pointSettingList});
		ziList.push({id:"buildingPoint",title:getLangStr("survey_point"),type:"buildingPoint",setting:wdSetting.pointSettingList});
		//下拉框初始化
		$("#dropdownZi").dropdown({
			onChange:function(value, text, $choice){
				var type = $choice.data("type");
				$("#dropdownZi>input").attr("data-type",type);
			}
		});
		//下拉框初始化
		$("#dropdownYin").dropdown({
			onChange:function(value, text, $choice){
				var type = $choice.data("type");
				$("#dropdownYin>input").attr("data-type",type);
			}
		});
	}
	sentJson(url,json,successFunc);
})
//向自变量列表放一个选项
function setZi(obj){
	$("#dropdownZi").find(".menu").append("<div class='item' data-value='"+obj.id+"' data-type='"+obj.type+"'>"+obj.title+"</div>");
}
//向因变量列表放一个选项
function setYin(obj){
	$("#dropdownYin").find(".menu").append("<div class='item' data-value='"+obj.id+"' data-type='"+obj.type+"'>"+obj.title+"</div>");
}
//取消按钮
$("#cancelAdd").click(function(){
	//清空标题
//	$("#title_input").val("");
	$('.ui.modal.add').modal('setting', 'closable', false).modal('hide');
})
//确认按钮
$("#confirmAdd").click(function(){
	
	//获取标题
	var title = $("#title_input").val();
	//获取自变量
	var zi = $("#dropdownZi input").val();
	var ziType = $("#dropdownZi input").attr("data-type");
	var ziTitle = $("#dropdownZi>.text").html();
	//获取因变量
	var yin = $("#dropdownYin input").val();
	var yinType = $("#dropdownYin input").attr("data-type");
	var yinTitle = $("#dropdownYin>.text").html();
	//获取开始结束时间
	var startTime = $("#startTime").val();
	var endTime = $("#endTime").val();
	//空值校验
	if($.trim(startTime)!="" && $.trim(endTime)!="" && startTime>=endTime){
		$("#title_yin").css("display","block");
		$("#title_error").empty();
		$("#title_zi").empty();
		$("#title_yin").html(getLangStr("surveyAna_messg1"));
		return false;
	}else if($.trim(title)==""){
		$("#title_error").css("display","block");
		$("#title_zi").empty();
		$("#title_yin").empty();
		$("#title_error").html(getLangStr("surveyAna_messg2"));
		return false;
	}else if($.trim(zi)==""){
		$("#title_zi").css("display","block");
		$("#title_error").empty();
		$("#title_yin").empty();
		$("#title_zi").html(getLangStr("surveyAna_messg3"));
		return false;
	}else if($.trim(yin)==""){
		$("#title_yin").css("display","block");
		$("#title_error").empty();
		$("#title_zi").empty();
		$("#title_yin").html(getLangStr("surveyAna_messg4"));
		return false;
	}else if($.trim(yin)==$.trim(zi)){
		$("#title_yin").css("display","block");
		$("#title_error").empty();
		$("#title_zi").empty();
		$("#title_yin").html(getLangStr("surveyAna_messg5"));
		return false;
	}
	
	$("body").prepend('<style>'+
			'.loding-panel{width:100%;height:100%;background-color:rgba(0,0,0,0.5);position:fixed ;top:0;left:0;;z-index:2000;}'+
			'.loding-icon{position:absolute;top:50%;left:50%;z-index:2001}'+
			'</style>'+
			'	<div class="loding-panel">'+
			'		<div class="loding-icon" ><i class="huge white spinner loading icon"></i></div>'+
			'	</div>')
	var chartType = "chart1";
	var jsonType = "question";
	if(zi=="project" || zi=="building" || zi=="buildingPoint" ){
		jsonType = zi;
	}
	if(yinType == 0){
		chartType = "chart2";
	}else if(yinType == 3){
		chartType = "chart3";
	}else if(yinType == 4){
		chartType = "chart4";
	}
	var re = createChart(title,zi,ziTitle,ziType,yin,yinTitle,jsonType,chartType,startTime,endTime);
	if(re!=null && re=="isNotRelated"){
		alertokMsg(getLangStr("surveyAna_messg_"+zi),getLangStr("alert_ok"),
		"$('.ui.modal.add').modal('setting', 'closable', false).modal('show')");
	}else if(re!=null && re=="isNoData"){
		alertokMsg(getLangStr("surveyAna_messg_data_"+zi),getLangStr("alert_ok"),
		"$('.ui.modal.add').modal('setting', 'closable', false).modal('show')");
	}else{
		//清空标题
		$("#title_input").val("");
		$('.ui.modal.add').modal('setting', 'closable', false).modal('hide');
		//清空错误提示
		$("#title_error").empty();
		$("#title_zi").empty();
		$("#title_yin").empty();
	}
	removeLoading();
})
//==============================解析json，生成图表==============================
//记录图表数量,全局变量
var orderNum = 1;
//颜色集合
var colorArr =[]; 
//分类枚举题
function createChart(title,zi,ziTitle,ziType,yin,yinTitle,jsonType,chartType,startTime,endTime){
	var returnFlag = "";
	//获取json
	var url = "/admin/survey/analysisSurvey";
	if(jsonType!="question")
		zi=-1;
	var json = {"surveyID":surveyId,"zid":zi,"yid":yin,"type":jsonType,"startTime":startTime,"endTime":endTime,"relation":paramRelation,"objectID":paramObjectId};
	var dataJson ;
	function successFunc(data){
		dataJson = data.result;
		//isNotRelated表示是否关联了当前选中的维度，isNoData表示当前维度是否有答案
		if(dataJson.isNotRelated==1){
			returnFlag = "isNotRelated";
		}else if(dataJson.isNoData==1){
			returnFlag = "isNoData";
		}
	}
	sentJsonSync(url,json,successFunc);
	if(returnFlag!="")return returnFlag;
	//1.自变量：选择／维度，因变量：选择
	if(chartType =="chart1"){
//		dataJson = {"男":{"电脑":10,"化妆品":0,"书":5},"女":{"电脑":2,"化妆品":15,"书":8}};
		//放置一个分析图表
		getComponent("/common/analysis1",
				function(result){
					$("#container").append(result);
					initChart1(dataJson,"myChart_"+orderNum);
		},{"-title-":title,"-zi-":ziTitle,"-yin-":yinTitle,"-id-":orderNum});
	}
	//2.自变量：选择／维度，因变量：填空
	else if(chartType =="chart2"){
//		dataJson = {analysis:[{"id":1,"textlist":[{"time":"2017-05-20","answer":"我是答案"},{"time":"2017-05-20","answer":"我是答案"},{"time":"2017-05-20","answer":"我回答回答了"}]},{"id":2,"textlist":['我是答案','我来回答','我回答回答了']},{"id":3,"textlist":['我是答案','我来回答','我回答回答了']}]};
		//放置一个分析图表
		getComponent("/common/analysis2",
				function(result){
					$("#container").append(result);
					//获取选项，初始化下拉列表，给一个默认选项
					var defaultId; 
					for(var i=0;i<ziList.length;i++){
						var type = ziList[i].type;
						//如果类型一致则取出选项
						if(ziType == type){
							var setting = ziList[i].setting;
							if(setting.length==0){$("#analysis_"+orderNum);alert(getLangStr("surveyAna_messg6"));return false;}
							defaultId = setting[0].id;
							for(var j=0;j<setting.length;j++){
								if(setting[j].can_input=="true")setting[j].text = getLangStr("surveyAna_messg7");
								$("#chartDropdown_"+orderNum+">.menu").append("<div class='item' data-value='"+setting[j].id+"'>"+setting[j].text+"</div>");
							}
							var num = orderNum;
							//激活下拉列表			
							$("#chartDropdown_"+orderNum).dropdown({
								onChange:function(value, text, $choice){
									//获取对应数据
									for(var m=0;m<dataFLMJ.length;m++){
										if(dataFLMJ[m].questionOrder==num){
											var dataAnswer =  dataJson.analysis;
											$("#analysis_"+num).find(".table-container").empty();
											$("#analysis_"+num).find(".table-container").append('<table id="datatable_'+num+'" class="ui celled table datatables" cellspacing="0"> '+
							           			'<thead> '+
							           			'<tr> '+
							           			'	<th>'+getLangStr("surveyAna_th1")+'</th>'+ 
							           			'	<th>'+getLangStr("surveyAna_th2")+'</th>'+ 
							           			'	<th>'+getLangStr("surveyAna_th3")+'</th> '+
							          			'</tr> '+
							          			'</thead>'+
							        			'<tbody id="datatable_body_'+num+'">'+ 
							        			'</tbody>'+
							         		'</table>')
											for(var nn=0;nn<dataAnswer.length;nn++){
												if(dataAnswer[nn].id==value){
													var textlist = dataAnswer[nn].textlist;
													for(var mm=0;mm<textlist.length;mm++){
														var time = textlist[mm].time;
														var answer = textlist[mm].answer;
														$("#datatable_body_"+num).append("<tr><td>"+(mm+1)+"</td><td>"+time+"</td><td>"+answer+"</td></tr>");
													}
													nn=dataAnswer.length;
												}
											}
											$("#datatable_"+num).DataTable({ scrollY: '50vh',pageLength: 8, scrollCollapse: true, paging: false ,"language": {  "info": "", "infoEmpty": getLangStr("datatable_infoEmpty"), "infoFiltered": "" }});
											m=dataFLMJ.length;
										}
									}
								}	
							});
							$("#chartDropdown_"+orderNum).find(".text").removeClass("default");
							$("#chartDropdown_"+orderNum).find(".text").html(setting[0].text);
							$("#chartDropdown_"+orderNum+">input").val(setting[0].id);
							i=ziList.length;
						}
					}
					//初始化表格数据
					//把数据放入全局变量里，点击切换数据时，从全局数据中取值重新加载
					dataFLMJ.push({"questionOrder":orderNum,"data":dataJson.analysis});
					var dataAnswer =  dataJson.analysis;
					for(var i=0;i<dataAnswer.length;i++){
						if(dataAnswer[i].id==defaultId){
							var textlist = dataAnswer[i].textlist;
							for(var j=0;j<textlist.length;j++){
								var time = textlist[j].time;
								var answer = textlist[j].answer;
								$("#datatable_body_"+orderNum).append("<tr><td>"+(j+1)+"</td><td>"+time+"</td><td>"+answer+"</td></tr>");
							}
							i=dataAnswer.length;
						}
					}
					$("#datatable_"+orderNum).DataTable({ scrollY: '50vh',pageLength: 8, scrollCollapse: true, paging: false ,"language": {  "info": "", "infoEmpty":  getLangStr("datatable_infoEmpty"), "infoFiltered": "" }});
					//样式调整
//					$("#datatable_"+orderNum+"_wrapper").find(".dataTables_scrollHeadInner").css("width","100%");
//					$("#analysis_"+orderNum).css("display","block");
		},{"-title-":title,"-zi-":ziTitle,"-yin-":yinTitle,"-id-":orderNum});	 
	}
	//3.自变量：选择／维度，因变量：量表
	else if(chartType =="chart3"){
		//获取json
//		var dataJson = {"温度":{"男":{"非常不满意":10,"一般般":0,"满意":5},"女":{"非常不满意":6,"一般般":6,"满意":3}},"湿度":{"男":{"非常不满意":5,"一般般":9,"满意":1},"女":{"非常不满意":12,"一般般":1,"满意":2}},"PM2.5":{"男":{"非常不满意":13,"一般般":1,"满意":1},"女":{"非常不满意":10,"一般般":4,"满意":1}}};
		//放置一个分析图表
		getComponent("/common/analysis1",
				function(result){
					$("#container").append(result);
					initChart3(dataJson,"myChart_"+orderNum);
		},{"-title-":title,"-zi-":ziTitle,"-yin-":yinTitle,"-id-":orderNum});
	}
	//4.自变量：选择／维度，因变量：滑条
	else if(chartType =="chart4"){
		//获取json
//		var dataJson = {"男":{"温度满意度":{"1":10,"2":0,"3":5,"4":3,"5":8,"6":2},"湿度满意度":{"1":6,"2":6,"3":3,"4":3,"5":8,"6":2}},"女":{"温度满意度":{"1":5,"2":9,"3":1,"4":3,"5":8,"6":2},"湿度满意度":{"1":12,"2":1,"3":2,"4":3,"5":8,"6":2}}};
		//放置一个分析图表
		getComponent("/common/analysis1",
				function(result){
					$("#container").append(result);
					initChart4(dataJson,"myChart_"+orderNum);
		},{"-title-":title,"-zi-":ziTitle,"-yin-":yinTitle,"-id-":orderNum});
	}
	//添加完分析后，屏幕滚动到新增分析的位置
	var analysisId = "analysis_"+orderNum;
	var mainContainer = $('#content .ui.grid .content-team'),
	scrollToContainer =$("#analysis_"+orderNum);//滚动到最后一个添加的分析处
	//动画效果
	mainContainer.animate({
	    scrollTop: scrollToContainer.offset().top + mainContainer.scrollTop()-134
	  }, 1000);//2秒滑动到指定位置
	orderNum++;
}
//初始化图表--自变量：选择／维度，因变量：选择
function initChart1(json,divID,title){
	var xaxis1 = [];
	var data = [];
	var n=0;
	for(var y in json){
		var x_obj = json[y];
		var x_axis = [];
		var y_axis = [];
		var tiptextArr =[];
		for(var x in x_obj){
			x_axis.push(x);
			y_axis.push(x_obj[x]);
				tiptextArr.push(getLangStr("surveyAna_zi")+"："+y+","+getLangStr("surveyAna_yin")+"："+x.length>10?x.substring(0,10):x);
		}
		var trace = {
				x:x_axis,
				y:y_axis,
				name:y,
				type:'bar',
				text: tiptextArr,
				marker: {
				    color: colorArr[n],
				    opacity: 0.6}
		};
		data.push(trace);
		n++;
	}
	if(!title)title="";
	var layout = {barmode: 'group',title: title,};
	Plotly.newPlot(divID, data, layout);
}
function initChart3(json,divID){
	var n = 1;
	for(var chartname in json){
		var json1 = json[chartname];
		$("#"+divID).append("<div id='myDiv_"+orderNum+"_"+n+"' class='small-chart'></div>");
		initChart1(json1,"myDiv_"+orderNum+"_"+n,chartname);
		n++;
	}
}
function initChart4(json,divID){
//	var trace1 = {
//	  x: [1, 2, 3, 4],
//	  y: [10, 15, 13, 17],
//	  type: 'scatter'
//	};
//
//	var trace2 = {
//	  x: [1, 2, 3, 4],
//	  y: [16, 5, 11, 9],
//	  type: 'scatter'
//	};
//
//	var data = [trace1, trace2];
//
//	Plotly.newPlot(divID, data);
//	
	var n = 1;
	for(var chartname in json){
		var json1 = json[chartname];
		$("#"+divID).append("<div id='myDiv_"+orderNum+"_"+n+"' class='small-chart-1'></div>");
		var xaxis1 = [];
		var data = [];
		var num=0;
		for(var y in json1){
			var x_obj = json1[y];
			var x_axis = [];
			var y_axis = [];
			for(var x in x_obj){
				x_axis.push(x);
				y_axis.push(x_obj[x]);
			}
			var trace = {
					x:x_axis,
					y:y_axis,
					name:y,
					type:'scatter',
					marker: {
					    color: colorArr[n],
					    opacity: 0.6}
			};
			data.push(trace);
			num++;
		}
		if(!chartname)chartname="";
		var layout = {barmode: 'group',title: chartname,};
		Plotly.newPlot("myDiv_"+orderNum+"_"+n, data, layout);
		n++;
	}
}
//==============================调用生成问卷分析==============================
$("#chartDropdown_1").dropdown();
//$("#datatable_ddd").DataTable({ scrollY: '50vh', scrollCollapse: true, paging: false ,"language": {  "info": "", "infoEmpty": "没有记录", "infoFiltered": "" }});
//==============================调用方法==============================
function getSetting(surveyId){
	var url = "/admin/survey/getDimension";
	var json = {"surveyID":surveyId};
	var setting ={};
	function successFunc(data){
		var dataList = data.projectList;
		var projectSettingList = [];
		var buildingSettingList = [];
		var pointSettingList = [];
		for(var n in dataList){
			var projectName = dataList[n].projectName;
			var projectID = dataList[n].projectID;
			projectSettingList.push({can_input:false,id:projectID,text:projectName});
			var buildingList = dataList[n].buildingList;
			if(buildingList && buildingList.length!=0){
				for(var i in buildingList){
					var buildingName = buildingList[i].buildingName;
					var buildingID = buildingList[i].buildingID;
					buildingSettingList.push({can_input:false,id:buildingID,text:buildingName});
					var buildingPointList = buildingList[i].buildingPointList;
					if(buildingPointList && buildingPointList.length!=0){
						for(var j in buildingPointList){
							var buildingPointName = buildingPointList[j].buildingPointName;
							var buildingPointID = buildingPointList[j].buildingPointID;
							pointSettingList.push({can_input:false,id:buildingPointID,text:buildingPointName});
						}
					}
				}
			}
		}
		setting={projectSettingList:projectSettingList,buildingSettingList:buildingSettingList,pointSettingList:pointSettingList};
	}
	sentJsonSync(url,json,successFunc);
	return setting;
}
