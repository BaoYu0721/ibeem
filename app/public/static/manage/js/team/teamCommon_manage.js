//给网页添加ico
$("head").append($("<link rel='shortcut icon' href='/public/static/common/img/favicon.ico'>"))
//添加上传图片监听
 var uploadImg="";
 $(".portraitForm").each(function(){
	$form =$(this); 
 	$(this).change(function(){
 		 UploadPhotoMethod($(this).children(".eportrait"),function(){
 			 //成功后去掉添加框
 			 $form.parent().parent().children(".addicon").css("display","none");
 			 $form.parent().parent().children("span").css("display","none");
 		 });
 	});
 });
// 删除图片方法
 $(".deleteImg").on("click",function(){
	 $(this).siblings(".portraitStyle").attr("src","");
	 $(this).parent().parent().parent().children(".addicon").css("display","block");
	 $(this).addClass("readonly");
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
		alertokMsg(getLangStr("image_error"),getLangStr("determine"));
		obj.val('');
	}else{
		$form = obj.parent();
		$img = $form.children(".portraitStyle");
		$deleteimg = $form.children(".deleteImg");
		$form.ajaxSubmit(function(json) {
			console.log(json);
			if(json.code != 200) {
				alert("上传图片失败，请稍后重试");
				return;
			}
			uploadImg=json.imageList[0].imageurl;
			$img.attr("src","/public/file/image/" + uploadImg);
			$deleteimg.removeClass("readonly");
			func();
		})
}};
//编辑项目信息，将input框变为可编辑
$(".edit").on("click",function(){
	var changearea = $(this).data("changearea");
	if(!changearea || $.trim(changearea)==""){
		changearea="";
	}
	$(changearea+" .change-status").removeAttr("readonly");
	$(changearea+" .change-status").removeClass("readonly");
	$(changearea+".change-status").removeAttr("readonly");
	$(changearea+".change-status").removeClass("readonly");
	$(changearea+" .change-status.deleteImg").each(function(){
		$this = $(this);
		var imgsrc = $this.siblings(".portraitStyle").attr("src")
		if($.trim(imgsrc)==""){
			$this.addClass("readonly");
		}
	});
	$(".edit").addClass('edit-focus');
	$(".edit").attr("disabled","disabled");
	
})
//去掉编辑样式
function changestatus(changearea){
	if(!changearea || $.trim(changearea)==""){
		changearea="";
	}
	$(changearea+" .change-status").attr("readonly","");
	$(changearea+" .change-status").addClass("readonly");
	$(changearea+".change-status").attr("readonly","");
	$(changearea+".change-status").addClass("readonly");
	$(".edit").removeClass('edit-focus');
	$(".edit").removeAttr("disabled");
}
//添加左侧导航栏
getComponent("/common/admin/leftpanel",
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
	$('#content').css("width",window_width-60);
	$('.fl.main').css("width",window_width-60);
//	$('.ui.grid').css("min-width",1200);
}
$(window).resize(function(){
	/*动态设置内容区高度  */
	init();
});
$(function(){
	init();
	
	// 关联设备时候点击非设备列表处隐藏关联设备列表
	$(document).bind("click",function(e){ 
		var target = $(e.target); 

		if(target.closest(".addPointListBox,#link-device").length == 0){ 
			if($('.addPointListBox').css("display") == "block"){
				
				$('.addPointListBox').css("display","none");
			}
		} 					
	}); 

	// 关联问卷时候点击非设备列表处隐藏关联设备列表
	$(document).bind("click",function(e){ 
		var target = $(e.target); 

		if(target.closest(".addSurveyListBox,#link-survey").length == 0){ 
			if($('.addSurveyListBox').css("display") == "block"){
				
				$('.addSurveyListBox').css("display","none");
			}
		} 					
	}); 
})
/*内容区左侧导航添加tab切换事件  */
$("#submenu .item").click(function(){
	$(this).addClass("on").siblings().removeClass("on");
});

/*内容区头部切换导航*/
$(".main .ui.inverted.icon.menu .item").click(function(){
    $(this).addClass("on").siblings().removeClass("on");
});

