 var datatable;
/*存放缓存中的，项目id*/
var teamID = $.cookie("teamid");
//var surveyParam = $.cookie("surveyparam");
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
	$("#content").css("height",window_height-55);
	//main的宽度是，屏幕宽度减去左侧导航栏宽度
	$('#content').css("width",window_width-60+1);
//	$('.ui.grid').css("min-width",1200);
}
$(window).resize(function(){
	/*动态设置内容区高度  */
	init();
});
$(function(){
	init();
})
/*内容区左侧导航添加tab切换事件  */
$("#submenu .item").click(function(){
	$(this).addClass("on").siblings().removeClass("on");
});

/*内容区头部切换导航*/
$(".main .ui.inverted.icon.menu .item").click(function(){
    $(this).addClass("on").siblings().removeClass("on");
});

//复选框点击效果
$('.ui.checkbox')
.checkbox()
;
//获取问卷列表信息
function getSurveyData(){
	var url="/admin/survey/list";
//	var json={"projectID":teamID};
//	var json={"projectID":"-1"};
	var json={};
	var successFunc = function(data){
		var surveys = data.list;
		for(i in surveys){
			var survey = surveys[i];
			var id = survey.id;
			var name = survey.name;
			var count = survey.count;
			var title = survey.title;
			var isFinished = survey.isFinished==0?getLangStr("surveyListDevice_notfinished"):getLangStr("surveyListDevice_finished");
			var statusClass = survey.isFinished==0?"unfinished":"";
			var introduction = survey.introduction;
			var host = window.location.host;
			var state = survey.state==0?getLangStr("viewWxNo"):getLangStr("viewWxYes");
			var doReleaseWx = survey.state==0?getLangStr("doRelease"):getLangStr("cancelRelease");
			//将数据放到页面
			var htmlStr =$("<tr> <td><div class='ui fitted checkbox' data-id='"+id+"' data-count='"+count+"' data-status='"+survey.isFinished+"' ><input type='checkbox' class='hidden'><label></label></div></td><td>"+title+"</td> <td>"+introduction+"</td> <td>"+name+"</td> <td>"+count+"</td>" +
					"<td style='position:relative'><a class='answerUrl' data-url='http://"+host+"/survey/mobileSurvey?role=admin&surveyId="+id+"' href='javascript:void(0)'>"+getLangStr("survey_copyurl")+"</a></td>" +
					"<td><a class='qrcode' style='text-decoration:underline' href='javascript:void(0)' data-url='"+host+"/survey/mobileSurvey?role=admin&surveyId="+id+"' >"+getLangStr("viewQR")+"</a></td>" +
				    "<td><a class='link' style='text-decoration:underline' href='javascript:void(0)' data-surveyid='"+id+"'>"+getLangStr("viewLink")+"</a></td>" +
				    "<td class='release-to-wx' data-id='"+id+"' data-state='"+survey.state+"' data-change='"+doReleaseWx+"' data-html='"+state+"'>"+state+"</td>" +
				    "<td class='"+statusClass+"' data-id='"+id+"'>"+isFinished+"</td></tr>"); 
			$("#datatable_body").append(htmlStr);
		}
		$("#datatable_body").find(".ui.checkbox").checkbox();
		//初始化datatable
		 datatable =$('#datatable').DataTable(
	    	{
	    	"pageLength": 8,
	    	"lengthChange": false,
	    	"ordering": true,
	    	"order": [],
	    	"language": {
	    		"info":getLangStr("datatable_info"),
	    		"infoFiltered":getLangStr("datatable_infoFiltered"),
	        	"infoEmpty":getLangStr("datatable_infoEmpty"),
	        	"emptyTable":getLangStr("datatable_emptyTable"),
	        	"search":"",
        		"paginate": {
        	        "next":     getLangStr("datatable_next"),
        	        "previous":   getLangStr("datatable_previous")
        	    }
	    	},
	    	"columns": [
    	            	null,
	    	            { "width": "10rem" },
	    	            null,
	    	            { "width": "6rem" },
	    	            { "width": "6rem" },
	    	            { "width": "5rem" },
	    	            { "width": "5rem" },
	    	            { "width": "5rem" },
	    	            { "width": "5rem" },
	    	            { "width": "5rem" }
        ]
	    });
	    $("#datatable_body").on("click",".ui.checkbox",function(){
			var nodes = datatable.rows().nodes();
			for(var n=0;n<nodes.length;n++){
				$(nodes[n]).find(".ui.checkbox").checkbox("uncheck");
			}
			$(this).checkbox("check");
		});
		//调整表格元素方位
	    $("#datatable_wrapper .ui.grid").find(".row:first").css("padding",0);
	    $("#datatable_wrapper .ui.grid").find(".row:first").find(".column:first").remove();
	    $("#datatable_wrapper .ui.grid").find(".row:first").find(".column").removeClass("right");
	    $("#datatable_wrapper .ui.grid").find(".row:first").find(".column").removeClass("aligned");
	    $page = $("#datatable_wrapper .ui.grid").find(".row:last").find(".column:first");
	    $("#datatable_wrapper .ui.grid").find(".row:first").append($page);
	    //给查询框添加放大镜图标
		var input_html = $('#datatable_filter').removeClass("input");
		var input_html = $('#datatable_filter').addClass("left");
		var input_html = $('#datatable_filter').addClass("icon");
		var input_html = $('#datatable_filter').addClass("input");
		$('#datatable_filter label').css("position","relative");
		$('#datatable_filter label').append('<i class="search icon" style="position:absolute;top:.4rem;left:1rem;"></i>');
		$('#datatable_filter label input').css("padding-left","2rem")
		
	}
	sentJson(url,json,successFunc);
}

$(document).ready(function() {
	//获取数据，放置到页面table中
	getSurveyData()
} );
//鼠标悬浮，发布到微信，取消发布
$(".surveylist").on("mouseenter",".release-to-wx",function(){
	var changeStr = $(this).data("change");
	$(this).addClass("hoveractive");
	$(this).html(changeStr);
});
$(".surveylist").on("mouseleave",".release-to-wx",function(){
	var changeStr = $(this).data("html");
	$(this).removeClass("hoveractive");
	$(this).html(changeStr);
});
$(".surveylist").on("click",".release-to-wx",function(){
	var $this = $(this);
	var id = $(this).data("id");
	if($(this).data("state")==0){
		//发布	
		var url="/admin/survey/release";
		var json={
			surveyId: id,
			operation: 1
		};
		var successFunc = function(data){
			$this.data("change",getLangStr("cancelRelease"));
			$this.data("html",getLangStr("viewWxYes"));
			$this.html(getLangStr("viewWxYes"));
			$this.removeClass("hoveractive");
		}
		sentJson(url,json,successFunc);
	}else{
		//取消发布
		var url="/admin/survey/release";
		var json={
			surveyId: id,
			operation: 0
		};
		var successFunc = function(data){
			$this.data("change",getLangStr("doRelease"));
			$this.data("html",getLangStr("viewWxNo"));
			$this.html(getLangStr("viewWxNo"));
			$this.removeClass("hoveractive");
		}
		sentJson(url,json,successFunc);
	}
})
//点击新增题库按钮
$("#surveyLibrary").click(function(){
	window.location.href += "?item=library"
})
//点击新增问卷按钮
$("#addSurvey").click(function(){
	window.location.href = "/admin/survey?item=increase"
})
//点击修改问卷
$("#editSurvey").click(function(){
	if($("#datatable_body").find(".ui.checkbox.checked").length==0){
		alertokMsg(getLangStr("survey_alert1"),getLangStr("alert_ok"));
		return false;
	}
	if( $("#datatable_body").find(".ui.checkbox.checked").data("status")==0){
		editSurvey();
	}else{
		alertMsg(getLangStr("survey_alert9"),getLangStr("alert_cancel"),getLangStr("alert_confirm"),"editSurvey");
	}
})
function editSurvey(){
	var id = $("#datatable_body").find(".ui.checkbox.checked").data("id");
	$.cookie("editSurveyId",id);
	window.location.href="/admin/survey?item=increase&mode=modify";
}
//未编辑完的，点击进入编辑	    
$("#datatable").on("click",".unfinished",function(){
	var id = $(this).data("id");
	$.cookie("editSurveyId",id);
	window.location.href="/admin/survey?item=increase&mode=modify";
});
//问卷地址，点击复制	
$('#datatable').on("click",".answerUrl",function(){
	// 创建元素用于复制
      var aux = document.createElement("input");
      // 获取复制内容
      var copyUrl =  $(this).data("url");
      // 设置元素内容
      aux.setAttribute("value", copyUrl);
      // 将元素插入页面进行调用
      document.body.appendChild(aux);
      // 复制内容
      aux.select();
      // 将内容复制到剪贴板
      document.execCommand("copy");
      // 删除创建元素
      document.body.removeChild(aux);
	alertokMsg(getLangStr("surveyListDevice_export6"),getLangStr("alert_ok"));
})
//点击问卷统计按钮
$("#surveyReport").click(function(){
	if($("#datatable_body").find(".ui.checkbox.checked").length==0){
		alertokMsg(getLangStr("survey_alert1"),getLangStr("alert_ok"));
		return false;
	}
	var id = $("#datatable_body").find(".ui.checkbox.checked").data("id");
	var count = $("#datatable_body").find(".ui.checkbox.checked").data("count");
	if(count==0){
		alertokMsg(getLangStr("survey_alert2"),getLangStr("alert_ok"));
		return false;
	}
	$.cookie("gxsurveyId",id);
	$.cookie("gxstarttime","");
	$.cookie("gxendtime","");
	$.cookie("gxrelation",0);
	$.cookie("gxobjectId",-1);
	$.cookie("gxteamId","");
	$.cookie("gxteamName","");
	$.cookie("gxbuildingId","");
	$.cookie("gxbuildingName","");
	$.cookie("gxpointId","");
	$.cookie("gxpointName","");
	window.location.href="/admin/survey?item=statistics"
})
//点击问卷分析按钮
$("#surveyAnalysis").click(function(){
	if($("#datatable_body").find(".ui.checkbox.checked").length==0){
		alertokMsg(getLangStr("survey_alert1"),getLangStr("alert_ok"));
		return false;
	}
	var id = $("#datatable_body").find(".ui.checkbox.checked").data("id");
	var count = $("#datatable_body").find(".ui.checkbox.checked").data("count");
	if(count==0){
		alertokMsg(getLangStr("survey_alert3"),getLangStr("alert_ok"));
		return false;
	}
	$.cookie("fxsurveyId",id);
	window.location.href="/admin/survey?item=analyze"
});
//点击下载答卷按钮
$("#surveyExport").click(function(){
	if($("#datatable_body").find(".ui.checkbox.checked").length==0){
		alertokMsg(getLangStr("survey_alert1"),getLangStr("alert_ok"));
		return false;
	}
	var count = $("#datatable_body").find(".ui.checkbox.checked").data("count");
	if(count==0){
		alertokMsg(getLangStr("survey_alert4"),getLangStr("alert_ok"));
		return false;
	}
	$('.basic.test.modal.export')
	  .modal('setting', 'closable', false)
	  .modal('show');
	$('#startTime').datetimepicker({step:10,format:"Y-m-d H:i:s"});
	$('#endTime').datetimepicker({step:10,format:"Y-m-d H:i:s"});
});
//点击下载excel
$("#exportExcel").click(function(){
	//校验是否选择了时间	
	var start = $('#startTime').val();
	var end = $('#endTime').val();
	if(start=="" || end==""){
		alertokMsg(getLangStr("survey_alert5"),getLangStr("alert_ok"));
		return false;
	}else if(start>end){
		alertokMsg(getLangStr("survey_alert6"),getLangStr("alert_ok"));
		return false;
	}
	addLoading();
	var answerList ;
	var questionList;
	var id = $("#datatable_body").find(".ui.checkbox.checked").data("id");
	var url="/admin/survey/download/answer";
	var json={"surveyID":id,"startTime":start,"endTime":end,"relation":0,"objectID":""};
	var successFunc = function(data){
		answerList = data.list;
	};
	sentJsonSync(url,json,successFunc);
	url = "/admin/survey/download/question";
	json={"surveyID":id};
	successFunc = function(data){
		questionList = data.list;
		//设置文件名为问卷名	
		var surveytitle = data.title;
		$("#exportExcel").attr("download",surveytitle+".xls");
	};
	sentJsonSync(url,json,successFunc);
	initExportData(questionList,answerList);
	var successExport = ExcellentExport.excel(this, 'exceltable', 'sheeetname')
	removeLoading();
	$('.basic.test.modal.export')
	  .modal('setting', 'closable', false)
	  .modal('hide');
	return successExport;
})
//点击查看二维码
$("#datatable").on("click","#datatable_body .qrcode",function(){
	$("#qrcode").empty();
	var url = $(this).data("url");
	jQuery('#qrcode').qrcode("http://"+url);
	$('.basic.test.modal.showqr')
	  .modal('setting', 'closable', false)
	  .modal('show');
})
// 点击下载二维码
$("#downloadqr").click(function(){
	$("#qrcode canvas").attr("id","qrcanvas");
	var $canvas = document.getElementById('qrcanvas');
	saveCanvas($canvas,'deviceQR','png');
});
//点击查看关联
$("#datatable").on("click","#datatable_body .link",function(){
	$(".qr-container").transition('hide');
	$("#gotoReport").transition('hide');
	var surveyid = $(this).data('surveyid');
	setTree(surveyid);
})
//点击关联里的维度，显示二维码和跳转链接
$("#projectList").on("click",".answer:not(.disable)",function(){
	if(!$(this).hasClass("nodata")){
		
		$("#projectList .answer").removeClass("active");
		$(this).addClass("active");
		
		$(".qr-container").transition('hide');
		$("#gotoReport").transition('hide');
		//动画
		$(".qr-container").transition('fly left');
		$("#gotoReport").transition('fly right');
		
		$("#qrcode_weidu").empty();
		var url = $(this).data("url");
		jQuery('#qrcode_weidu').qrcode({
			text:"http://"+url,
			width: $('#qrcode_weidu').width(), //宽度//高度 
			height:$('#qrcode_weidu').height(),
		});
		
		var projectid = $(this).data("projectid");
		var buildingid = $(this).data("buildingid");
		var pointid = $(this).data("pointid");
		var projectname = $(this).data("projectname");
		var buildingname = $(this).data("buildingname");
		var pointname = $(this).data("pointname");
		var relation = $(this).data("type");
		
		$("#gotoReport").attr("data-projectid",projectid);
		$("#gotoReport").attr("data-buildingid",buildingid);
		$("#gotoReport").attr("data-pointid",pointid);
		$("#gotoReport").attr("data-projectname",projectname);
		$("#gotoReport").attr("data-buildingname",buildingname);
		$("#gotoReport").attr("data-pointname",pointname);
		$("#gotoReport").attr("data-type",relation);
	}
})
$("#gotoReport").click(function(){
	var projectid = $(this).data("projectid");
	var buildingid = $(this).data("buildingid");
	var pointid = $(this).data("pointid");
	var projectname = $(this).data("projectname");
	var buildingname = $(this).data("buildingname");
	var pointname = $(this).data("pointname");
	var relation = $(this).data("type");
	$.cookie("gxsurveyId",$.cookie("treeselectid"));
	$.cookie("gxstarttime","");
	$.cookie("gxendtime","");
	$.cookie("gxrelation",relation);
	$.cookie("gxobjectId","");
	$.cookie("gxteamId",projectid==undefined?null:projectid);
	$.cookie("gxteamName",projectname==undefined?null:projectname);
	$.cookie("gxbuildingId",buildingid==undefined?null:buildingid);
	$.cookie("gxbuildingName",buildingname==undefined?null:buildingname);
	$.cookie("gxpointId",pointid==undefined?null:pointid);
	$.cookie("gxpointName",pointname==undefined?null:pointname);
	window.location.href="/redirect?url=administrator/surveyReport_manage.jsp"
})
//删除问卷
$("#surveyDelete").click(function(){
	if($("#datatable_body").find(".ui.checkbox.checked").length==0){
		alertokMsg(getLangStr("survey_alert1"),getLangStr("alert_ok"));
		return false;
	}
	alertMsg(getLangStr("survey_alert7"),getLangStr("alert_cancel"),getLangStr("alert_ok"),"surveyDelete");
})
function surveyDelete(){
	var id = $("#datatable_body").find(".ui.checkbox.checked").data("id");
	var count = $("#datatable_body").find(".ui.checkbox.checked").data("count");
	var url="/admin/survey/delete";
	var json={"surveyID":id};
	var successFunc = function(data){
		if(data.code==200){
			$("#datatable_body").find(".ui.checkbox.checked").parent().parent().addClass("selected");
			datatable.rows('.selected').remove();
			$("#datatable_body").find(".ui.checkbox.checked").parent().parent().remove();
		}
	};
	sentJson(url,json,successFunc);
}
//============================下载excel解析数据============================
function initExportData(list,answerList){
	//解析后的数据
	//{"序号":[1,2],"提交时间":[],"维度":[],"questionid1":[],"questionid2":[],"questionid3-1":[],"questionid3-2":[],}	
	var dataArr = {"order":[],"time":[],"relation":[]};
	var titleArr = {"order":getLangStr("surveyListDevice_excel_order"),"time":getLangStr("surveyListDevice_excel_time"),"relation":getLangStr("surveyListDevice_excel_dimension")};
	//获取题目
	var questionTypeArr = {};
	var questionOrder = 1;
	for(var i in list){
		//这时候是段落list
		var questionList = list[i].questionList;
		for(var j in questionList){
			var question = questionList[j];
			var type = question.type;
			var title = question.title;
			var questionID = question.questionID;
			var setting =  eval('(' + question.setting + ')');
			if(type==1){//单选
				dataArr["question"+questionID]=[];
				titleArr["question"+questionID]=questionOrder+"、"+title;
			}else if(type==2){//多选
				dataArr["question"+questionID]=[];
				titleArr["question"+questionID]=questionOrder+"、"+title;
			}else if(type==3){//量表
				var y_axis = setting.y_axis;
				for(var n in y_axis){
					var y = y_axis[n];
					var y_id = y.id;
					dataArr["question"+questionID+"-"+y_id]=[];
					if(n==0){
						titleArr["question"+questionID+"-"+y_id]=questionOrder+getLangStr("surveyListDevice_export1")+y.left+"("+title+")";
					}else{
						titleArr["question"+questionID+"-"+y_id]=getLangStr("surveyListDevice_export2")+y.left+"("+title+")";
					}
				}
			}else if(type==4){//滑条
				var items = setting.items;
				for(var n in items){
					var item = items[n];
					var item_id = item.id;
					dataArr["question"+questionID+"-"+item_id]=[];
					if(n==0){
						titleArr["question"+questionID+"-"+item_id]=questionOrder+getLangStr("surveyListDevice_export3")+item.left+"("+title+")";
					}else{
						titleArr["question"+questionID+"-"+item_id]=getLangStr("surveyListDevice_export4")+item.left+"("+title+")";
					}
				}
			}else if(type==0){//填空
				dataArr["question"+questionID]=[];
				titleArr["question"+questionID]=questionOrder+"、"+title;
			}
			questionOrder = parseInt(questionOrder);
			questionOrder++;
			questionTypeArr[questionID]=type;
		}
	}
	//获取答案	
	for(var i in answerList){
		var peopleAnswer = answerList[i];
		var time = peopleAnswer.time;
		var relation = peopleAnswer.surveyRelation;
		var name = relation==0?getLangStr("surveyListDevice_export5"):peopleAnswer.name;
		var ip = peopleAnswer.ip;
		var answers = peopleAnswer.answers;
		
		dataArr["order"].push((parseInt(i)+1));
		dataArr["time"].push(time);
		dataArr["relation"].push(name);
		for(var j in answers){
			var answer = answers[j];
			var id = answer.questionid;
			var type = questionTypeArr[id];
			var content = eval('(' + answer.content + ')');
			if(type==1){//单选
				var val = content.val==undefined?content.id:content.val;
				if(content.id==undefined){//选填题没答的情况
					val="";
				}
				dataArr["question"+id].push(val);
			}else if(type==2){//多选
				var contentAnswers = content.answers;
				if(contentAnswers==undefined){
					dataArr["question"+id].push("");
				}else{
					var answerVal = "";
					for(var n in contentAnswers){
						var val = contentAnswers[n].val==undefined?contentAnswers[n].id:contentAnswers[n].val;
						if(n!=0){
							answerVal+=",";
						}
						answerVal+=val;
					}
					dataArr["question"+id].push(answerVal);
				}
			}else if(type==3){//量表
				var contentAnswers = content.answers;
				for(var n in contentAnswers){
					var y_id = contentAnswers[n].id;
					var y_val = contentAnswers[n].val;
					dataArr["question"+id+"-"+y_id].push(y_val);
				}
			}else if(type==4){//滑条
				var contentAnswers = content.answers;
				for(var n in contentAnswers){
					var y_id = contentAnswers[n].id;
					var y_val = contentAnswers[n].value;
					dataArr["question"+id+"-"+y_id].push(y_val);
				}
			}else if(type==0){//填空
				var val = content.answer==undefined?"":content.answer;
				dataArr["question"+id].push(val);
			}
		}
	}
	//获取行数据
	var tabletitle = [];
	for(var index in titleArr){
		tabletitle.push(index);
	}
	//题目数量
	var answerLength = answerList.length;
	//放置table中的标题	
	var newTitletr = "<tr>"; 
	for(var j=0;j<tabletitle.length;j++){
		newTitletr+="<td>"+titleArr[tabletitle[j]]+"</td>"
	}
	newTitletr+="</tr>";
	$("#exceltable").empty();
	$("#exceltable").append(newTitletr);
	//放置table中的数据
	for(var i =0;i<answerLength;i++){
		var newTr = "<tr>";
		for(var j=0;j<tabletitle.length;j++){
			newTr+="<td>"+dataArr[tabletitle[j]][i]+"</td>";
		}
		newTr+="</td>";
		$("#exceltable").append(newTr);
	}	
}
//========================获取问卷下维度列表，解析树状json==========================
function setTree(surveyID){
	$.cookie("treeselectid",surveyID);
	var url="/admin/survey/getDimension";
	var json={"surveyID":surveyID};
	var successFunc = function(data){
		var projectList = data.projectList;
		$("#projectList").empty();
		//如果没有维度信息			
		if(projectList.length==0){
			var $project_item =$("<div class='item'>"+
				    "<div class='content'>"+
				    "  <a class='header answer nodata' >"+getLangStr("survey_alert8")+"</a>"+
				    "</div>"+
				    "</div>"); 
					$("#projectList").append($project_item);
		}
		var host = window.location.host;
		for(var i=0;i<projectList.length;i++){
			var projectName = projectList[i].projectName;
			var projectID = projectList[i].projectID;
			var buildingList = projectList[i].buildingList;
			var projectclick = projectList[i].click;
			var $project_item =$("<div class='item'>"+
		    "<i class='folder green icon'></i>"+
		    "<div class='content'>"+
		    "  <a class='header answer' data-projectid='"+projectID+"' data-projectname='"+projectName+"' data-type='1' data-click='"+projectclick+"' data-url='"+host+"/survey/mobileSurvey?role=admin&surveyId="+surveyID+"&teamId="+projectID+" '>"+projectName+"</a>"+
		    "</div>"+
		    "</div>") 
			$("#projectList").append($project_item);
			if(projectclick==1){
				$("#projectList").find(".item:last .answer").addClass("disable");
			}
//			else{
//				$("#projectList").find(".item:last>.content").append("<a class='header qr' data-url='"+host+"/views/mobile/mobileSurvey.jsp?surveyId="+surveyID+"&teamId="+projectID+" '  data-click='"+projectclick+"'>二维码</a>");
//			}
			if(buildingList.length>0){
				var $building_list = $("<div class='ui list' id='buildingList'></div>");
				$project_item.find(".content").append($building_list);
				for(var j=0;j<buildingList.length;j++){
					var buildingName = buildingList[j].buildingName;
					var buildingID = buildingList[j].buildingID;
					var buildingPointList = buildingList[j].buildingPointList;
					var buildingclick = buildingList[j].click;
					var $building_item =$("<div class='item'>"+
						    "<i class='folder green icon'></i>"+
						    "<div class='content'>"+
						    "  <a class='header answer' data-projectid='"+projectID+"' data-projectname='"+projectName+"' data-buildingname='"+buildingName+"' data-type='2' data-buildingid='"+buildingID+"' data-click='"+buildingclick+"' data-url='"+host+"/survey/mobileSurvey?role=admin&surveyId="+surveyID+"&teamId="+projectID+"&buildingId="+buildingID+" '>"+buildingName+"</a>"+
						    
						    "</div>"+
						    "</div>") 
					$building_list.append($building_item);
					if(buildingclick==1){
						$building_list.find(".item:last .answer").addClass("disable");
					}
//					else{
//						$building_list.find(".item:last>.content").append("  <a class='header qr' data-url='"+host+"/views/mobile/mobileSurvey.jsp?surveyId="+surveyID+"&teamId="+projectID+"&buildingId="+buildingID+" ' data-click='"+buildingclick+"' >二维码</a>");
//					}
					if(buildingPointList.length>0){
						var $buildingPoint_list = $("<div class='ui list' id='buildingPointList'></div>");
						$building_item.find(".content").append($buildingPoint_list);
						for(var n=0;n<buildingPointList.length;n++){
							var buildingPointName = buildingPointList[n].buildingPointName;
							var buildingPointID = buildingPointList[n].buildingPointID;
							var buildingPointclick = buildingPointList[n].click;
							var $buildingPoint_item =$("<div class='item'>"+
								    "<i class='folder green icon'></i>"+
								    "<div class='content'>"+
								    "  <a class='header answer' data-projectid='"+projectID+"' data-projectname='"+projectName+"' data-buildingname='"+buildingName+"' data-type='3' data-buildingid='"+buildingID+"' data-pointid='"+buildingPointID+"' data-pointname='"+buildingPointName+"'   data-click='"+buildingPointclick+"' data-url='"+host+"/views/mobile/mobileSurvey.jsp?surveyId="+surveyID+"&teamId="+projectID+"&buildingId="+buildingID+"&pointId="+buildingPointID+" '>"+buildingPointName+"</a>"+
								    "</div>"+
								    "</div>") 
									$buildingPoint_list.append($buildingPoint_item);
									if(buildingPointclick==1){
										$buildingPoint_list.find(".item:last .answer").addClass("disable");
									}
//									else{
//										$buildingPoint_list.find(".item:last>.content").append("  <a class='header qr' data-url='"+host+"/views/mobile/mobileSurvey.jsp?surveyId="+surveyID+"&teamId="+projectID+"&buildingId="+buildingID+"&pointId="+buildingPointID+" '  data-click='"+buildingPointclick+"' >二维码</a>");
//									}
						}
					}
				}
			}
		};
		//顶部查询
		$("#search").keyup(function(event){  
			var searchContent = $('#search').val();
			//删掉输入内容开头的空格
			while(searchContent.substring(0,1)==" "){
				searchContent = searchContent.substring(1);
			} 
			$(".header.answer").each(function(){
				var name = $(this).html();
				//如果列表中某一项包含查询的内容,则高亮显示		
				if(name.indexOf(searchContent) >= 0 && searchContent!=""){
					$(this).addClass("search");
				}else{
					$(this).removeClass("search");
				} 
			});
		});
		$('.basic.test.modal.tree')
		  .modal('setting', 'closable', false)
		  .modal('show');
	}
	sentJson(url,json,successFunc);
}
