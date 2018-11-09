//根据屏幕宽度，设置fontSize
$(window).resize(function(){
	throttle(changeFontsize);
})
//节流函数,用于滚动和resize时解决高频发生造成的浏览器重绘卡死问题
function throttle(method, context) {
  //清除执行函数的定时器，第一次进入为空
  clearTimeout(method.tId); 
  //设置一个100ms后在指定上下文中执行传入的method方法的定时器。
  method.tId = setTimeout(function () {
    method.call(context);
  }, 100);
}
function changeFontsize(){
	console.log("====changeFontsize()=====");
	var windowWidth = document.documentElement.getBoundingClientRect().width;
	if(windowWidth<=750){
		console.log("windowWidth:"+windowWidth);
		var fontSize = windowWidth/750*50;
		console.log("font-size:"+fontSize);
		$("html").css("font-size",fontSize+"px");
	}
}
changeFontsize();//进入页面时先执行一次
   

$("#chooseLanguage>a").click(function(){
	$(this).addClass("active").siblings("a").removeClass("active");
	if($(this).data("value")=="language_ch"){
		window.localStorage.setItem("language","ch");
		setLanguageCookie();
		window.location.reload();
	}else if($(this).data("value")=="language_en"){
		window.localStorage.setItem("language","en");
		setLanguageCookie();
		window.location.reload();
	}
})
$(document).ready(function(){
	$("#submit").html(getLangStr("mobileSurvey_submit"));
})
//===========单选多选===========
$(".survercontent .container").on("click",".question.dx .option",function(){
	// 热点放大到点击option
	$(this).children(".ui.checkbox").checkbox('check');
	// 单选控制
	$(this).siblings().children(".ui.checkbox").checkbox('uncheck');
});
$(".survercontent .container").on("click",".question.ddx .option",function(){
	// 热点放大到点击option
	if($(this).find(".ui.checkbox input:checked").length>0){
		$(this).children(".ui.checkbox").checkbox('uncheck');
	}else{
		$(this).children(".ui.checkbox").checkbox('check');
	}
});
$(".survercontent .container").on("click",".question.ddx .option .ui.checkbox",function(){
	// 热点放大到点击option
	if($(this).find("input:checked").length>0){
		$(this).checkbox('uncheck');
	}else{
		$(this).checkbox('check');
	}
});
//获取参数方法
function GetQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}
//===========组装试卷==========
//获取题目json
addMobileLoading();
var url = "/survey/getSurveyByID";
var surveyId = GetQueryString("surveyId"); 
var teamId = "";
var buildingId = "";
var pointId = "";
//存储分页数据
var datalist = [];
//分页方式
var pagingtype ;

if(!surveyId || surveyId==""){
	surveyId = $.cookie("surveyId");
	teamId = $.cookie("surveyProjectId")=="null"?null:$.cookie("surveyProjectId"); 
	buildingId = $.cookie("surveyBuildingId")=="null"?null:$.cookie("surveyBuildingId"); 
	pointId = $.cookie("surveyPointId")=="null"?null:$.cookie("surveyPointId"); 
}else{
	teamId = GetQueryString("teamId"); 
	buildingId = GetQueryString("buildingId"); 
	pointId = GetQueryString("pointId"); 
	$.cookie("surveyId",surveyId);
	$.cookie("surveyProjectId",teamId);
	$.cookie("surveyBuildingId",buildingId);
	$.cookie("surveyPointId",pointId);
}

var json = {"surveyID":surveyId};
function func(data){
	createSurvey(data);
}
function errorfunc(data){
	var errorcode = data.code;
	var errormsg = data.messg;
	mobilealertokMsg("error!errorcode:"+errorcode+","+errormsg,getLangStr("alert_ok"));
}
sentJson(url,json,func,errorfunc);

//解析题目json
function createSurvey(jsonObj){
	var $root = $(".survercontent .container");
	//1.获取问卷title
	var surveytitle = jsonObj.title;
	$("#surveytitle span").html(surveytitle);
	//2.问卷介绍
	var introduction = jsonObj.introduction;
	$("#surveyintro span").html(introduction);
	//3.问卷ID
	var surveyID = jsonObj.surveyID;
	$.cookie("surveyID",surveyID);
	//4.获取分页方式
	var pagingType = jsonObj.pagingType==null?1:jsonObj.pagingType;
	pagingtype = pagingType;
	var pagingNum = jsonObj.pagingNum;
	//5.创建时间
	var surveyTime = jsonObj.createTime;
	//6.向页面添加题目
	var dllist = jsonObj.list;
	var list = [];
	var questionlength = 1;
	for(var i in dllist){
		var dltitle = dllist[i].title;
		var dlorder = dllist[i].order;
		if(dltitle!=""){
			var dlitem = {
					listtype : "dl",
					title : dltitle,
					order : dlorder
			}
			list.push(dlitem);
		}
		var questionList = dllist[i].questionList;
		for(j in questionList){
			var question = questionList[j];
			question.listtype = "question";
			question.questionorder = questionlength;
			list.push(question);
			questionlength++;
		}
	}
	//6.分页
	putItem(list,surveyTime);
	if(pagingType==1){
		//1）如果是不分页，则直接显示所有数据
	}else if(pagingType==3){
		//2）如果是按数量分页
		var pageList = [];
		var questionLength = 0;
		datalist.push(pageList);
		for(var i in list){
			if(list[i].listtype=="question"){//如果是题
				questionLength++;
				pageList.push(list[i].questionID+"_question");
				if((questionLength%pagingNum)==0){
					//页数的倍数，则新起一页
					pageList = [];
					datalist.push(pageList);
				}
			}else{//如果是段落
				pageList.push(list[i].order+"_dl");
			}
		}
	}else if(pagingType==2){
		//3)如果是按段落分页
		var pageList = [];
		for(var i in list){
			if(list[i].listtype=="dl"){//如果是段落,则新起一页
				pageList = [];
				datalist.push(pageList);
			}
			if(list[i].listtype=="question"){
				pageList.push(list[i].questionID+"_question");
			}else{
				pageList.push(list[i].order+"_dl");
			}
		}
	}
	setSurvey(datalist,pagingType,1);
	//初始化checkbox
	$(".ui.checkbox").checkbox();
	$(".ui.radio.checkbox").checkbox("uncheck");
}
function setSurvey(list,pagingType,pagenumnow){
	addLoading();
	//存储当前页数
	$(".survercontent .container").data('pagenow',pagenumnow);
	if(pagingType==1){
		
	}else if(pagingType==3){
		var pagelength = list.length;
		//只显示当前页的数据		
		var itemList = datalist[pagenumnow-1];
		$(".survercontent .container>.question").css("display","none");
		$(".survercontent .container>.dl").css("display","none");
		for(var n in itemList){
			$("#"+itemList[n]).css("display","block");
		}
		//设置分页		
		var pagingHtml = "<ul data-type='"+pagingType+"'>"+
		"<li data-page='1'>"+getLangStr("mobileSurvey_first")+"</li>";
		if(pagenumnow>1){
			pagingHtml += "<li data-page='"+(pagenumnow-1)+"'>"+getLangStr("mobileSurvey_previous")+"</li>";
		}else{
			pagingHtml += "<li data-page='1' class='disable'>"+getLangStr("mobileSurvey_previous")+"</li>";
		}
		if(pagelength>=3){
			if(pagenumnow<pagelength-1){
				pagingHtml+="<li data-page='"+(pagenumnow)+"' class='active'>"+(pagenumnow)+"</li>";
				pagingHtml+="<li data-page='"+(pagenumnow+1)+"'>"+(pagenumnow+1)+"</li>";
				pagingHtml+="<li data-page='"+(pagenumnow+2)+"'>"+(pagenumnow+2)+"</li>";
			}else{
				pagingHtml+="<li data-page='"+(pagenumnow)+"' class='active'>"+(pagenumnow)+"</li>";
				for(var num=(pagenumnow+1);num <=pagelength;num++){
					pagingHtml+="<li data-page='"+(num)+"'>"+(num)+"</li>";
				}
			}
		}else{
			for(var n=1;n<=pagingHtml;n++){
				if(n==pagenumnow){
					pagingHtml+="<li data-page='"+n+"' class='active'>"+n+"</li>";
				}else{
					pagingHtml+="<li data-page='"+n+"'>"+n+"</li>";
				}
			}
		}
		if(pagelength==pagenumnow){
			pagingHtml+="<li data-page='' class='disable'>"+getLangStr("mobileSurvey_next")+"</li>";
		}else{
			pagingHtml+="<li data-page='"+(pagenumnow+1)+"'>"+getLangStr("mobileSurvey_next")+"</li>";
		}
		pagingHtml+="<li data-page='"+pagelength+"'>"+getLangStr("mobileSurvey_last")+"</li>";
		
		pagingHtml+="<span style='font-size:0.6em;line-height:0.9rem;'>"+getLangStr("mobileSurvey_total")+pagelength+getLangStr("mobileSurvey_page")+"</span>";
		pagingHtml+="</ul>";
		
		$(".paging").html(pagingHtml);
		
	}else if(pagingType==2){
		var pagelength = list.length;
		//只显示当前页的数据		
		var itemList = datalist[pagenumnow-1];
		$(".survercontent .container>.question").css("display","none");
		$(".survercontent .container>.dl").css("display","none");
		for(var n in itemList){
			$("#"+itemList[n]).css("display","block");
		}
		//设置分页		
		var pagingHtml = "<ul data-type='"+pagingType+"'>";
		if(pagenumnow>1){
			pagingHtml += "<li data-page='"+(pagenumnow-1)+"'>"+getLangStr("mobileSurvey_previous")+"</li>";
		}else{
			pagingHtml += "<li data-page='1' class='disable'>"+getLangStr("mobileSurvey_previous")+"</li>";
		}
		if(pagelength==pagenumnow){
			pagingHtml+="<li data-page='' class='disable'>"+getLangStr("mobileSurvey_next")+"</li>";
		}else{
			pagingHtml+="<li data-page='"+(pagenumnow+1)+"'>"+getLangStr("mobileSurvey_next")+"</li>";
		}
		pagingHtml+="<span style='font-size:0.6em;line-height:0.9rem;'>"+getLangStr("mobileSurvey_total")+pagelength+getLangStr("mobileSurvey_page")+"</span>";
		pagingHtml+="</ul>";
		$(".paging").html(pagingHtml);
	}
	removeLoading();
}
function putItem(list,surveyTime){
	var $root = $(".survercontent .container");
	$root.empty();
	for(var i=0;i<list.length;i++){
		if(list[i].listtype=="dl"){
			$root.append("<span class='dl' id='"+list[i].order+"_dl"+"'>"+list[i].title+"</span>");
			continue;
		}
		var question = list[i];
		var required = question.required;//是否必答,0为必答
		var questionID = question.questionID;//题目ID
		var title = question.title;//题目内容
		var type = question.type;//题目类型 type问题类型 0填空、1单选、2多选、3多点、4滑条
		var setting = eval('(' + question.setting + ')'); ;//选项
		var num = question.questionorder;//题号
		//添加题目公共部分
		if(required=="0"){
			title += "("+getLangStr("mobileSurvey_must")+")"; 
		}
		if(type==2){
			
			var max_input = setting.max_input;
			var min_input = setting.min_input;
			if(max_input && min_input && surveyTime>"2017-08-22 00:00:00"){//多选title存值修改，为了避免历史数据出现问题
//				title = title+"("+getLangStr("surveyAdd_alert4")+max+getLangStr("surveyAdd_alert5")+"，"+getLangStr("surveyAdd_alert6")+min+getLangStr("surveyAdd_alert5")+")";
				title+="("+getLangStr("mobileSurvey_5")+max_input+getLangStr("mobileSurvey_6")+"，"+getLangStr("mobileSurvey_7")+min_input+getLangStr("mobileSurvey_6")+")";
			}
		}
		$root.append('<div class="question" id="'+questionID+'_question" data-id="'+questionID+'" data-mustanswer="'+required+'" data-num="'+num+'">'+
				'<span class="title"><b>'+num+'.'+title+'</b></span>'+
				'<div class="content">'+
				'</div>'+
				'</div>');
		var $thisquestion = $("#"+questionID+"_question");
		//填空题
		if(type==0){
			$thisquestion.addClass("tk");
			$thisquestion.find(".content").append('<div class="option">'+
					'<input type="text" />'+
					'</div>');
		}
		//单选题和多选题，选项一样的
		else if(type==1 || type==2){
			if(type==1){
				$thisquestion.addClass("dx");
			}
			if(type==2){
				$thisquestion.addClass("ddx");
			}
			var items = setting.items;
			for(var n =0;n<items.length;n++){
				var item = items[n];
	     		var itemtest = item.text;
				var has_img = item.has_img;
				var img_url = item.img_url;
				var can_input = item.can_input;
				var input_content = item.input_content;
				var itemid = item.id;
				var itemval = item.val;
				if(item.val==undefined || item.val==null){
					itemval = itemid;
				}
				var itemnum = n+1;
				if(has_img){
					$thisquestion.find(".content").append("<div class='option' data-id='"+itemid+" data-val='"+itemval+"'>"+
//							"<div class='ui fitted checkbox'>"+
//							  "<input name='example' type='checkbox'>"+
//							  "<label></label>"+
//							"</div>"+
							"<img src='"+img_url+"'>"+
						"</div>");
				}else if(can_input){
					if($.trim(input_content)==""){
						input_content = getLangStr("mobileSurvey_8");
					}
					$thisquestion.find(".content").append("<div class='option' data-id='"+itemid+"' data-val='"+itemval+"'>"+
//							"<div class='ui fitted checkbox'>"+
//							  "<input name='example' type='checkbox'>"+
//							  "<label></label>"+
//							"</div>"+
							"<input class='text-input' type='text' placeholder='"+input_content+"'/>"+
						"</div>");
				}else{
					$thisquestion.find(".content").append("<div class='option' data-id='"+itemid+"' data-val='"+itemval+"'>"+
//							"<div class='ui fitted checkbox'>"+
//							  "<input name='example' type='checkbox'>"+
//							  "<label></label>"+
//							"</div>"+
							"<span>"+itemtest+"</span>"+
						"</div>");
				}
				
			}
			if(type==1){
				//给选项添加单击事件
				$thisquestion.find(".option").click(function(){
					$(this).addClass("checked").siblings().removeClass("checked");
				});
			}
			//如果时多选题，还要添加最多最少选项的设置		
			if(type==2){
				var max_input = setting.max_input;
				var min_input = setting.min_input;
				var maxandmin = max_input+'-'+min_input;
				$thisquestion.attr("data-maxandmin",maxandmin);
				$thisquestion.on("click",".content .option",function(){
					$this = $(this);
					var max = max_input;
					var min = min_input;
					if($this.hasClass("checked")){
						$this.removeClass("checked")
					}else{
						$this.addClass("checked")
					}	
					setTimeout(function(){
						var selectedOptions = $this.parent().find(".option.checked").length;	
						if(selectedOptions>max){
							//如果超出最大选项数
							$this.removeClass("checked");
						}
//						else if(selectedOptions<min){
//							//如果小于最小选项数
//							$this.children(".ui.checkbox").checkbox('check');
//						}
					},100);
				})
			}
			
		}
		//量表题
		else if(type==3){
			$thisquestion.addClass("lb");
			$thisquestion.find(".content").append('<table class="ui celled table unstackable" id="lb_content"></table>');
			
			var x_axis = setting.x_axis;
			var y_axis = setting.y_axis;
			//组装第一行标题
			var $firstTr =  $("<tr><td></td></tr>");
			var scoreArr = [];
			for(var n=0;n<x_axis.length;n++){
				var score = x_axis[n].val;
				var tag = x_axis[n].tag;
				scoreArr.push(score);
				$firstTr.append("<td>"+tag+"</td>");
			}
			$firstTr.append("<td></td>");
			$thisquestion.find("#lb_content").append($firstTr);
			//组装其他行
			for(n=0;n<y_axis.length;n++){
				var trid =  y_axis[n].id;
				var lefttitle = y_axis[n].left;
				var righttitle = y_axis[n].right;
				var $newTr = $("<tr data-id='"+trid+"'></tr>");
				$newTr.append('<td class="left-title">'+lefttitle+'</td>');
				for(var l =0;l<scoreArr.length;l++){
					$newTr.append('<td><div class="ui radio checkbox" data-score="'+scoreArr[l]+'">'+
					        '<input type="radio" name="'+num+'_'+n+'" class="hidden"">'+
					        '<label></label>'+
					    '</div></td>');
				}
				if(!righttitle){
					righttitle = "";
				}
				$newTr.append('<td class="right-title">'+righttitle+'</td>');
				$thisquestion.find("#lb_content").append($newTr);
			}
		}
		//滑条题
		else if(type==4){
			$thisquestion.addClass("zx");
			$thisquestion.find(".content").append('<table style="width:100%;" id="zx_content"></table>');
			var items = setting.items;
			for(var n =0;n<items.length;n++){
				var item = items[n];
				var max_val = item.max_val;
				var min_val = item.min_val;
				var left = item.left;
				var right = item.right;
				if(!right){right=""};
				var interval = item.interval;
				var zxid = item.id;
				var $newTr = $("<tr></tr>");
				$newTr.append('<td class="left-title">'+left+'</td>'+
						'<td class="num"><input type="text" id="slider_num" data-id="'+zxid+'" placeholder="'+min_val+'" /></td>'+
//						'<td class="slider"><div id="'+num+'_slider_'+n+'"></div></td>'+
						'<td class="slider"><div class="nstSlider" id="'+num+'_slider_'+n+'" data-range_min='+min_val+' data-range_max='+max_val+' data-cur_min='+min_val+'  >'+
				    	'<div class="bar"></div><div class="leftGrip"></div></div></td>'+
						'<td class="right-title">'+right+'</td>');
				$thisquestion.find("#zx_content").append($newTr);
				var slidereleid = '#'+num+'_slider_'+n;
//				//初始化
//			    $(slidereleid).slider({
//			      range: "max",
//			      min: Number(min_val),
//			      max: Number(max_val),
//			      step:interval,
//			      value: Number(min_val),
//			      slide:function(event,ui){
//			    	  $(this).parent().parent().find("#slider_num").val( ui.value);
//			      }
//			    });
				//初始化
				var settingStr = "{\"rounding\": {\""+interval+"\" : "+max_val+"},\"left_grip_selector\": \".leftGrip\"," +
						"\"value_bar_selector\": \".bar\"," +
						"\"value_changed_callback\": function(cause, leftValue, rightValue) {" +
						"$(this).parent().parent().find(\"#slider_num\").val(leftValue);}}"
				var settingJson = eval('(' + settingStr + ')'); 		
							
//				$(slidereleid).nstSlider({
//					"rounding": {
//						"interval" : max_val
//				    },
//				    "left_grip_selector": ".leftGrip",
//				    "value_bar_selector": ".bar",
//				    "value_changed_callback": function(cause, leftValue, rightValue) {
//				        $(this).parent().parent().find("#slider_num").val(leftValue);
//				    }
//				});
				$(slidereleid).nstSlider(settingJson);
//				处理bug：滑块支持手机；实时数据页数据错误；问卷跳转；答题成功页；
			}
		}
	}
}
//===========分页点击事件==========
$(".paging").on("click","ul li",function(){
	//先存储当前页面的html，到htmllist
	if($(this).hasClass("disable"))return false;
	if($(this).hasClass("active"))return false;
	pagenum = $(this).data("page");
	setSurvey(datalist,pagingtype,pagenum);
})
//===========组装答案json==========
$("#submit").click(sendAnswer);
function sendAnswer(){
	addMobileLoading();
	var url = "/survey/answerSurvey";
	var answer = getAnswerJson();
	if(!answer){
		return false;
	}
	//判断题目的所属维度
	var objectID = "";
	var relation = "";
	if(!isNull(pointId)){//测点问卷
		relation = 3;
		objectID = pointId;
	}else if(!isNull(buildingId)){//建筑问卷
		relation = 2;
		objectID = buildingId;
	}else if(!isNull(teamId)){//项目问卷
		relation = 1;
		objectID = teamId;
	}else{//设备问卷
		relation = 0;
		objectID = "-1";
	}
	var toStringAnswer = JSON.stringify({"surveyID":surveyId,"objectID":objectID,"relation":relation,"list":answer});
	var json = {"answer":toStringAnswer};
	function func(data){
		window.location.href="/open?url=mobile/mobileSurveySuccess.jsp";
	}
	function errorfunc(data){
		var errorcode = data.code;
		var errormsg = data.messg;
		mobilealertokMsg("error!errorcode:"+errorcode+","+errormsg,getLangStr("alert_ok"));
	}
	sentJson(url,json,func,errorfunc);
}
function getAnswerJson(){
	var answersJson = [];
	for(var q=0;q<$(".question").length;q++){
		var question = $(".question")[q];
		$thisquestion = $(question);
		var questionno = $thisquestion.data("num");
		var json = {};
		var isanswered = true;
		var questionId = $thisquestion.data("id");//题目ID
		var required = $thisquestion.data("mustanswer")==0?true:false;//是否必答
		if($thisquestion.hasClass("dx")){//单选
			//校验必答
			if(required && $thisquestion.find(".content .option.checked").length==0){
				$(".error h4").html(getLangStr("mobileSurvey_9")+questionno+getLangStr("mobileSurvey_10"));
				return false;
			}else if(!required && $thisquestion.find(".content .option.checked").length==0){
				//如果不是必答，并且没有答
				isanswered = false;
			}else{
				//拼答案
				var $option = $thisquestion.find(".content .option.checked");
				var optionId = $option.data("id");
				var optionVal = $option.data("val");
				var input_content ="";
				if($option.find("input").length>0){
					input_content = $option.find("input").val();
				}
				json = {"id":optionId,"input_content":input_content,"val":optionVal};
			}
			
		}else if($thisquestion.hasClass("ddx")){//多选
			//校验必答
			if(required && $thisquestion.find(".content .option.checked").length==0){
				$(".error h4").html(getLangStr("mobileSurvey_9")+questionno+getLangStr("mobileSurvey_10"));
				return false;
			}
			if(!required && $thisquestion.find(".content .option.checked").length==0){
				//如果不是必答，并且没有答
				isanswered = false;
			}else{
				var maxandmin = $thisquestion.data("maxandmin");
				var max = maxandmin.split("-")[0];
				var min = maxandmin.split("-")[1];
				var length = $thisquestion.find(".content .option.checked").length
				if(length>max || length<min){
					$(".error h4").html(getLangStr("mobileSurvey_9")+questionno+getLangStr("mobileSurvey_7")+min+getLangStr("mobileSurvey_6")+"，"+getLangStr("mobileSurvey_5")+max+getLangStr("mobileSurvey_6"));
					return false;
				}
				//拼答案
				var answers=[];
				$thisquestion.find(".content .option.checked").each(function(){
					var optionId = $(this).data("id");
					var optionVal = $(this).data("val");
					var input_content = "";
					if($(this).find("input").length>0){
						input_content = $option.find("input").val();
					}
					answers.push({"id":optionId,"input_content":input_content,"val":optionVal});
				});
				json = {"answers":answers};
			}
		}else if($thisquestion.hasClass("tk")){//填空
			//校验必答
			if(required && $.trim($thisquestion.find(".content .option input").val())==""){
				$(".error h4").html(getLangStr("mobileSurvey_9")+questionno+getLangStr("mobileSurvey_10"));
				return false;
			}
			if(!required && $.trim($thisquestion.find(".content .option input").val())==""){
				//如果不是必答，并且没有答
				isanswered = false;
			}else{
				//拼答案
				var text = $thisquestion.find(".content .option input").val();
				json = {"answer": text};
			}
		}else if($thisquestion.hasClass("lb")){//量表
			//校验必答
			if(required){
				var table = $thisquestion.find(".content table tr");
				for(var n=1;n<table.length;n++){
					if($(table[n]).find(".ui.checkbox input[type=radio]:checked").length==0){
						$(".error h4").html(getLangStr("mobileSurvey_9")+questionno+getLangStr("mobileSurvey_10"));
						return false;
					}
				}
			}else{
				var table = $thisquestion.find(".content table tr");
				var tablehasanswered = false;
				var tablenotanswered = false;
				for(var n=1;n<table.length;n++){
					if($(table[n]).find(".ui.checkbox input[type=radio]:checked").length==0){
						//如果不必答，并且量表题有一行没有答
						tablenotanswered = true;
					}else{
						//如果不必答，并且量表题有一行答了
						tablehasanswered = true;
					}
				}
				//如果出现，有答有没答的，也就是两个变量都为true，则提示答完整
				if(tablehasanswered && tablenotanswered){
					$(".error h4").html(getLangStr("mobileSurvey_11")+questionno+getLangStr("mobileSurvey_12"));
					return false;
				}
				//如果一行都没答，则返回答案为空
				if(!tablehasanswered){
					isanswered = false;
				}
			}
			//拼答案
			var answers = [];
			if(isanswered){
				$thisquestion.find(".content table .ui.checkbox").each(function(){
					if($(this).checkbox('is checked')){
						var score = $(this).data("score");
						var lbtrid = $(this).parent().parent().data("id"); 
						answers.push({"id":lbtrid,"val":score});
					}
				})
			}else{
				var lbTr = $thisquestion.find(".content table>tbody>tr");
				for(var i =1;i<lbTr.length;i++){
					var lbtrid = $(lbTr[i]).data("id"); 
					answers.push({"id":lbtrid,"val":""});
				}
			}
			json = {"answers":answers};
		}else if($thisquestion.hasClass("zx")){//折线
			var answers = [];
			$thisquestion.find("#zx_content tr").each(function(){
				var val = $(this).find("#slider_num").val();
				var zxid = $(this).find("#slider_num").data("id");
				//判断是否必答
				if($thisquestion.data("mustanswer")==1){//非必答
					var min = $(this).find(".nstSlider").data("range_min");
					var max = $(this).find(".nstSlider").data("range_max");
					if(val == min ){
						val = (min+max)/2;//非必答下滑条题答案如果为最小值，则更改为最大加最小值的一半
					}
				}
				answers.push({"id":zxid,"value":val});
			})
			json = {"answers":answers};
		}
		
		answersJson.push({"replyContent":json,"questionID":questionId,"isanswered":(isanswered?1:0)});
		questionno++;
	};
	$(".error h4").empty();
	return answersJson;
}
