
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
	$("#content").css("height",window_height);
	//main的宽度是，屏幕宽度减去左侧导航栏宽度
	$('#content').css("width",window_width-60);
//	$('.ui.grid').css("min-width",1200);
	
//	设置头部添加题目导航栏，顶部悬浮
	var scrollWidth = getScrollWidth();
	var contentWidth = $(".content-team").width()-scrollWidth;
	var containerWidth = $(".content .container").width();
	var leftWidth1 = $(".ui.grid .ui.vertical.menu").outerWidth();
	var leftWidth2 = (contentWidth/2)-476;
	if(containerWidth>contentWidth){
		$(".content .container .top").css("left",leftWidth1);
		$(".content .container").css("margin-left",0);
	}else{
		$(".content .container .top").css("left",leftWidth1+leftWidth2);
		$(".content .container").css("margin-left",leftWidth2);
	}
	//如果是英文，修改样式
	var lang = window.localStorage.getItem("language");
	if(lang=="en"){
		//整体样式修改
		$(".content .container").addClass("en");
		$(".question-library").addClass("en");
	}
	//定时发送空请求
	setInterval(function(){
		var url="/global/interval";
		var json={};
		var successFunc = function(data){
			console.log("持续保持请求");
		}
		var errorFunc = function(data){
			alert("123");
		}
		sentJson2(url,json,successFunc,errorFunc);
	},1200000);
	
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
//$('.ui.checkbox').checkbox();


//删除图片方法
$(".deleteImg").on("click",function(){
	 $(this).parent().children(".portraitStyle").attr("src","");
	 $(this).parent().parent().parent().children(".addicon").css("display","block");
})
//上传图片方法，增加一个回调函数
function UploadPhotoMethod(obj,func){
	var getFile=obj.val();
 	var fileName=getFileName(getFile)
	function getFileName(o){
	    var pos=o.lastIndexOf(".");
	    return o.substring(pos+1);  
	}
	var te=/jpg|jpeg|png|JPG|PNG/g;
	if(te.test(fileName)==false){
		alert(getLangStr("survey_imgerror"))
	}else{
		$form = obj.parent().parent().parent().parent().parent();
		$img = $form.find(".portraitStyle");
		$addr = $form.find("input[name='addr']");
		$form.ajaxSubmit(function(json) {
			console.log(json);
			if(json.code != 200) {
				alert(getLangStr("survey_imgerror"));
				return;
			}
			uploadImg=json.imageList[0].imageurl;
			$img.attr("src",uploadImg);
			$addr.val(uploadImg);
			func();
		})
}};
//=====================公用按钮方法及变量=====================
//题目添加编码，每添加一道题+1，跟序号无关
var add_index = 1;
//当前题目序号最后一个
var order_index =1;
//全局变量，保存当前编辑的图片选项对象，以便将选择的图片地址返回到当前对象上。
var i_image;
//图片变量，当前一共添加了几个图片就编号几。删除图不删除编号
var image_index =1;
//段落序号，每添加一个段落+1
var dl_index = 1;

//删除选项
function deleteOption(ele){
	$target = $(ele).parent().parent();
	$target.remove();
}
//上移选项
function orderUpOption(ele){
	$this = $(ele).parent().parent();
	if($this.prev().length>0){
		$target = $this.prev();
		$target.before($this);
	}
}
//下移选项
function orderDownOption(ele){
	$this = $(ele).parent().parent();
	if($this.next().length>0){
		$target = $this.next();
		$target.after($this);
	}
}
//图片按钮，弹出图片框
$(".container").on("click","i.image.icon",function(){
	i_image = $(this);
	var index = $(this).data("index");
	if(!index){
		$(this).attr("data-index",image_index);
		var imgUrl = i_image.attr("data-img");
		getComponent("/static/manage/components/optionIMG.html",
				function(resultHTML){
					$("body").prepend(resultHTML);
					//添加上传图片监听
					$(".portraitForm").each(function(){
						$form =$(this); 
						$(this).change(function(){
							 UploadPhotoMethod($(this).find(".eportrait"),function(){
							 });
						});
					});
					$('.ui.modal.uploadimg_'+image_index).modal('show');
					image_index++;
				},{"-indexClass-":"uploadimg_"+image_index,"-imageurl-":imgUrl})
		
	}else{
		var imgUrl = i_image.attr("data-img");
		$('.ui.modal.uploadimg_'+index).modal('show');
		$('.ui.modal.uploadimg_'+index).find(".portraitForm input[name='addr']").val(imgUrl);
	}
	
	});
//确认图片
function uploadImgOk(ele){
	var index = i_image.data("index");
	var addr = $('.ui.modal.uploadimg_'+index).find(".portraitForm input[name='addr']").val();
	i_image.attr("data-img",addr);
	var index = i_image.attr("data-index");
	$('.ui.modal.uploadimg_'+index).modal('hide');
}
//删除图片
function uploadImgDelete(ele){
	var index = i_image.data("index");
	$('.ui.modal.uploadimg_'+index).find(".contentbox input[name='file']").val("");
	$('.ui.modal.uploadimg_'+index).find(".portraitForm input[name='addr']").val("");
	$('.ui.modal.uploadimg_'+index).find(".portraitForm .portraitStyle").remove();
	$('.ui.modal.uploadimg_'+index).find(".contentbox").append('<img class="portraitStyle" src=""/>');
}
//新增题目
$(".container").on("click",".button-group-add .button",function(event){
	addquestion.call(this);
})
function addquestion(){
	$root = $(".container .question-container");
	//点击新增单选题	
	if($(this).hasClass("dx")){
		$this = $(this);
		getComponent("/static/manage/components/questionDX.html",
				function(resultHTML){
					$root.append(resultHTML);
					add_index++;
					order_index++;
					//复选框点击效果
					$root.find('#'+(add_index-1)+'_question .ui.checkbox').checkbox();
				},
				{"-id-":add_index,"-orderindex-":order_index})
	}
	//点击新增多选题
	else if($(this).hasClass("ddx")){
			$this = $(this);
			getComponent("/static/manage/components/questionDDX.html",
					function(resultHTML){
						$root.append(resultHTML);
						add_index++;
						order_index++;
						//复选框点击效果
						$root.find('#'+(add_index-1)+'_question .ui.checkbox').checkbox();
					},
					{"-id-":add_index,"-orderindex-":order_index})
		}
	//点击新增填空题
	else if($(this).hasClass("tk")){
			$this = $(this);
			getComponent("/static/manage/components/questionTK.html",
					function(resultHTML){
						$root.append(resultHTML);
						add_index++;
						order_index++;
						//复选框点击效果
						$root.find('#'+(add_index-1)+'_question .ui.checkbox').checkbox();
					},
					{"-id-":add_index,"-orderindex-":order_index})
		}
	//点击新增量表题
	else if($(this).hasClass("lb")){
			$this = $(this);
			getComponent("/static/manage/components/questionLB.html",
					function(resultHTML){
						$root.append(resultHTML);
						add_index++;
						order_index++;
						//复选框点击效果
						$root.find('#'+(add_index-1)+'_question .ui.checkbox').checkbox();
					},
					{"-id-":add_index,"-orderindex-":order_index})
		}
	//点击新增折线题
	    else if($(this).hasClass("ht")){
			$this = $(this);
			getComponent("/static/manage/components/questionZX.html",
					function(resultHTML){
						$root.append(resultHTML);
						add_index++;
						order_index++;
						//复选框点击效果
						$root.find('#'+(add_index-1)+'_question .ui.checkbox').checkbox();
					},
					{"-id-":add_index,"-orderindex-":order_index})
		}
	//点击新增段落
	    else if($(this).hasClass("dl")){
			$this = $(this);
			getComponent("/static/manage/components/questionDL.html",
					function(resultHTML){
						$root.append(resultHTML);
						add_index++;
						dl_index++;
						//复选框点击效果
						$root.find('#'+(add_index-1)+'_question .ui.checkbox').checkbox();
					},
					{"-id-":add_index,"-dlindex-":getChineseOrder(dl_index),"-orderindex-":order_index,"-dlorder-":dl_index})
		}
}
//操作题目
var $deleteQuestion;//当前题 
function deleteQuestion(){
			//获取其他题，从头到尾设置序号
			var order_index_tmp = 1;
			$deleteQuestion.siblings(".question:not(.dl)").each(function(){
				$(this).find(".order-index").html(order_index_tmp);
				order_index_tmp++;
			});
			order_index--;
			$deleteQuestion.remove();
		}
function deleteQuestiondl(){
			//获取其他题，从头到尾设置序号
			var dl_index_tmp = 1;
			$deleteQuestion.siblings(".question.dl").each(function(){
				$(this).find(".order-index").html(getChineseOrder(dl_index_tmp));
				dl_index_tmp++;
			});
			dl_index--;
			$deleteQuestion.remove();
		}

$(".container .bottom").on("click",".button-group",function(event){
	var index = $(this).data("index");
	$root = $("#"+index+"_question");
	target = event.target;
	//点击编辑	
	if($(target).hasClass("editquestion")){
		$(target).addClass("on");
		//显示编辑框
		$root.find(".edit-container").css("display","block");
		$root.addClass("on");
	}
	//点击删除
	else if($(target).hasClass("deletequestion")){
		//弹出框提示
		$deleteQuestion = $root;
		alertMsg(getLangStr("surveyAdd_alert1"),getLangStr("alert_cancel"),getLangStr("delete"),"deleteQuestion")
	}
	//点击上移
	else if($(target).hasClass("orderupquestion")){
		if($root.prev().length>0){
			$target = $root.prev();
			$target.before($root);
			if(!$target.hasClass("dl")){
				//交换序号
				var targetIndex = $target.find(".order-index").html();
				$root.find(".order-index").html(targetIndex);
				$target.find(".order-index").html(++targetIndex);
			}
		}
	}
	//点击下移
	else if($(target).hasClass("orderdownquestion")){
		if($root.next().length>0){
			$target = $root.next();
			$target.after($root);
			if(!$target.hasClass("dl")){
				//交换序号
				var targetIndex = $target.find(".order-index").html();
				$root.find(".order-index").html(targetIndex);
				$target.find(".order-index").html(--targetIndex);
			}
		}
	}
	//点击最前
	else if($(target).hasClass("ordertopquestion")){
		if($root.siblings().length>0){
			$target = $root.parent();
			$target.prepend($root);
			//从头到尾设置序号
			var order_index_tmp = 1;
			$(".question:not(.dl)").each(function(){
				$(this).find(".order-index").html(order_index_tmp);
				order_index_tmp++;
			})
		}
	}
	//点击最后
	else if($(target).hasClass("orderbottomquestion")){
		if($root.siblings().length>0){
			$target = $root.parent();
			$target.append($root);
			//从头到尾设置序号
			var order_index_tmp = 1;
			$(".question:not(.dl)").each(function(){
				$(this).find(".order-index").html(order_index_tmp);
				order_index_tmp++;
			})
		}
	}
	//==========以下是段落的移动和删除事件==========
	//点击删除段落
	else if($(target).hasClass("deletequestiondl")){
		//弹出框提示
		$deleteQuestion = $root;
		alertMsg(getLangStr("surveyAdd_alert1_dl"),getLangStr("alert_cancel"),getLangStr("delete"),"deleteQuestiondl");
	}
	//点击上移段落
	else if($(target).hasClass("orderupquestiondl")){
		if($root.prev().length>0){
			$target = $root.prev();
			$target.before($root);
			//交换序号
			if($target.hasClass("dl")){
				//如果前一个是段落，则交换序号	
				var targetIndex = $target.find(".order-index").html();
				$target.find(".order-index").html($root.find(".order-index").html());
				$root.find(".order-index").html(targetIndex);
			}
		}
	}
	//点击下移段落
	else if($(target).hasClass("orderdownquestiondl")){
		if($root.next().length>0){
			$target = $root.next();
			$target.after($root);
			//交换序号
			if($target.hasClass("dl")){
				//如果后一个是段落，则交换序号	
				var targetIndex = $target.find(".order-index").html();
				$target.find(".order-index").html($root.find(".order-index").html());
				$root.find(".order-index").html(targetIndex);
			}
		}
	}
	//点击最前段落
	else if($(target).hasClass("ordertopquestiondl")){
		if($root.siblings().length>0){
			$target = $root.parent();
			$target.prepend($root);
			//从头到尾设置序号
			var dl_index_tmp = 1;
			$(".question.dl").each(function(){
				$(this).find(".order-index").html(getChineseOrder(dl_index_tmp));
				dl_index_tmp++;
			})
		}
	}
	//点击最后段落
	else if($(target).hasClass("orderbottomquestiondl")){
		if($root.siblings().length>0){
			$target = $root.parent();
			$target.append($root);
			//从头到尾设置序号
			var dl_index_tmp = 1;
			$(".question.dl").each(function(){
				$(this).find(".order-index").html(getChineseOrder(dl_index_tmp));
				dl_index_tmp++;
			})
		}
	}
});
//点击允许填空的选框之后，后面的input设置为可以编辑
$(".question-container").on("click",".allowinput",function(){
	$target = $(this).find('input[type=checkbox]:checked')
	$target.parent().siblings('input').removeAttr("disabled");
	if($target.length==0){
		$target = $(this).find('input[type=checkbox]')
		$target.parent().siblings('input').attr("disabled","");
	}
})
//量表题中，点击右行标题之后，textarea可以编辑
$(".question-container").on("click","#allow_right_title",function(){
	$target = $(this).parent().parent().parent().siblings("tbody").find("#right_title_area");
	if($(this).find('input[type=checkbox]:checked').length>0){
		$target.removeAttr("readonly");
	}else{
		$target.attr("readonly","");
	}
})
//折线题中，点击右行标题之后，后方input可以编辑
$(".question-container").on("click","#allow_right_title_input",function(){
	$target = $(this).siblings("input[name=right-title]");
	if($(this).find('input[type=checkbox]:checked').length>0){
		$target.removeAttr("readonly");
	}else{
		$target.attr("readonly","");
	}
})
//=====================单选题，多选题，图片题=====================
//添加（单选，多选，图片）选项
function addDXOption(ele){
	$target = $(ele).parent().parent();
	var optionNum = getOpetionNum($target.parent());
	$option = $('<tr class="tr-option">'+
		      '<td><input placeholder="'+getLangStr("surveyAdd_inputoption")+'" type="text" name="option" /></td>'+
		      '<td>'+
		      '<div class="ui checkbox">'+
			  '    <input type="checkbox" name="allowImage" class="hidden">'+
			  '    <label></label>'+
			  '  </div>'+
		      '<i class="link file image outline icon" data-img=""></i></td>'+
		      '<td>'+
			  '	<div class="ui checkbox">'+
			  '    <input type="checkbox" name="allowInput" class="hidden">'+
			  '    <label></label>'+
			  '  </div>'+
			  '</td>'+
			  '<td><input placeholder="'+getLangStr("surveyAdd_inputvalue")+'" type="text" name="optionnum" value="'+optionNum+'"/></td>'+
		      '<td>'+
		      '	<i class="link add circle icon" onclick="addDXOptionAfter(this)"></i>'+
		      '	<i class="link minus circle icon" onclick="deleteOption(this)"></i>'+
		      '	<i class="link arrow circle up icon" onclick="orderUpOption(this)"></i>'+
		      '	<i class="link arrow circle down icon" onclick="orderDownOption(this)"></i></td>'+
		      '</tr>')
		      $option.find('.ui.checkbox').checkbox();
    $target.before($option);
}
//添加量表题选项
function addLBOptionAfter(ele){
	$target = $(ele).parent().parent();
	$option = $('<tr class="tr-option">'+
			'<td><input placeholder="'+getLangStr("surveyAdd_optionContent")+'" type="text" name="option" /></td>'+
			'<td><input placeholder="'+getLangStr("surveyAdd_score")+'" type="text" name="score" /></td>'+
			'<td><i class="link add circle icon" onclick="addLBOptionAfter(this)"></i> '+
				'<i class="link minus circle icon" onclick="deleteOption(this)"></i>'+
				'<i class="link arrow circle up icon" onclick="orderUpOption(this)"></i> '+
				'<i class="link arrow circle down icon" onclick="orderDownOption(this)"></i> '+
			'</td>'+
			'</tr>')
		      $option.find('.ui.checkbox').checkbox();
    $target.after($option);
}
//添加折线题选项
function addZXOptionAfter(ele){
	$target = $(ele).parent().parent();
	$option = $('<tr class="tr-option">'+
		'	<td><input placeholder="'+getLangStr("surveyAdd_lefttitle")+'" type="text" name="left-title" /></td>'+
		'	<td><div class="ui checkbox" id="allow_right_title">'+
		'		<input type="checkbox" name="allow-right-title" class="hidden">'+
		'		<label></label>'+
		'	</div><input placeholder="'+getLangStr("surveyAdd_righttitle")+'" type="text" name="right-title" style="width:70%;" readonly/></td>'+
		'	<td><input placeholder="'+getLangStr("surveyAdd_zxmin")+'" type="text" name="min" /></td>'+
		'	<td><input placeholder="'+getLangStr("surveyAdd_zxmax")+'" type="text" name="max" /></td>'+
		'	<td><input placeholder="'+getLangStr("surveyAdd_zxstep")+'" type="text" name="step" /></td>'+
		'	<td><i class="link add circle icon" onclick="addZXOptionAfter(this)"></i>'+ 
		'		<i class="link minus circle icon" onclick="deleteOption(this)"></i>'+
		'		<i class="link arrow circle up icon" onclick="orderUpOption(this)"></i> '+
		'		<i class="link arrow circle down icon" onclick="orderDownOption(this)"></i></td>'+
		'</tr>')
		$option.find('.ui.checkbox').checkbox();
    $target.after($option);
}
function addZXOption(ele){
	$target = $(ele).parent().parent();
	$option = $('<tr class="tr-option">'+
		'	<td><input placeholder="'+getLangStr("surveyAdd_lefttitle")+'" type="text" name="left-title" /></td>'+
		'	<td><div class="ui checkbox" id="allow_right_title">'+
		'		<input type="checkbox" name="allow-right-title" class="hidden">'+
		'		<label></label>'+
		'	</div><input placeholder="'+getLangStr("surveyAdd_righttitle")+'" type="text" name="right-title" style="width:70%;" readonly/></td>'+
		'	<td><input placeholder="'+getLangStr("surveyAdd_zxmin")+'" type="text" name="min" /></td>'+
		'	<td><input placeholder="'+getLangStr("surveyAdd_zxmax")+'" type="text" name="max" /></td>'+
		'	<td><input placeholder="'+getLangStr("surveyAdd_zxstep")+'" type="text" name="step" /></td>'+
		'	<td><i class="link add circle icon" onclick="addZXOptionAfter(this)"></i>'+ 
		'		<i class="link minus circle icon" onclick="deleteOption(this)"></i>'+
		'		<i class="link arrow circle up icon" onclick="orderUpOption(this)"></i> '+
		'		<i class="link arrow circle down icon" onclick="orderDownOption(this)"></i></td>'+
		'</tr>')
		$option.find('.ui.checkbox').checkbox();
    $target.before($option);
}
function addDXOptionAfter(ele){
	$target = $(ele).parent().parent();
	var optionNum = getOpetionNum($target.parent());
	$option = $('<tr class="tr-option">'+
		      '<td><input placeholder="'+getLangStr("surveyAdd_inputoption")+'" type="text" name="option" /></td>'+
		      '<td>'+
		      '<div class="ui checkbox">'+
			  '    <input type="checkbox" name="allowImage" class="hidden">'+
			  '    <label></label>'+
			  '  </div>'+
		      '<i class="link file image outline icon" data-img=""></i></td>'+
		      '<td>'+
			  '	<div class="ui checkbox">'+
			  '    <input type="checkbox" name="allowInput" class="hidden">'+
			  '    <label></label>'+
			  '  </div>'+
			  '</td>'+
			  '<td><input placeholder="'+getLangStr("surveyAdd_inputvalue")+'" type="text" name="optionnum" value="'+optionNum+'"/></td>'+
		      '<td>'+
		      '	<i class="link add circle icon" onclick="addDXOptionAfter(this)"></i>'+
		      '	<i class="link minus circle icon" onclick="deleteOption(this)"></i>'+
		      '	<i class="link arrow circle up icon" onclick="orderUpOption(this)"></i>'+
		      '	<i class="link arrow circle down icon" onclick="orderDownOption(this)"></i></td>'+
		      '</tr>')
		       $option.find('.ui.checkbox').checkbox();
    $target.after($option);
}
//保存题目
$(".container").on("click",".editover",function(){
//	获取选项及相关变量
	var index = $(this).data("index");
	$root = $("#"+index+"_question");
	var title = $root.find(".question_title").val();
	var $troptions =$root.find(".tr-option");
	var $question_content = $root.find(".question-content"); 
	$question_content.find("input");
//  标题非空判断
	if(!title || $.trim(title)==""){
		if($root.hasClass("dl")){
			$root.find(".error h4").html(getLangStr("surveyAdd_alert2"));
		}else{
			$root.find(".error h4").html(getLangStr("surveyAdd_alert3"));
		}
		return false;
	}
	var max = $root.find("#ddx_max").val();
	var min = $root.find("#ddx_min").val();
//	set标题
	$root.find(".span_title").html(title);
//	判断是否必答
	if($root.find("input[name='answer']:checked").length>0){
		$root.attr("data-mustanswer","Y");
	}else{
		$root.attr("data-mustanswer","N");
	}
//	判断题型
//	1.如果是多选题，还需要设置最大最小选项数
	if($root.find("#ddx_max").length>0){
		if($.trim(min)==""){
			$root.find(".error h4").html(getLangStr("surveyAdd_alert7"));
			return false;
		}else if(!parseInt(min)){
			$root.find(".error h4").html(getLangStr("surveyAdd_alert8"));
			return false;
		}else if(parseInt(min)<=0){
			$root.find(".error h4").html(getLangStr("surveyAdd_alert9"));
			return false;
		}
		if($.trim(max)==""){
			$root.find(".error h4").html(getLangStr("surveyAdd_alert10"));
			return false;
		}else if(!parseInt(max)){
			$root.find(".error h4").html(getLangStr("surveyAdd_alert11"));
			return false;
		}else if(parseInt(max)<=0){
			$root.find(".error h4").html(getLangStr("surveyAdd_alert12"));
			return false;
		}
		if(min>max){
			$root.find(".error h4").html(getLangStr("surveyAdd_alert13"));
			return false;
		}
		$root.attr("data-maxandmin",max+"-"+min);
	}
//	2.如果是单选或多选
	if($root.hasClass("dx")  || $root.hasClass("ddx")){
		//选项
		//清空选项	
		$question_content.find(".ui.form.option").html('');
		for(var i=0;i<$troptions.length;i++){
			var troption = $troptions[i];
			var option = $(troption).find("input[name='option']").val();
			var optionNum = $(troption).find("input[name='optionnum']").val();
			var isImage = $(troption).find("input[name='allowImage']:checked").length;
			var img = $(troption).find("i.image").data("img");
			var allowInput = $(troption).find("input[name='allowInput']:checked").length;
			//非图片题时候，判断是不是可以填空		
			
			if(isImage == 0 ){
				if( allowInput==0 &&( !option || $.trim(option)=="")){
					$root.find(".error h4").html(getLangStr("surveyAdd_alert14")+(i+1)+getLangStr("surveyAdd_alert15"));
					return false;
				}else if( allowInput==0 &&( !optionNum || $.trim(optionNum)=="")){
					$root.find(".error h4").html(getLangStr("surveyAdd_alert14")+(i+1)+getLangStr("surveyAdd_alert16"));
					return false;
				}else if( allowInput!=0 &&( !option || $.trim(option)=="")){
					$root.find(".error h4").html(getLangStr("surveyAdd_alert17")+(i+1)+getLangStr("surveyAdd_alert18"));
					return false;
				}
				else if( allowInput==0){
					//单选放置一个文字选项
					var $newoption = $('<div class="inline field">'+
									    '<div class="ui checkbox option"  data-optionnum="'+optionNum+'">'+
									      '<input type="checkbox" name="option" tabindex="'+(i+1)+'" class="hidden">'+
									      '<label>'+option+'</label>'+
									    '</div>'+
									  '</div>'); 
					$newoption.find('.ui.checkbox').checkbox();
					$question_content.find(".ui.form.option").append($newoption);
					$root.find(".error h4").empty();
				}else{
					//放置一个填空选项
					var $newoption = $('<div class="inline field">'+
							'<div class="ui checkbox option allowinput"  data-optionnum="'+optionNum+'" data-text="'+option+'">'+
							'<input type="checkbox" name="option" class="hidden">'+
							'</div>'+
							'<input type="text" disabled=""  class="question-input"/>'+
							'</div>'); 
					$newoption.find('.ui.checkbox').checkbox();
					$question_content.find(".ui.form.option").append($newoption);
					$root.find(".error h4").empty();
				}
			}
			//图片题时候，选项图片不能为空
			else if(isImage >0){
				if(!option || $.trim(option)==""){
					$root.find(".error h4").html(getLangStr("surveyAdd_alert19")+(i+1)+getLangStr("surveyAdd_alert20"));
					return false;
				}
				if(!img || $.trim(img)==""){
					$root.find(".error h4").html(getLangStr("surveyAdd_alert21")+(i+1)+getLangStr("surveyAdd_alert22"));
					return false;
				}else{
					var $newoption = $('<div class="inline field">'+
					'<div class="ui checkbox option option-img"  data-optionnum="'+optionNum+'" data-text="'+option+'">'+
					'	<input type="checkbox" name="option" class="hidden">'+
					'	<label><img alt="option" src='+img+'></label>'+
					'</div>'+
				    '</div>');
					$newoption.find('.ui.checkbox').checkbox();
					$question_content.find(".ui.form.option").append($newoption);
					$root.find(".error h4").empty();
				}
			}
		}
	}
//	3.如果是填空题，什么都不用动...
//	4.量表题
	if($root.hasClass("lb")){
		// 保存变量-量表题行数
		var rowsNum;
		//0.准备工作，先清空题目table
		$root.find("#lb_content").empty();
		$root.find("#lb_content").append($("<tr><td></td><td id='lastTrTitle'></td></tr>"))
		//1.判断是否有右侧标题，如果有判断是否跟左侧标题的数量一致，如果没有就跟左侧一样
		var leftTitle = $root.find("#left_title_area").val();
		if($.trim(leftTitle)==""){$root.find(".error h4").html(getLangStr("surveyAdd_alert23"));return false;}
		var leftTitleArr = leftTitle.split(/[\n,]/g);
		//去掉空白空格
		leftTitleArr=$.grep(leftTitleArr,function(n,i){
			return $.trim(n)!="";
			});
		if($root.find("#allow_right_title input[type=checkbox]:checked").length>0){
			var rightTitle = $root.find("#right_title_area").val();
			if($.trim(rightTitle)==""){$root.find(".error h4").html(getLangStr("surveyAdd_alert24"));return false;}
			var rightTitleArr = rightTitle.split(/[\n,]/g);
			//去掉空白空格
			rightTitleArr=$.grep(rightTitleArr,function(n,i){
				return $.trim(n)!="";
				});
			if(rightTitleArr.length!=leftTitleArr.length){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert25"));
				return false;
			}
		}
		rowsNum = leftTitleArr.length;
		//2.将上一步切出来的标题放置到对应位置
		for(var i=0;i<rowsNum;i++){
			var lefttitle = $.trim(leftTitleArr[i]);
			var newTr = $('<tr id="'+(i+1)+'_tr">'+
					'<td class="left-title">'+lefttitle+'</td>'+
			  	'</tr>')
			if(rightTitleArr){
				var righttitle = $.trim(rightTitleArr[i]);
				newTr.append('<td class="right-title">'+righttitle+'</td>');
			}else{
				newTr.append('<td class="right-title"></td>');
			}
			$root.find("#lb_content").append(newTr);			
		}
		//3.获取选项列表，	按顺序放置 th，每行td（每行td的name不同，每道题的分数要放置在radio上的data-score里）
		for(var lb =0;lb<$troptions.length;lb++){
			troption = $troptions[lb];
			var optionName = $(troption).find("input[name=option]").val();
			if($.trim(optionName)==""){$root.find(".error h4").html(getLangStr("surveyAdd_alert26"));return false;}
			var optionScore = $(troption).find("input[name=score]").val();
			if($.trim(optionScore)==""){$root.find(".error h4").html(getLangStr("surveyAdd_alert27"));return false;}
			else if(!parseInt(optionScore) && parseInt(optionScore)!=0){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert28"));
				return false;
			}else if(parseInt(optionScore)<0){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert29"));
				return false;
			}
			//添加第一行标题
			$root.find("#lastTrTitle").before($("<td data-score='"+optionScore+"'>"+optionName+"</td>"));
			for(n =1;n<=rowsNum;n++){
				var $newTrContent = $('<td><div class="ui radio checkbox">'+
					        '<input type="radio" name="'+index+'_'+n+'" class="hidden" data-score="'+optionScore+'">'+
					        '<label></label>'+
					      	'</div></td>');
				$newTrContent.find('.ui.checkbox').checkbox();
				$root.find("#"+n+"_tr .right-title").before($newTrContent);
			}
		}
	}
//	5.折线题
	if($root.hasClass("zx")){
//		清空table
		$root.find("#zx_content").empty();
//		获取选项值，非空校验
		var count=1;
		for(var zx =0;zx<$troptions.length;zx++){
			var troption = $troptions[zx];
			var lefttitle = $(troption).find("input[name='left-title']").val();
			if($.trim(lefttitle)==""){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert30"));return false;
			}
			var righttitle ="";
			if($(troption).find("input[name='allow-right-title']:checked").length>0){
				righttitle = $(troption).find("input[name='right-title']").val();
				if($.trim(righttitle)==""){
					$root.find(".error h4").html(getLangStr("surveyAdd_alert31"));return false;
				}
			};
			var minlength = $(troption).find("input[name='min']").val();
			if($.trim(minlength)==""){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert32"));return false;
			}else if(!parseInt(minlength) && parseInt(minlength)!=0){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert33"));return false;
			}
//			else if(parseInt(minlength)<0){
//				$root.find(".error h4").html("最小值不能小于0");
//				return false;
//			}
			minlength = parseInt(minlength);
			
			var maxlength = $(troption).find("input[name='max']").val();
			if($.trim(maxlength)==""){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert34"));return false;
			}else if(!parseInt(maxlength) && parseInt(maxlength)!=0){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert35"));return false;
			}
//			else if(parseInt(minlength)<=0){
//				$root.find(".error h4").html("最大值必须大于0");
//				return false;
//			}
			maxlength = parseInt(maxlength);
			if(maxlength<minlength){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert36"));return false;
			}
			var step = $(troption).find("input[name='step']").val();
			if($.trim(step)==""){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert37"));return false;
			}else if(!parseInt(step)){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert38"));return false;
			}else if(parseInt(step)<=0){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert39"));
				return false;
			}else if(parseInt(step)>(maxlength-minlength)){
				$root.find(".error h4").html(getLangStr("surveyAdd_alert40"));
				return false;
			}
			step = parseInt(step);
			//赋值
			var newTr = $('<tr>'+
					'<td style="width:12rem;">'+lefttitle+'</td>'+
					'<td width="5rem;">'+minlength+'</td>'+
					'<td style="padding-left:2rem;padding-right:2rem;" data-step="'+step+'"><div id="slider_'+index+'_'+count+'"></div></td>'+
					'<td width="5rem;">'+maxlength+'</td>'+
				'</tr>');
			if(righttitle!=""){
				newTr.append($('<td style="width:8rem;text-align:right;">'+righttitle+'</td>'));
			}
			$root.find("#zx_content").append(newTr);
			//初始化
		    $("#slider_"+index+"_"+count).slider({
		      range: "max",
		      min: minlength,
		      max: maxlength,
		      step:step,
		      value: minlength
		    });
			count++;
		}
		$root.find(".error h4").empty();
	}
	//去掉编辑按钮的状态
	$(".question .question-content .button-group button.on").removeClass("on");
	//隐藏编辑框
	$root.find(".edit-container").css("display","none");
	$root.removeClass("on");
	//去掉错误提示
	$root.find(".error h4").empty();
})
//单选题选框点击事件
$(".question-container").on("click",".question.dx .question-content .ui.checkbox.option",function(){
	$(this).parent().siblings().find('.ui.checkbox.option').each(function(){
		$(this).checkbox('uncheck');
	});
})
//多选题选框点击事件
$(".question-container").on("click",".question.ddx .question-content .ui.checkbox.option",function(){
	var maxandmin= $(this).parents('.question').data("maxandmin");
	var arr = maxandmin.split("-");
	var max = arr[0];
	var min = arr[1];
	var selectedOptions = $(this).parents('.question').find(".question-content .ui.checkbox.option input:checked").length;
	if(selectedOptions>max){
		//如果超出最大选项数
		$(this).checkbox('uncheck');
	}
//	else if(selectedOptions<min){
//		//如果小于最小选项数
//		$(this).checkbox('check');
//	}
})
//=========================底部问卷预览=============================
$("#wjcz").on("click","#wjyl",function(){
	$(".container .top").css("display","none");
	$(".content .container").css("padding-top","0");//5.7142rem
	$(".container .bottom .survey-title input").attr("readonly","");
	$(".container .bottom .survey-title input").css("border","none");//1px solid #979797
	$(".container .bottom .survey-desc textarea").attr("readonly","");
	$(".container .bottom .survey-desc textarea").css("border","none");//1px solid #979797
	$(".question-container .question-yl").css("display","none");
	$(this).attr("id","wjbj")
	$(this).html("<i class='write icon'></i>"+getLangStr("surveyAdd_edit"));
});
$("#wjcz").on("click","#wjbj",function(){
	$(".container .top").css("display","block");
	$(".content .container").css("padding-top","5.7142rem");
	$(".container .bottom .survey-title input").removeAttr("readonly");
	$(".container .bottom .survey-title input").css("border","1px solid #979797");
	$(".container .bottom .survey-desc textarea").removeAttr("readonly");
	$(".container .bottom .survey-desc textarea").css("border","1px solid #979797");
	$(".question-container .question-remove").css("display","block");
	$(this).attr("id","wjyl")
	$(this).html("<i class='unhide icon'></i>"+getLangStr("surveyAdd_preview"));
});
//=========================分页方式选择=============================
$("#nopaging").checkbox({
	onChecked :function(){
		$(this).parent().siblings().checkbox("uncheck");
	}
});
$("#limitpaging").checkbox({
	onChecked :function(){
		$(this).parent().siblings().checkbox("uncheck");
	}
});
$("#dlpaging").checkbox({
	onChecked :function(){
		$(this).parent().siblings().checkbox("uncheck");
	}
});
//=========================点击模板=============================
var questionmodel = [];
var libraryDataTable;
function showLibrary(){
	var url="/admin//survey/question_list";
	var json={};
	var successFunc = function(data){
		var questionList = data.list;
		questionmodel = questionList;
		$(".table-container").html('<table id="library" class="ui celled table" cellspacing="0" width="100%">'+
						'<thead> <tr> <th width="5%"></th><th width="23%">'+getLangStr("survey_questiontype")+'</th> <th>'+getLangStr("survey_questiontitle")+'</th></thead>'+
					    '<tbody ></tbody> </table>');
		for(var i in questionList){
			var question = questionList[i];
			var type = question.type;
			var id = question.id;
			var typename ="";
			if(type==0){
				typename = getLangStr("survey_question6");
			}else if(type==1){
				typename = getLangStr("survey_question7");
			}else if(type==2){
				typename = getLangStr("survey_question8");
			}else if(type==3){
				typename = getLangStr("survey_question9");
			}else if(type==4){
				typename = getLangStr("survey_question10");
			}
			var setting = eval('(' + question.setting + ')');
			var ismustanswer = setting.required==1?getLangStr("surveyAdd_mustyes"):getLangStr("surveyAdd_mustno");
			var title = question.title.length>30?question.title.substring(0,31):question.title;
			$("#library>tbody").append("<tr><td class='check-td'>"+
				"<div class='ui fitted checkbox' data-index='"+i+"' data-id='"+id+"'>"+
				"<input type='checkbox' >"+
				"<label></label></div>"+
  				"</td><td>"+typename+"</td><td>"+title+"</td></tr>")
		}
		$("#library .ui.checkbox").checkbox({
			onChecked:function(){
				$(this).parent().parent().parent().addClass("selected");
			},
			onUnchecked:function(){
				$(this).parent().parent().parent().removeClass("selected");
			}
		});
		libraryDataTable = $("#library").DataTable({
			"lengthChange": false,
//			"pageLength": 8,
			"paging": false, 
			"autoWidth": false,
			"info": false,
			"pagingType": "full",//只显示首末和上一页下一页
			"columnDefs": [
				{ "width": "5%", "targets": 0 }
			],
			"language":{
	           	"paginate": {
	           				"first":      getLangStr("datatable_firstpage"),
	           			    "last":       getLangStr("datatable_lastpage"),
	           			    "next":       getLangStr("datatable_next"),
	           			    "previous":   getLangStr("datatable_previous")
	           	},
	           	"search":     getLangStr("datatable_search"),
   			    "infoEmpty":  getLangStr("datatable_infoEmpty")
			}
		});
		
//		$('.basic.test.modal.questionlibrary')
//		.modal('setting', 'closable', false)
//		.modal('show');
		$("#library_filter").parent().removeClass("right");
		$("#library_filter").parent().removeClass("aligned");
		$("#library_filter").parent().removeClass("eight");
		$("#library_filter").parent().removeClass("wide");
		$("#library_filter").parent().removeClass("column");
		$("#library_filter").parent().addClass("left");
		$("#library_filter").parent().addClass("aligned");
		$("#library_filter").parent().addClass("sixteen");
		$("#library_filter").parent().addClass("wide");
		$("#library_filter").parent().addClass("column");
		$("#library_wrapper>.ui.grid>.row:last").remove();
	}
	sentJson(url,json,successFunc);
}
$(document).ready(function(){
	showLibrary();
	$("#library_filter input").click(function(){
		$("#type_tab>button").removeClass("active");
	})
})

//$("#questionLibrary").click(function(){
//	
//	
//})
//tab切换题型
$("#type_tab>button").click(function(){
	$(this).addClass("active").siblings().removeClass("active");
	var typeVal = $(this).data("val");
	libraryDataTable.search(typeVal).draw();
})
$("#addfromlibrary").click(function(){
//	var checkboxarr = $("#library .ui.checkbox.checked");
	
	var rowsarr = libraryDataTable.rows('.selected').nodes();
	for(var i=0;i<rowsarr.length;i++){
		var $this =  $(rowsarr[i]);
		var index = $this.find(".ui.checkbox").data("index");
		var question = questionmodel[index];
		var type = question.type;
		var id = question.id;

		
		var url="/admin/survey/question/select";
		var json={"id":id};
		var successFunc = function(data){
			var questionBank = data.questionBank;
			var html = questionBank.htlm;
			//添加html
			$(".container .question-container").append(html.replace(/'/g, '"'));
			//修改id和order
			$(".container .question-container>.question:last").attr("id",add_index+"_question");
			$(".container .question-container>.question:last").find(".button-group").attr("data-index",add_index);
			
			$(".container .question-container>.question:last").find(".order-index").html(order_index);
			
			order_index++;
			$('.basic.test.modal.questionlibrary').modal('hide');
			//修改完成编辑按钮的index
			$(".container .question-container>.question:last .editover").attr("data-index",add_index);
			//把所有checkbox为checked的，初始化
			$(".container .question-container>.question:last").find(".ui.checkbox:not(.checked)").checkbox();
			$(".container .question-container>.question:last").find(".ui.checkbox.checked").checkbox("check");
			//把所有textarea都添加值
			$(".container .question-container>.question:last").find("textarea").each(function(){
				 var textareaVal = $(this).attr("value")
				 $(this).html(textareaVal);
			});
			//把所有图片的index去掉，要不然不弹出图片选择框
			$(".container .question-container>.question:last").find("i.image").each(function(){
				$(this).attr("data-index",null);
			})
			add_index++;
			//添加题目之后，去掉左侧列表中的勾选
			$("#library .ui.checkbox.checked").checkbox("uncheck");
			
			
		};
		sentJson(url,json,successFunc);
	}
})
//=========================底部完成编辑=============================
$("#wcbj").on("click",function(){
	var url="/admin/survey/increase/commit";
	var isFinished = 1;
	var json=getJSON(isFinished);
	if(json==""){
		return false;
	}
	var successFunc = function(data){
		alertokMsg(getLangStr("surveyAdd_alert41"),getLangStr("alert_ok"),"window.location.href='/admin/survey'");
	}
	sentJson(url,json,successFunc);
})
$("#wjzc").on("click",function(){
	var url="/admin/survey/increase/commit";
	var isFinished = 0;
	var json=getJSON(isFinished);
	if(json==""){
		return false;
	}
	var successFunc = function(data){
		alertokMsg(getLangStr("surveyAdd_alert41_temp"),getLangStr("alert_ok"),"window.location.href='/admin/survey'");
	}
	sentJson(url,json,successFunc);
})
$("#wcbj_update").on("click",function(){
	var url="/admin/survey/updateSurvey";
	var isFinished = 1;
	var isUpdate = 1;
	var json=getJSON(isFinished,isUpdate);
	if(json==""){
		return false;
	}
	var successFunc = function(data){
		alertokMsg(getLangStr("surveyAdd_alert41_update"),getLangStr("alert_ok"),"window.location.href='/admin/survey'");
	}
	sentJson(url,json,successFunc);
})
$("#wjzc_update").on("click",function(){
	var url="/admin/survey/updateSurvey";
	var isFinished = 0;
	var isUpdate = 1;
	var json=getJSON(isFinished,isUpdate);
	if(json==""){
		return false;
	}
	var successFunc = function(data){
		alertokMsg(getLangStr("surveyAdd_alert41_temp"),getLangStr("alert_ok"),"window.location.href='/admin/survey'");
	}
	sentJson(url,json,successFunc);
})
function getJSON(isFinished,isUpdate){
//	获取问卷标题
	var surveytitle = $(".survey-title input").val();
	if(!surveytitle || $.trim(surveytitle)==""){
		$(".container .bottom").children(".error").find("h4").html(getLangStr("surveyAdd_alert42"));
		return "";
	}
//	获取问卷描述
	var surveydesc = $(".survey-desc textarea").val();
	if(!surveydesc || $.trim(surveydesc)==""){
		$(".container .bottom").children(".error").find("h4").html(getLangStr("surveyAdd_alert43"));
		return "";
	}
//	获取分页方式
	var pagingType = 0;
	var pagingNum = 0;
	if($(".paging-container>.ui.checkbox.checked").length==0){
		$(".container .bottom").children(".error").find("h4").html(getLangStr("surveyAdd_alert44"));
		return "";
	}else{
		var pagingMode = $(".paging-container>.ui.checkbox.checked").attr("id");
		if(pagingMode=="nopaging"){
			//不分页1		
			pagingType = 1;
		}else if(pagingMode=="limitpaging"){
			//限制分页题目数3
			pagingType = 3;
			pagingNum = $("#pagingnum_input").val();
			if(isNaN(pagingNum) || pagingNum<=0){
				$(".container .bottom").children(".error").find("h4").html(getLangStr("surveyAdd_alert45"));
				return "";
			}
		}else if(pagingMode=="dlpaging"){
			//按段分页2
			pagingType = 2;
		}
	}
	
//	获取html
	$(".question-container .question-remove").css("display","none");
	var html = $(".question-container").html();
	$(".question-container .question-remove").css("display","block");
//	判断是否每个题目都已经完成编辑了
	var isAllDone = true;
	$(".question .edit-container").each(function(){
		if($(this).css("display")!="none"){
			$(".container .bottom").children(".error").find("h4").html(getLangStr("surveyAdd_alert46"));
			isAllDone = false;
		}
	})
	if(!isAllDone){
		return "";
	}
	html="";
//	项目id
	var projectID = -1;
//	题目
	var dl = [];
	var dlitem = {};
	var questionList = [];
	var questions = $(".question");
	if(questions.length==0){
		alertokMsg(getLangStr("surveyAdd_alert47"),getLangStr("alert_ok"));
		return "";
	}
	for(var i=0;i<questions.length;i++){
		var $this =  $(questions[i]);
		if(i==0){
			if($this.hasClass("dl")){
				var dltitle = $this.find(".span_title").html();
				var dlorder = $this.data("index");
				dlitem.title = dltitle;
				dlitem.order = dlorder;
				dlitem.questionList = questionList;
				dl.push(dlitem);
				continue;
			}else{
				dlitem.title = "";
				dlitem.order = 1;
				dlitem.questionList = questionList;
				dl.push(dlitem);
			}
		}
		if($this.hasClass("dl")){
			dlitem = {};
			questionList = [];
			var dltitle = $this.find(".span_title").html();
			var dlorder = $this.data("index");
			dlitem.title = dltitle;
			dlitem.order = dlorder;
			dlitem.questionList = questionList;
			dl.push(dlitem);
			continue;
		}else{
			var mustanswer = $this.attr("data-mustanswer");
			var required = 1;
			if($.trim(mustanswer)=="Y"){
				required = 0;
			}
			var sequence = $this.find(".order-index").html();
			var title = $this.find(".question-title .span_title").html();
			var type;
			var setting = {};
			//向questionList中添加填空题
			if($this.hasClass("tk")){
				type = 0;
				setting = {};
			}
			//向questionList中添加单选题
			else if($this.hasClass("dx")){
				type = 1;
				$this.data("maxandmin");
				var options = $this.find(".question-content .ui.form.option .option");
				var items = [];
				for(var n =0;n<options.length;n++){
					option = $(options[n]);
					var img = option.find("label img");
					var input = option.siblings(".question-input");
					var url ="";
					var text ="";
					var has_img = false;
					var can_input = false;
					var input_content = "";
					var optionnum = option.data("optionnum");
					if(img.length>0){
						url = img.attr("src");
						has_img = true;
						text = option.data("text");
					}else if(input.length>0){
						can_input = true; 
						input_content = input.val();
						text = option.data("text");
					}else{
						text = option.find("label").html();
					}
					items.push({
						"id": (n+1), 
						"text":text,
						"has_img":has_img, 
						"img_url": url,
						"can_input":can_input,
						"input_content":input_content,
						"val":optionnum
					});
				}
				setting = {
						"items": items
						
				};
			}
			//向questionList中添加多选题
			else if($this.hasClass("ddx")){
				type = 2;
				var options = $this.find(".question-content .ui.form.option .option");
				var maxandmin = $this.data("maxandmin");
				var max = maxandmin.split("-")[0];
				var min = maxandmin.split("-")[1];
				var items = [];
				for(var n =0;n<options.length;n++){
					option = $(options[n]);
					var img = option.find("label img");
					var input = option.siblings(".question-input");
					var url ="";
					var text ="";
					var has_img = false;
					var can_input = false;
					var input_content = "";
					var optionnum = option.data("optionnum");
					if(img.length>0){
						url = img.attr("src");
						has_img = true;
						text = option.data("text");
					}else if(input.length>0){
						can_input = true; 
						input_content = input.val();
						text = option.data("text");
					}else{
						text = option.find("label").html();
					}
					items.push({
						"id": (n+1),
						"text":text,
						"has_img":has_img, 
						"img_url": url,
						"can_input":can_input,
						"input_content":input_content,
						"val":optionnum
					});
				}
				setting = {
						"items": items,
						"min_input": min, 
						"max_input": max 
				};
			}
			//向questionList中添加量表题
			else if($this.hasClass("lb")){
				type = 3;
				var x_axis = [];
				var y_axis = [];
				var lb_table = $this.find(".question-content .ui.form .lb-content tr");
				var lb_titletd = $(lb_table[0]).find("td");
				for(var n=1;n<lb_titletd.length-1;n++){
					x_axis.push({
						"val":$(lb_titletd[n]).data("score"),
						"tag":$(lb_titletd[n]).html()
					});
				}
				for(var d =1;d<lb_table.length;d++){
					y_axis.push({
						"id": d, 
						"left": $(lb_table[d]).find(".left-title").html(), 
						"right": $(lb_table[d]).find(".right-title").html() 
					});
					;
				}
				setting = {
					"y_axis": y_axis,
					"x_axis": x_axis
				}
			}
			//向questionList中添加滑块题
			else if($this.hasClass("zx")){
				type = 4;
				var items = [];
				var zx_table = $this.find(".question-content .ui.form #zx_content tr");
				for(n=0;n<zx_table.length;n++){
					var zx_td = $(zx_table[n]).find("td");
					items.push({
						"id": (n+1), 
						"min_val": $(zx_td[1]).html(), 
						"max_val": $(zx_td[3]).html(), 
						"interval": $(zx_td[2]).data("step"), 
						"left": $(zx_td[0]).html(), 
						"right": $(zx_td[4]).html()
					});
				}
				setting = {"items":items}
			}
			questionList.push({
				"required":required,
				"sequence":sequence,
				"setting":setting,
				"title":title,
				"type":type
			});
		}
		
		
	}
	return ({"survey":JSON.stringify({
		"title":surveytitle,
		"isFinished":isFinished,
		"html":html,
		"pagingType":pagingType,
		"pagingNum":pagingNum,
		"introduction":surveydesc,
		"projectID":projectID,
		"dl":dl
			}),
			"surveyID":isUpdate==1?parseInt(surveyId):""}
			)
	
}
//=========================额外工具方法=============================
//段落对照数字大写中文
function getChineseOrder(index){
	//解析数字对照成大写，只适用与一百以内	
	index = index.toString();
	var newOrder = ""; 
	var dl = ["一","二","三","四","五","六","七","八","九","十"];
	for(var i=0;i<index.length;i++){
		var n = parseInt(index.substring(i,i+1))-1;
		newOrder = newOrder+dl[n];
	}
	return newOrder;
}
//单选多选添加选项时，获取默认选项赋值
function getOpetionNum($option){
	var optionNum = [];
	$option.find("tr").each(function(){
		optionNum.push($(this).find("input[name='optionnum']").val());
	})
	var maxnum = 1;
	if(optionNum.length==0){
		return maxnum;
	}else{
		for(var i in optionNum){
			if(optionNum[i]>maxnum){
				maxnum = optionNum[i];
			}
		}
		maxnum++;
		return maxnum;
	}
}
//======================不同题型中英文对照放置文字=======================
//单选
function putTextFromLanguage_dx(id){
	$("#"+id+">.question-title>.span_title").html(getLangStr("surveyAdd_dxx_title"));
	$("#"+id+"").find("#default_option1").html(getLangStr("surveyAdd_dxx1"));
	$("#"+id+"").find("#default_option2").html(getLangStr("surveyAdd_dxx2"));
	$("#"+id+">.question-content>.button-group>.editquestion").html(getLangStr("surveyAdd_dxx3"));
	$("#"+id+">.question-content>.button-group>.deletequestion").html(getLangStr("surveyAdd_dxx4"));
	$("#"+id+">.question-content>.button-group>.orderupquestion").html(getLangStr("surveyAdd_dxx5"));
	$("#"+id+">.question-content>.button-group>.orderdownquestion").html(getLangStr("surveyAdd_dxx6"));
	$("#"+id+">.question-content>.button-group>.ordertopquestion").html(getLangStr("surveyAdd_dxx7"));
	$("#"+id+">.question-content>.button-group>.orderbottomquestion").html(getLangStr("surveyAdd_dxx8"));
	$("#"+id+">.question-content>.edit-container .titletable .th_title").html(getLangStr("surveyAdd_dxx9"));
	$("#"+id+">.question-content>.edit-container .titletable .question_title").attr("placeholder",getLangStr("surveyAdd_dxx10"))
	$("#"+id+" #this_question_type").html(getLangStr("surveyAdd_dx1"));
	$("#"+id+" #this_question_type_value").html(getLangStr("surveyAdd_dx2"));
	$("#"+id+" #must_text").html(getLangStr("surveyAdd_dxx13"));
	$("#"+id+">.question-content>.edit-container .optiontable .th1").html(getLangStr("surveyAdd_dxx14"));
	$("#"+id+">.question-content>.edit-container .optiontable .th2").html(getLangStr("surveyAdd_dxx15"));
	$("#"+id+">.question-content>.edit-container .optiontable .th3").html(getLangStr("surveyAdd_dxx16"));
	$("#"+id+">.question-content>.edit-container .optiontable .th4").html(getLangStr("surveyAdd_dxx17"));
	$("#"+id+">.question-content>.edit-container .optiontable .th5").html(getLangStr("surveyAdd_dxx18"));
	$("#"+id+">.question-content>.edit-container .optiontable #tr_option1").attr("placeholder",getLangStr("surveyAdd_dxx1"));
	$("#"+id+">.question-content>.edit-container .optiontable #tr_option1_val").attr("placeholder",getLangStr("surveyAdd_inputvalue"));
	$("#"+id+">.question-content>.edit-container .optiontable #tr_option2").attr("placeholder",getLangStr("surveyAdd_dxx2"));
	$("#"+id+">.question-content>.edit-container .optiontable #tr_option2_val").attr("placeholder",getLangStr("surveyAdd_inputvalue"));
	$("#"+id+" #add_option").html("<i class='link add circle icon'></i>"+getLangStr("surveyAdd_dxx19"));
	$("#"+id+" .editover").html(getLangStr("surveyAdd_dxx_over"));
}
//多选
function putTextFromLanguage_ddx(id){
	$("#"+id+">.question-title>.span_title").html(getLangStr("surveyAdd_dxx_title"));
	$("#"+id+"").find("#default_option1").html(getLangStr("surveyAdd_dxx1"));
	$("#"+id+"").find("#default_option2").html(getLangStr("surveyAdd_dxx2"));
	$("#"+id+">.question-content>.button-group>.editquestion").html(getLangStr("surveyAdd_dxx3"));
	$("#"+id+">.question-content>.button-group>.deletequestion").html(getLangStr("surveyAdd_dxx4"));
	$("#"+id+">.question-content>.button-group>.orderupquestion").html(getLangStr("surveyAdd_dxx5"));
	$("#"+id+">.question-content>.button-group>.orderdownquestion").html(getLangStr("surveyAdd_dxx6"));
	$("#"+id+">.question-content>.button-group>.ordertopquestion").html(getLangStr("surveyAdd_dxx7"));
	$("#"+id+">.question-content>.button-group>.orderbottomquestion").html(getLangStr("surveyAdd_dxx8"));
	$("#"+id+">.question-content>.edit-container .titletable .th_title").html(getLangStr("surveyAdd_dxx9"));
	$("#"+id+">.question-content>.edit-container .titletable .question_title").attr("placeholder",getLangStr("surveyAdd_dxx10"))
	$("#"+id+" #this_question_type").html(getLangStr("surveyAdd_dxx11"));
	$("#"+id+" #this_question_type_value").html(getLangStr("surveyAdd_dxx12"));
	$("#"+id+" #must_text").html(getLangStr("surveyAdd_dxx13"));
	$("#"+id+">.question-content>.edit-container .optiontable .th1").html(getLangStr("surveyAdd_dxx14"));
	$("#"+id+">.question-content>.edit-container .optiontable .th2").html(getLangStr("surveyAdd_dxx15"));
	$("#"+id+">.question-content>.edit-container .optiontable .th3").html(getLangStr("surveyAdd_dxx16"));
	$("#"+id+">.question-content>.edit-container .optiontable .th4").html(getLangStr("surveyAdd_dxx17"));
	$("#"+id+">.question-content>.edit-container .optiontable .th5").html(getLangStr("surveyAdd_dxx18"));
	$("#"+id+">.question-content>.edit-container .optiontable #tr_option1").attr("placeholder",getLangStr("surveyAdd_dxx1"));
	$("#"+id+">.question-content>.edit-container .optiontable #tr_option1_val").attr("placeholder",getLangStr("surveyAdd_inputvalue"));
	$("#"+id+">.question-content>.edit-container .optiontable #tr_option2").attr("placeholder",getLangStr("surveyAdd_dxx2"));
	$("#"+id+">.question-content>.edit-container .optiontable #tr_option2_val").attr("placeholder",getLangStr("surveyAdd_inputvalue"));
	$("#"+id+" #add_option").html("<i class='link add circle icon'></i>"+getLangStr("surveyAdd_dxx19"));
	$("#"+id+" #ddx_max_span").html(getLangStr("surveyAdd_dxx_max"));
	$("#"+id+" #ddx_min_span").html(getLangStr("surveyAdd_dxx_min"));
	$("#"+id+" #ddx_option_span").html(getLangStr("surveyAdd_dxx_option"));
	$("#"+id+" .editover").html(getLangStr("surveyAdd_dxx_over"));
}
//填空
function putTextFromLanguage_tk(id){
	$("#"+id+">.question-title>.span_title").html(getLangStr("surveyAdd_dxx_title"));
	$("#"+id+">.question-content>.button-group>.editquestion").html(getLangStr("surveyAdd_dxx3"));
	$("#"+id+">.question-content>.button-group>.deletequestion").html(getLangStr("surveyAdd_dxx4"));
	$("#"+id+">.question-content>.button-group>.orderupquestion").html(getLangStr("surveyAdd_dxx5"));
	$("#"+id+">.question-content>.button-group>.orderdownquestion").html(getLangStr("surveyAdd_dxx6"));
	$("#"+id+">.question-content>.button-group>.ordertopquestion").html(getLangStr("surveyAdd_dxx7"));
	$("#"+id+">.question-content>.button-group>.orderbottomquestion").html(getLangStr("surveyAdd_dxx8"));
	$("#"+id+">.question-content>.edit-container .titletable .th_title").html(getLangStr("surveyAdd_dxx9"));
	$("#"+id+">.question-content>.edit-container .titletable .question_title").attr("placeholder",getLangStr("surveyAdd_dxx10"))
	$("#"+id+" #this_question_type").html(getLangStr("surveyAdd_tk1"));
	$("#"+id+" #this_question_type_value").html(getLangStr("surveyAdd_tk2"));
	$("#"+id+" #must_text").html(getLangStr("surveyAdd_dxx13"));
	$("#"+id+" .editover").html(getLangStr("surveyAdd_dxx_over"));
}
//量表
function putTextFromLanguage_lb(id){
	$("#"+id+">.question-title>.span_title").html(getLangStr("surveyAdd_dxx_title"));
	$("#"+id+" #lb_content .td1").html(getLangStr("surveyAdd_lb_num1"));
	$("#"+id+" #lb_content .td2").html(getLangStr("surveyAdd_lb_num2"));
	$("#"+id+" #lb_content .td3").html(getLangStr("surveyAdd_lb_num3"));
	$("#"+id+" #lb_content .td4").html(getLangStr("surveyAdd_lb_num4"));
	$("#"+id+" #lb_content .left-title").html(getLangStr("surveyAdd_lb1"));
	$("#"+id+" #lb_content .right-title").html(getLangStr("surveyAdd_lb2"));
	$("#"+id+">.question-content>.button-group>.editquestion").html(getLangStr("surveyAdd_dxx3"));
	$("#"+id+">.question-content>.button-group>.deletequestion").html(getLangStr("surveyAdd_dxx4"));
	$("#"+id+">.question-content>.button-group>.orderupquestion").html(getLangStr("surveyAdd_dxx5"));
	$("#"+id+">.question-content>.button-group>.orderdownquestion").html(getLangStr("surveyAdd_dxx6"));
	$("#"+id+">.question-content>.button-group>.ordertopquestion").html(getLangStr("surveyAdd_dxx7"));
	$("#"+id+">.question-content>.button-group>.orderbottomquestion").html(getLangStr("surveyAdd_dxx8"));
	$("#"+id+">.question-content>.edit-container .titletable .th_title").html(getLangStr("surveyAdd_dxx9"));
	$("#"+id+">.question-content>.edit-container .titletable .question_title").attr("placeholder",getLangStr("surveyAdd_dxx10"))
	$("#"+id+" #this_question_type").html(getLangStr("surveyAdd_lb3"));
	$("#"+id+" #this_question_type_value").html(getLangStr("surveyAdd_lb4"));
	$("#"+id+" #must_text").html(getLangStr("surveyAdd_dxx13"));
	$("#"+id+">.question-content>.edit-container .optiontable .th-lefttitle").html(getLangStr("surveyAdd_lb5"));
	$("#"+id+">.question-content>.edit-container .optiontable .th-righttitle").html(getLangStr("surveyAdd_lb6"));
	$("#"+id+" #option_list .th1").html(getLangStr("surveyAdd_lb7"));
	$("#"+id+" #option_list .th2").html(getLangStr("surveyAdd_lb8"));
	$("#"+id+" #option_list .th3").html(getLangStr("surveyAdd_lb9"));
	$("#"+id+">.question-content>.edit-container #option_list #tr_option1").attr("placeholder",getLangStr("surveyAdd_dxx1"));
	$("#"+id+">.question-content>.edit-container #option_list #tr_option1_val").attr("placeholder",getLangStr("surveyAdd_lb8"));
	$("#"+id+">.question-content>.edit-container #option_list #tr_option2").attr("placeholder",getLangStr("surveyAdd_dxx2"));
	$("#"+id+">.question-content>.edit-container #option_list #tr_option2_val").attr("placeholder",getLangStr("surveyAdd_lb8"));
	$("#"+id+" .editover").html(getLangStr("surveyAdd_dxx_over"));
}
//滑条
function putTextFromLanguage_zx(id){
	$("#"+id+">.question-title>.span_title").html(getLangStr("surveyAdd_dxx_title"));
	$("#"+id+" #zx_content .left-title-1").html(getLangStr("surveyAdd_zx1"));
	$("#"+id+" #zx_content .right-title-1").html(getLangStr("surveyAdd_zx1"));
	$("#"+id+" #zx_content .left-title-2").html(getLangStr("surveyAdd_zx2"));
	$("#"+id+">.question-content>.button-group>.editquestion").html(getLangStr("surveyAdd_dxx3"));
	$("#"+id+">.question-content>.button-group>.deletequestion").html(getLangStr("surveyAdd_dxx4"));
	$("#"+id+">.question-content>.button-group>.orderupquestion").html(getLangStr("surveyAdd_dxx5"));
	$("#"+id+">.question-content>.button-group>.orderdownquestion").html(getLangStr("surveyAdd_dxx6"));
	$("#"+id+">.question-content>.button-group>.ordertopquestion").html(getLangStr("surveyAdd_dxx7"));
	$("#"+id+">.question-content>.button-group>.orderbottomquestion").html(getLangStr("surveyAdd_dxx8"));
	$("#"+id+">.question-content>.edit-container .titletable .th_title").html(getLangStr("surveyAdd_dxx9"));
	$("#"+id+">.question-content>.edit-container .titletable .question_title").attr("placeholder",getLangStr("surveyAdd_dxx10"))
	$("#"+id+" #this_question_type").html(getLangStr("surveyAdd_zx3"));
	$("#"+id+" #this_question_type_value").html(getLangStr("surveyAdd_zx4"));
	$("#"+id+" #must_text").html(getLangStr("surveyAdd_dxx13"));
	$("#"+id+">.question-content>.edit-container .optiontable .th1").html(getLangStr("surveyAdd_zx5"));
	$("#"+id+">.question-content>.edit-container .optiontable .th2").html(getLangStr("surveyAdd_zx6"));
	$("#"+id+">.question-content>.edit-container .optiontable .th3").html(getLangStr("surveyAdd_zx7"));
	$("#"+id+">.question-content>.edit-container .optiontable .th4").html(getLangStr("surveyAdd_zx8"));
	$("#"+id+">.question-content>.edit-container .optiontable .th5").html(getLangStr("surveyAdd_zx9"));
	$("#"+id+">.question-content>.edit-container .optiontable .th6").html(getLangStr("surveyAdd_zx10"));
	$("#"+id+">.question-content>.edit-container .optiontable .tr-option .td1").attr("placeholder",getLangStr("surveyAdd_zx5"));
	$("#"+id+">.question-content>.edit-container .optiontable .tr-option .td2").attr("placeholder",getLangStr("surveyAdd_zx6"));
	$("#"+id+">.question-content>.edit-container .optiontable .tr-option .td3").attr("placeholder",getLangStr("surveyAdd_zx7"));
	$("#"+id+">.question-content>.edit-container .optiontable .tr-option .td4").attr("placeholder",getLangStr("surveyAdd_zx8"));
	$("#"+id+">.question-content>.edit-container .optiontable .tr-option .td5").attr("placeholder",getLangStr("surveyAdd_zx9"));
	$("#"+id+" #add_option").html("<i class='link add circle icon'></i>"+getLangStr("surveyAdd_dxx19"));
	$("#"+id+" .editover").html(getLangStr("surveyAdd_dxx_over"));
}
//段落
function putTextFromLanguage_dl(id){
	$("#"+id+">.question-title>.span_title").html(getLangStr("surveyAdd_dl1"));
	$("#"+id+">.question-content>.button-group>.editquestion").html(getLangStr("surveyAdd_dxx3"));
	$("#"+id+">.question-content>.button-group>.deletequestiondl").html(getLangStr("surveyAdd_dxx4"));
	$("#"+id+">.question-content>.button-group>.orderupquestiondl").html(getLangStr("surveyAdd_dxx5"));
	$("#"+id+">.question-content>.button-group>.orderdownquestiondl").html(getLangStr("surveyAdd_dxx6"));
	$("#"+id+">.question-content>.button-group>.ordertopquestiondl").html(getLangStr("surveyAdd_dxx7"));
	$("#"+id+">.question-content>.button-group>.orderbottomquestiondl").html(getLangStr("surveyAdd_dxx8"));
	$("#"+id+" #this_question_type").html(getLangStr("surveyAdd_dl2"));
	$("#"+id+" #this_question_type_value").html(getLangStr("surveyAdd_dl3"));
	$("#"+id+" .editover").html(getLangStr("surveyAdd_dxx_over"));
	$("#"+id+">.question-content>.edit-container .titletable .th_title").html(getLangStr("surveyAdd_dxx9"));
	$("#"+id+">.question-content>.edit-container .titletable .question_title").attr("placeholder",getLangStr("surveyAdd_dl4"));
}