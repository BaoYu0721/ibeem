//添加语言文件
/* 在html尾端加入language.js ，拼接时间戳 */
	function p(s) {
	    return s < 10 ? '0' + s: s;
	}
	var myDate = new Date();
	//获取当前年
	var year=myDate.getFullYear();
	//获取当前月
	var month=myDate.getMonth()+1;
	//获取当前日
	var date=myDate.getDate(); 
	var h=myDate.getHours();       //获取当前小时数(0-23)
	var m=myDate.getMinutes();     //获取当前分钟数(0-59)
	var s=myDate.getSeconds();  

	var now=year+'-'+p(month)+"-"+p(date)+" "+p(h)+':'+p(m)+":"+p(s);
	var langScript = $("<scri"+"pt>"+"</scr"+"ipt>").attr({src:"/public/static/manage/js/language.js?time="+now,type:'text/javascript',id:'load'}); 
	$("html").append(langScript);   
	/* 切换样式 */
	if(window.localStorage.getItem("language")=="en"){
		$(".ui.divided.inverted.ibem.list>.item .dim").addClass("en");	
	}
	$("#chooseLanguage>a").click(function(){
		$(this).addClass("active").siblings("a").removeClass("active");
		if($(this).data("value")=="language_ch"){
			window.localStorage.setItem("language","ch");
			setLanguageCookie();
			window.location.href = "/weixin/survey";
		}else if($(this).data("value")=="language_en"){
			window.localStorage.setItem("language","en");
			setLanguageCookie();
			window.location.href = "/weixin/survey";
		}
	})
//获取问卷列表
var url="/weixin/survey/release";
var json={};
var successFunc = function(data){
	var list = data.list;
	if(list.length>0){
		$(".ui.inverted.ibem.list").empty();
	}
	for(var i=0;i<list.length;i++){
		$(".ui.inverted.ibem.list").append("<div class='item'>"+
			      "<div class='content'>"+
			      "  <div class='header'><font><font>"+list[i].title+"</font></font></div><font><font>"+(list[i].introduction.length>40?list[i].introduction.substring(0,41):list[i].introduction)+
			      "</font></font></div>"+
			      "<div class='dim'>"+
			      "	<a class='answer' data-id='"+list[i].id+"'>"+getLangStr("mobilesurvey_1")+"</a><a class='choose' data-id='"+list[i].id+"'>"+getLangStr("mobilesurvey_2")+"</a>"+
			      "</div>"+
			      "</div>");
	}
	//a标签行高样式	
	$(".dim").each(function(){
		var height = $(this).height();
		$(this).find("a").each(function(){
			$(this).css("line-height",height+"px");
		})
	})
}
sentJson(url,json,successFunc);
//===========点击事件===========
$("#surveyList").on("click",".answer",function(){
	var surveyId = $(this).data("id");
	$.cookie("surveyId",surveyId);
	$.cookie("surveyProjectId","");
	$.cookie("surveyBuildingId","");
	$.cookie("surveyPointId","");
	window.location.href="/weixin/survey/answer";
})
$("#surveyList").on("click",".choose",function(){
	var surveyId = $(this).data("id");
	$.cookie("surveyId",surveyId);
	window.location.href="/weixin/survey/dimension";
})

//列表点击显示隐藏弹出框
$("#surveyList").on("click",".item",function(){
	$(this).siblings().find(".dim.visible").each(function(){
		$(this).transition('scale');
	});
	$(this).find(".dim").transition('scale');
})

// var setLanguage = function(){
//     jQuery.i18n.properties({
// 			name: 'i18n',
// 			path: '/public/i18n/',
// 			mode: 'map',
// 			language: window.localStorage.getItem("language"),
// 			callback: function() {
// 				$("title").html($.i18n.prop("wx_survey"));
// 				$("#survey_list").html($.i18n.prop("wx_survey_list"));
// 			}
// 	  })
// }