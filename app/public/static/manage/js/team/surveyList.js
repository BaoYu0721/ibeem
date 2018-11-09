/*存放缓存中的，项目id*/
var teamID = $.cookie("teamid");
//var surveyParam = $.cookie("surveyparam");
//添加左侧导航栏
getComponent("/static/manage/components/leftpanel.html",
		function(result){
			$(".fl.mainleft").html(result);
			/*左侧导航的选中效果*/
			$( ".leftmenu").click(function(){
			    $(this).addClass("active").siblings(".leftmenu").removeClass("active");
			});
//			$("#"+surveyParam).addClass("active");
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
	var url="/survey/getSurveyByProject";
//	var json={"projectID":teamID};
	var json={"projectID":"-1"};
	var successFunc = function(data){
		var surveys = data.list;
		for(i in surveys){
			var survey = surveys[i];
			var id = survey.id;
			var name = survey.name;
			var count = survey.count;
			var title = survey.title;
			var introduction = survey.introduction;
			//将数据放到页面
			var htmlStr =$("<tr> <td><div class='ui fitted checkbox' data-id='"+id+"' data-count='"+count+"' ><input type='checkbox' class='hidden'><label></label></div></td><td>"+title+"</td> <td>"+introduction+"</td> <td>"+name+"</td> <td>"+count+"</td></tr>") 
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
	    		"info":"显示第 _START_ 条至第 _END_ 条数据，共 _TOTAL_ 条数据",
	    		"infoFiltered":   "(从 _MAX_ 	条记录中匹配出)",
	        	"infoEmpty":"0条数据",
	        	"search":""
	    	}
	    });
		//调整表格元素方位
	    $("#datatable_wrapper .ui.grid").find(".row:first").css("padding",0);
	    $("#datatable_wrapper .ui.grid").find(".row:first").find(".column:first").remove();
	    $("#datatable_wrapper .ui.grid").find(".row:first").find(".column").removeClass("right");
	    $("#datatable_wrapper .ui.grid").find(".row:first").find(".column").removeClass("aligned");
	    $page = $("#datatable_wrapper .ui.grid").find(".row:last").find(".column:first");
	    $("#datatable_wrapper .ui.grid").find(".row:first").append($page);
	}
	sentJson(url,json,successFunc);
}

$(document).ready(function() {
	//获取数据，放置到页面table中
	getSurveyData()
} );

$("#addSurvey").click(function(){
	window.location.href="/survey?item=increase"
})
$("#surveyReport").click(function(){
	var id = $("#datatable_body").find(".ui.checkbox.checked").data("id");
	var count = $("#datatable_body").find(".ui.checkbox.checked").data("count");
	if(count==0){
		alertokMsg("问卷没有答案，无法统计","确定");
		return false;
	}
	$.cookie("reportId",id);
	window.location.href="/views/manage/surveyReport.jsp"
})
