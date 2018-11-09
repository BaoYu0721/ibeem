/*存放缓存中的，项目id*/
var teamID = $.cookie("teamid");
/*存放缓存中的，项目name*/
var teamName = $.cookie("teamname");
//var surveyParam = $.cookie("surveyparam");
//放置左上角项目名称
$(".teamTitleTit").html(teamName.length>10?teamName.substring(0,9)+"...":teamName);
//添加左侧导航栏
getComponent("/static/manage/components/leftpanel_manage.html",
		function(result){
			$(".fl.mainleft").html(result);
			/*左侧导航的选中效果*/
			$( ".leftmenu").click(function(){
			    $(this).addClass("active").siblings(".leftmenu").removeClass("active");
			});
			$("#team").addClass("active");
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
//所有绑定过当前项目的问卷列表
var projectSurveyList = [];
//获取问卷列表信息
function getSurveyData(){
	var url="/admin/getSurveyByProject";
	var json={"projectID":teamID};
	var successFunc = function(data){
		var surveys = data.list;
		for(i in surveys){
			var survey = surveys[i];
			projectSurveyList.push(survey.id);
			var id = survey.id;
			var name = survey.name;
			var count = survey.count;
			var title = survey.title;
			var introduction = survey.introduction;
			var host = window.location.host;
			//将数据放到页面
			var htmlStr =$("<tr> <td><div class='ui fitted checkbox' data-id='"+id+"' data-count='"+count+"' ><input type='checkbox' class='hidden'><label></label></div></td><td>"+title+"</td> <td>"+introduction+"</td> <td>"+name+"</td> <td>"+count+"</td>" +
					"<td style='position:relative'><a class='answerUrl' data-url='http://"+host+"/views/mobile/mobileSurvey.jsp?surveyId="+id+"&teamId="+teamID+"'>"+getLangStr("survey_copyurl")+"</a></td>" +
					"<td><a class='qrcode' style='text-decoration:underline' href='javascript:void(0)' data-url='"+host+"/views/mobile/mobileSurvey.jsp?surveyId="+id+"&teamId="+teamID+"' >"+getLangStr("viewQR")+"</a></td></tr>") 
			$("#datatable_body").append(htmlStr);
		}
		$("#datatable_body").find(".ui.checkbox").checkbox();
		$("#datatable_body").find(".ui.checkbox").click(function(){
			$("#datatable_body").find(".ui.checkbox").checkbox("uncheck");
			$(this).checkbox("check");
		});
		//初始化datatable
	    $('#datatable').DataTable(
	    	{
	    	"pageLength": 10,
	    	"lengthChange": false,
	    	"ordering": true,
	    	"order": [],
	    	"language": {
	    		"info":getLangStr("datatable_info"),
	    		"infoFiltered":getLangStr("datatable_infoFiltered"),
	        	"infoEmpty":getLangStr("datatable_infoEmpty"),
	        	"emptyTable":getLangStr("datatable_emptyTable"),
	        	"search":""
	    	},
	    	"columns": [
    	            	{ "width": "4rem" },
	    	            { "width": "9rem" },
	    	            null,
	    	            { "width": "6rem" },
	    	            { "width": "6rem" },
	    	            { "width": "5rem" },
	    	            { "width": "5rem" },
	    	]
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
	getSurveyData();
} );

$("#addSurvey").click(function(){
	window.location.href="/redirect?url=administrator/surveyAdd_manage.jsp"
})
var surveyArr=[];
$("#bindSurvey").click(function(){
	//获取没有绑定过项目的问卷列表
	var url="/survey/getListByAdmin";
	var json={"projectID":teamID};
	var successFunc = function(data){
		var list = data.list;
		$("#child").empty();
		for(var i=0;i<list.length;i++){
			var notBindId = list[i].id;
			if($.inArray(notBindId, projectSurveyList)!=-1){
				continue;
			}
			surveyArr.push(list[i]);
			var notBindName = list[i].title;
			$("#child").append("<li>"+  
                     "<div class='ui checkbox fl' data-id='"+notBindId+"'>"+  
                       "    <input type='checkbox' name='example'>"+  
                       "    <label></label>  "+
                       "</div>  "+
                     "<span class='fl'>"+notBindName+"</span>"+   
                     "</li>");
		}
		$("#child .ui.checkbox").checkbox();
	}
	sentJson(url,json,successFunc);
	 $('.basic.test.modal.addteam-modal')
	  .modal('setting', 'closable', false)
	  .modal('show');
})
//查询问卷
$('#search').keyup(function(event){  
	$this = $(this);
	var listStr = "";
	$("#child").empty();
   for(var i=0;i<surveyArr.length;i++){
	   var notBindName = surveyArr[i].title;
	   var notBindId = surveyArr[i].id;
	   var searchcontent = $this.val();
	   if(notBindName.indexOf(searchcontent) >= 0 || $.trim(searchcontent)==""){
		   $("#child").append("<li>"+  
                   "<div class='ui checkbox fl' data-id='"+notBindId+"'>"+  
                     "    <input type='checkbox' name='example'>"+  
                     "    <label></label>  "+
                     "</div>  "+
                   "<span class='fl'>"+notBindName+"</span>"+   
                   "</li>");
	   }
   } 
   $("#child .ui.checkbox").checkbox();
});
//绑定问卷确定按钮
$("#confirmBtn").click(function(){
	var bindLength = $("#child .ui.checkbox.checked").length;
	$("#child .ui.checkbox.checked").each(function(){
		var surveyId = $(this).data("id");
		var url = "/admin/bindProject";
		var json={"projectID":teamID,"surveyID":surveyId};
		var successFunc = function(data){
			bindLength--;
			if(bindLength==0){
				window.location.href="/redirect?url=administrator/surveyListTeam.jsp"
			}
		}
		sentJson(url,json,successFunc);
	});
});
//问卷统计
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
	$.cookie("gxrelation",1);
	$.cookie("gxobjectId",teamID);
	$.cookie("gxteamId",teamID);
	$.cookie("gxteamName",teamName);
	$.cookie("gxbuildingId","");
	$.cookie("gxbuildingName","");
	$.cookie("gxpointId","");
	$.cookie("gxpointName","");
	window.location.href="/redirect?url=administrator/surveyReportTeam.jsp?relation=1"
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
	window.location.href="/redirect?url=administrator/surveyAnalysisTeam.jsp?relation=1&objectID="+teamID
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
	var url="/admin/exportSurvey";
	var json={"surveyID":id,"startTime":start,"endTime":end,"relation":1,"objectID":teamID};
	var successFunc = function(data){
		answerList = data.list;
	};
	sentJsonSync(url,json,successFunc);
	url = "/admin/getSurveyByID";
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
// 点击下载二维码
$("#downloadqr").click(function(){
	$("#qrcode canvas").attr("id","qrcanvas");
	var $canvas = document.getElementById('qrcanvas');
	saveCanvas($canvas,'teamQR','png');
});
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
				dataArr["question"+id].push(val);
			}else if(type==2){//多选
				var contentAnswers = content.answers;
				var answerVal = "";
				for(var n in contentAnswers){
					var val = contentAnswers[n].val==undefined?contentAnswers[n].id:contentAnswers[n].val;
					if(n!=0){
						answerVal+=",";
					}
					answerVal+=val;
				}
				dataArr["question"+id].push(answerVal);
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
				var val = content.answer;
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