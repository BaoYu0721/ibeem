
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
	$(oTarget).parent(".inputItem").css("borderColor","#019ddd");
	 //oTarget.style.color="#019ddd";

} 
//失去焦点时变为黑色 
var oTB = function() 
{ 
	 var oEvent = arguments[0]; 
	 var oTarget = oEvent.target || oEvent.srcElement; 
	 //oTargelor="#000000"; 
	 $(oTarget).parent(".inputItem").css("borderColor","#979797");
	 //oTarget.style.color="#979797";
} 
