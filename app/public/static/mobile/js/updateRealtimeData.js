$(function(){
	/* 添加输入框焦点效果 */
	$(".paramItem li").click(function(){
		$(this).children("input").focus();
		//$(this).css("borderColor","#3fb493");
		$(this).addClass("on").siblings().removeClass("on");
		if($(this).children("em").html()=="有"){
			$(this).children("em").html("无");
		}else{
			$(this).children("em").html("有");
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
	$(".item span ").click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(".heatmethod .value").html($(this).html());
		$(".heating").css("display","none");
	});
});