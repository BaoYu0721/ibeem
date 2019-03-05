//如果获取到参数是edit
function getQueryString(name) {
	var params = decodeURI(window.location.search);
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	var r = params.substr(1).match(reg);
	if (r!=null) return unescape(r[2]); return null;
}
//=====编辑问卷，全局变量=====
var surveyId = $.cookie("editSurveyId");
//=====编辑问卷，入口=====
$(function(){
	if(getQueryString("mode")=="modify"){
		//进入编辑模式
		//放置问卷的所有题目
		initSurvey();
		//显示修改的按钮
		$("#wjcz_update").css("display","block");
		$("#wjcz").css("display","none");
	}
})
//=====编辑问卷，方法=====
function initSurvey(){
	var url = "/survey/getSurveyByID";
	var json = {"surveyID":surveyId};
	function func(data){
		//把题目放在试卷上
		// jsonObj = JSON.parse(data);
		putSurvey(data);
	}
	function errorfunc(data){
		var errorcode = data.code;
		var errormsg = data.messg;
		alertokMsg("error!errorcode:"+errorcode+","+errormsg,"确定");
	}
	sentJson(url,json,func,errorfunc);
}
function putSurvey(jsonObj){
	var $root = $(".container .question-container");
	//1.获取问卷title
	var surveytitle = jsonObj.title;
	$(".survey-title>input").val(surveytitle);
	//2.问卷介绍
	var introduction = jsonObj.introduction;
	$(".survey-desc>textarea").html(introduction);
	//3.问卷ID
	var surveyID = jsonObj.surveyID;
	//4.获取分页方式
	var pagingType = jsonObj.pagingType==null?1:jsonObj.pagingType;
	var pagingNum = jsonObj.pagingNum;
	if(pagingType==1){//不分页
		$("#nopaging").checkbox("check");
	}else if(pagingType==2){//按段落分页
		$("#dlpaging").checkbox("check");
	}else if(pagingType==3){//按一页几题分
		$("#limitpaging").checkbox("check");
		$("#pagingnum_input").val(pagingNum);
	}
	//5.向页面添加题目
	var dllist = jsonObj.list;
	var list = [];
	var questionlength = 1;
	for(var i in dllist){
		if(dllist[i].title!=""){
			//不为空说明这一层段落存在，放置一个段落
			putQuestionDl(dllist[i],$root);
		}
		var questionList = dllist[i].questionList;
		for(j in questionList){
			var question = questionList[j];
			//判断question题型，放置对应题目
			putQuestion(question,$root);
		}
	}
}
//=====放置题目方法======
function putQuestion(question,$root){
	var required = question.required;//是否必答,0为必答
	var questionID = question.questionID;//题目ID
	var title = question.title;//题目内容
	var type = question.type;//题目类型 type问题类型 0填空、1单选、2多选、3多点、4滑条
	var setting = eval('(' + question.setting + ')');//选项
	var num = question.questionorder;//题号
	if(type==0){//放置填空题
		getComponent("/common/questionTK",
				function(resultHTML){
					$root.append(resultHTML);
					add_index++;
					order_index++;
					
					$thisQuestion = $('#'+(add_index-1)+'_question');
					//复选框点击效果
					$thisQuestion.find('.ui.checkbox').checkbox();
					//根据题目内容，修改模板内容
					$thisQuestion.find('.question-title>.span_title').html(title);
					$thisQuestion.find('.question-content textarea.question_title').html(title);
					if(required==0){$thisQuestion.find('#mustAnswer').checkbox("check")}
					//收起编辑状态
					questionRemoveEdit($thisQuestion);
				},
				{"-id-":add_index,"-orderindex-":order_index})
	}else if(type==1){//放置单选题
		getComponent("/common/questionDX",
				function(resultHTML){
					$root.append(resultHTML);
					add_index++;
					order_index++;
					$thisQuestion = $('#'+(add_index-1)+'_question');
					//复选框点击效果
					$thisQuestion.find('.ui.checkbox').checkbox();
					//根据题目内容，修改模板内容
					$thisQuestion.find('.question-title>.span_title').html(title);
					$thisQuestion.find('.question-content textarea.question_title').html(title);
					if(required==0){$thisQuestion.find('#mustAnswer').checkbox("check")}
					//放置选项
					var $question_content = $thisQuestion.find(".question-content"); 
					var $question_editoption = $thisQuestion.find("table.optiontable>tbody");
					$question_content.find(".ui.form.option").empty();
					$question_editoption.find(".tr-option").remove();
					var $addOptionButton = $question_editoption.find("#add_option");
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
						//单选编辑区域放置一个选项
						addDXOption($addOptionButton);
						//修改编辑区的选项
						$question_editoption.find(".tr-option:last  input[name='option']").val(itemtest);
						$question_editoption.find(".tr-option:last  input[name='optionnum']").val(itemval);
						if(has_img){
							//单选放置一个图片选项
							var $newoption = $('<div class="inline field">'+
									'<div class="ui checkbox option option-img"  data-optionnum="'+itemval+'" data-text="'+itemtest+'">'+
									'	<input type="checkbox" name="option" class="hidden">'+
									'	<label><img alt="option" src='+img_url+'></label>'+
									'</div>'+
								    '</div>');
							$newoption.find('.ui.checkbox').checkbox();
							$question_content.find(".ui.form.option").append($newoption);
							//修改编辑区的选项
							$question_editoption.find(".tr-option:last  input[name='allowImage']").parent().checkbox("check");
							$question_editoption.find(".tr-option:last  i.image.icon").attr("data-img",img_url);
						}else if(can_input){
							//单选放置一个填空选项
							var $newoption = $('<div class="inline field">'+
									'<div class="ui checkbox option allowinput"  data-optionnum="'+itemval+'" data-text="'+itemtest+'">'+
									'<input type="checkbox" name="option" class="hidden">'+
									'</div>'+
									'<input type="text" disabled=""  class="question-input"/>'+
									'</div>'); 
							$newoption.find('.ui.checkbox').checkbox();
							$question_content.find(".ui.form.option").append($newoption);
							//修改编辑区的选项
							$question_editoption.find(".tr-option:last  input[name='allowInput']").parent().checkbox("check");
						}else{
							//单选放置一个文字选项
							var $newoption = $('<div class="inline field">'+
											    '<div class="ui checkbox option"  data-optionnum="'+itemval+'">'+
											      '<input type="checkbox" name="option" tabindex="'+itemnum+'" class="hidden">'+
											      '<label>'+itemtest+'</label>'+
											    '</div>'+
											  '</div>'); 
							$newoption.find('.ui.checkbox').checkbox();
							$question_content.find(".ui.form.option").append($newoption);
						}
					}
					//收起编辑状态
					questionRemoveEdit($thisQuestion);
				},
				{"-id-":add_index,"-orderindex-":order_index})
	}else if(type==2){//放置多选题
		getComponent("/common/questionDDX",
				function(resultHTML){
					$root.append(resultHTML);
					add_index++;
					order_index++;
					$thisQuestion = $('#'+(add_index-1)+'_question');
					//复选框点击效果
					$thisQuestion.find('.ui.checkbox').checkbox();
					//根据题目内容，修改模板内容
					$thisQuestion.find('.question-title>.span_title').html(title);
					$thisQuestion.find('.question-content textarea.question_title').html(title);
					if(required==0){$thisQuestion.find('#mustAnswer').checkbox("check")}
					var max_input = setting.max_input;
					var min_input = setting.min_input;
					$("#ddx_max").val(max_input);
					$("#ddx_min").val(min_input);
					//放置选项
					var $question_content = $thisQuestion.find(".question-content"); 
					var $question_editoption = $thisQuestion.find("table.optiontable>tbody");
					$question_content.find(".ui.form.option").empty();
					$question_editoption.find(".tr-option").remove();
					var $addOptionButton = $question_editoption.find("#add_option");
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
						//单选编辑区域放置一个选项
						addDXOption($addOptionButton);
						//修改编辑区的选项
						$question_editoption.find(".tr-option:last  input[name='option']").val(itemtest);
						$question_editoption.find(".tr-option:last  input[name='optionnum']").val(itemval);
						if(has_img){
							//单选放置一个图片选项
							var $newoption = $('<div class="inline field">'+
									'<div class="ui checkbox option option-img"  data-optionnum="'+itemval+'" data-text="'+itemtest+'">'+
									'	<input type="checkbox" name="option" class="hidden">'+
									'	<label><img alt="option" src='+img_url+'></label>'+
									'</div>'+
								    '</div>');
							$newoption.find('.ui.checkbox').checkbox();
							$question_content.find(".ui.form.option").append($newoption);
							//修改编辑区的选项
							$question_editoption.find(".tr-option:last  input[name='allowImage']").parent().checkbox("check");
						}else if(can_input){
							//单选放置一个填空选项
							var $newoption = $('<div class="inline field">'+
									'<div class="ui checkbox option allowinput"  data-optionnum="'+itemval+'" data-text="'+itemtest+'">'+
									'<input type="checkbox" name="option" class="hidden">'+
									'</div>'+
									'<input type="text" disabled=""  class="question-input"/>'+
									'</div>'); 
							$newoption.find('.ui.checkbox').checkbox();
							$question_content.find(".ui.form.option").append($newoption);
							//修改编辑区的选项
							$question_editoption.find(".tr-option:last  input[name='allowInput']").parent().checkbox("check");
						}else{
							//单选放置一个文字选项
							var $newoption = $('<div class="inline field">'+
											    '<div class="ui checkbox option"  data-optionnum="'+itemval+'">'+
											      '<input type="checkbox" name="option" tabindex="'+itemnum+'" class="hidden">'+
											      '<label>'+itemtest+'</label>'+
											    '</div>'+
											  '</div>'); 
							$newoption.find('.ui.checkbox').checkbox();
							$question_content.find(".ui.form.option").append($newoption);
						}
					}
					//收起编辑状态
					questionRemoveEdit($thisQuestion);
				},
				{"-id-":add_index,"-orderindex-":order_index})
	}else if(type==3){//放置量表题
		getComponent("/common/questionLB",
				function(resultHTML){
					$root.append(resultHTML);
					add_index++;
					order_index++;
					$thisQuestion = $('#'+(add_index-1)+'_question');
					//复选框点击效果
					$thisQuestion.find('.ui.checkbox').checkbox();
					//根据题目内容，修改模板内容
					$thisQuestion.find('.question-title>.span_title').html(title);
					$thisQuestion.find('.question-content textarea.question_title').html(title);
					if(required==0){$thisQuestion.find('#mustAnswer').checkbox("check")}
					//放置选项
					var $question_content = $thisQuestion.find(".question-content"); 
					var $question_editoption = $thisQuestion.find("table.optiontable>tbody");
					$question_content.find("#lb_content>tbody").empty();
					$question_content.find("#option_list>tbody").empty();

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
						//编辑区option添加
						$option = $('<tr class="tr-option">'+
								'<td><input placeholder="'+getLangStr("surveyAdd_optionContent")+'" type="text" name="option" value="'+tag+'" /></td>'+
								'<td><input placeholder="'+getLangStr("surveyAdd_score")+'" type="text" name="score" value="'+score+'" /></td>'+
								'<td><i class="link add circle icon" onclick="addLBOptionAfter(this)"></i> '+
									'<i class="link minus circle icon" onclick="deleteOption(this)"></i>'+
									'<i class="link arrow circle up icon" onclick="orderUpOption(this)"></i> '+
									'<i class="link arrow circle down icon" onclick="orderDownOption(this)"></i> '+
								'</td>'+
								'</tr>')
					    $option.find('.ui.checkbox').checkbox();
						$question_content.find("#option_list>tbody").append($option);
					}
					$firstTr.append("<td></td>");
					$question_content.find("#lb_content").append($firstTr);
										
					//组装其他行
					//==编辑区，标题添加step1==
					var lefttitle_str = "";
					var righttitle_str = "";
					var hasRight = true;
					//==编辑区，标题添加step1，over==
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
							hasRight = false;
						}
						$newTr.append('<td class="right-title">'+righttitle+'</td>');
						$question_content.find("#lb_content").append($newTr);
						//编辑区，标题添加step2
						if(n==0){
							righttitle_str+=righttitle;
							lefttitle_str+=lefttitle;
						}else{
							righttitle_str+="\r\n"+righttitle;
							lefttitle_str+="\r\n"+lefttitle;
						}
						//==编辑区，标题添加step2，over==
						$question_content.find("#left_title_area").text();
					}
					//编辑区，标题添加step3
					$question_content.find("#left_title_area").text(lefttitle_str);
					$question_content.find("#right_title_area").text(righttitle_str);
					if(hasRight){
						$question_content.find("#allow_right_title").checkbox("check");
					}
					//收起编辑状态
					questionRemoveEdit($thisQuestion);
				},
				{"-id-":add_index,"-orderindex-":order_index})
	}else if(type==4){//放置折线题
		getComponent("/common/questionZX",
				function(resultHTML){
					$root.append(resultHTML);
					add_index++;
					order_index++;
					var index = add_index-1;
					$thisQuestion = $('#'+index+'_question');
					//复选框点击效果
					$thisQuestion.find('.ui.checkbox').checkbox();
					//根据题目内容，修改模板内容
					$thisQuestion.find('.question-title>.span_title').html(title);
					$thisQuestion.find('.question-content textarea.question_title').html(title);
					if(required==0){$thisQuestion.find('#mustAnswer').checkbox("check")}
					$thisQuestion.find("#zx_content>tbody").empty();
					$thisQuestion.find("#option_list>tbody>.tr-option").remove();
					//放置选项
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

						var slidereleid = 'slider-range-max-'+n;
						var $newTr = $('<tr>'+
								'<td style="width:12rem;">'+left+'</td>'+
								'<td width="5rem;">'+min_val+'</td>'+
								'<td style="padding-left:2rem;padding-right:2rem;" data-step="'+interval+'"><div id="slider_'+index+'_'+n+'"></div></td>'+
								'<td width="5rem;">'+max_val+'</td>'+
							'</tr>');
						if(right!=""){
							$newTr.append($('<td style="width:8rem;text-align:right;">'+right+'</td>'));
						}
						$thisQuestion.find("#zx_content>tbody").append($newTr);
						//初始化
						$('#'+'slider_'+index+'_'+n).slider({
						      range: "max",
						      min: min_val,
						      max: max_val,
						      step:interval,
						      value: min_val
						    });
						//编辑区，添加行
						addZXOption($thisQuestion.find("#add_option"));
						//修改编辑区的选项
						$thisQuestion.find("#option_list>tbody>.tr-option:last  input[name='left-title']").val(left);
						$thisQuestion.find("#option_list>tbody>.tr-option:last  input[name='right-title']").val(right);
						if(right!=""){
							$thisQuestion.find("#option_list>tbody>.tr-option:last #allow_right_title").checkbox("check");
						}
						$thisQuestion.find("#option_list>tbody>.tr-option:last  input[name='min']").val(min_val);
						$thisQuestion.find("#option_list>tbody>.tr-option:last  input[name='max']").val(max_val);
						$thisQuestion.find("#option_list>tbody>.tr-option:last  input[name='step']").val(interval);
					}
					//收起编辑状态
					questionRemoveEdit($thisQuestion);
				},
				{"-id-":add_index,"-orderindex-":order_index})
	}
}
function putQuestionDl(dl,$root){
	var dltitle = dl.title;
	var dlorder = dl.order;
	getComponent("/common/questionDL",
			function(resultHTML){
				$root.append(resultHTML);
				add_index++;
				dl_index++;
				//复选框点击效果
				$root.find('#'+(add_index-1)+'_question .ui.checkbox').checkbox();
				//根据题目内容，修改模板内容
				$root.find('#'+(add_index-1)+'_question>.question-title>span').html(dltitle);
				$root.find('#'+(add_index-1)+'_question>.question-content textarea.question_title').html(dltitle);
				//收起编辑状态
				$thisQuestion = $('#'+(add_index-1)+'_question');
				questionRemoveEdit($thisQuestion);
			},
			{"-id-":add_index,"-dlindex-":getChineseOrder(dl_index),"-orderindex-":order_index,"-dlorder-":dl_index})
}
function questionRemoveEdit($thisQuestion){
	//收起编辑状态
	$thisQuestion.find('.ui.button.editquestion').removeClass("on");
	$thisQuestion.find('.edit-container').css("display","none");
	$thisQuestion.removeClass("on");
}