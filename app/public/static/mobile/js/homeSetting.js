$(function(){
	if(localStorage.getItem("language")=="en"){
		$(".paramItem").addClass("en");
		$(".return_to_list_float_btn").addClass("en");
	}
	$(".main").css("height",$(window).height() - $(".footer").height());
	
	/* 添加输入框焦点效果 */
	$(".paramItem li").click(function(){
		$(this).children("input").focus();
		//$(this).css("borderColor","#3fb493");
		$(this).addClass("on").siblings().removeClass("on");
		
		
		
		
		if($(this).children("em").html()==getLangStr("mobilehome_1")){
			$(this).children("em").html(getLangStr("mobilehome_2"));
			var key = $(this).children("em").attr("id");
			var val = 0;
			localStorage.setItem(key,val);	
		}else{
			$(this).children("em").html(getLangStr("mobilehome_1"));
			var key = $(this).children("em").attr("id");
			var val = 1;
			localStorage.setItem(key,val);	
		}
		
		
	});
	

	//定义监听器
	var oEventUtil = new Object(); 
	oEventUtil.AddEventHandler = function(oTarget,sEventType,fnHandler){ 
		 if(oTarget.addEventListener){ 
			 oTarget.addEventListener(sEventType,fnHandler,false); 
		 } else if(oTarget.attachEvent) { 
			 oTarget.attachEvent('on'+sEventType,fnHandler); 
		 } else{ 
			 oTarget['on'+sEventType] = fnHandler; 
		 } 
	}; 
	//回调函数,获得焦点时变为红色 
	var oTF = function() { 
		var oEvent = arguments[0]; 
		var oTarget = oEvent.target || oEvent.srcElement; 
		 //oTargelor="#ff0000"; 
		$(oTarget).css("textAlign","center");
		 //oTarget.style.color="#019ddd";

	} 
	//失去焦点时变为黑色 
	var oTB = function() 
	{ 
		 var oEvent = arguments[0]; 
		 var oTarget = oEvent.target || oEvent.srcElement; 
		 //oTargelor="#000000"; 
		 $(oTarget).css("textAlign","right");
		 //oTarget.style.color="#979797";
	} 

	/* 捕获焦点时，输入框内容居中*/
	var aInput=document.getElementsByTagName("input"); 
	for(var i=0;i<aInput.length;i++){
	 	oEventUtil.AddEventHandler(aInput[i],'focus',oTF); 
	 	oEventUtil.AddEventHandler(aInput[i],'blur',oTB); 
	}
	$(".heatmethod").click(function(){
		$(".heating").css("display","block");
	});

	$(".heating .item span ").click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(".heatmethod .value").html($(this).html());
		localStorage.setItem("ac_form",$(this).attr("value"));	
		$(".heating").css("display","none");
	});
	
	$(".shape").click(function(){
		$(".shape_items").css("display","block");
	});
	
	
	$(".shape_items .item .item-div ").click(function(){
		$(this).find("span").addClass("current");
		$(this).siblings().find("span").removeClass("current");
		$(".shape .value").html($(this).find("span").html());
		localStorage.setItem("shape",$(this).find("span").attr("value"));	
		$(".shape_items").css("display","none");
	});
	//外窗样式
	$(".windowclass").click(function(){
		$(".windowclass_items").css("display","block");
	});
	
	$(".windowclass_items .item .item-div ").click(function(){
		$(this).find("span").addClass("current");
		$(this).siblings().find("span").removeClass("current");
		$(".windowclass .value").html($(this).find("span").html());
		localStorage.setItem("window_class",$(this).find("span").attr("value"));	
		$(".windowclass_items").css("display","none");
	});
	//空调冷源
	$(".coldmethod").click(function(){
		$(".cold").css("display","block");
	});

	$(".cold .item span ").click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(".coldmethod .value").html($(this).html());
		localStorage.setItem("ac_form_leng",$(this).attr("value"));	
		$(".cold").css("display","none");
	});
	var home_setting_initlized = localStorage.getItem("home_setting_initlized");
	
	if(home_setting_initlized == null || home_setting_initlized == false){
		init_home_setting();
	}	
	
	show_home_setting();
	
	
});