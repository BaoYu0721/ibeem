 jQuery.fn.extend({
    slideRightShow: function() {
        return this.each(function() {
            $(this).show('slide', {direction: 'right'}, 1000);
        });
    },
    slideLeftHide: function() {
        return this.each(function() {
            $(this).hide('slide', {direction: 'left'}, 1000);
        });
    },
    slideRightHide: function() {
        return this.each(function() {
            $(this).hide('slide', {direction: 'right'}, 1000);
        });
    },
    slideLeftShow: function() {
        return this.each(function() {
            $(this).show('slide', {direction: 'left'}, 1000);
        });
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
		$(oTarget).css({
			"borderWidth":"1px",
			"borderStyle":"solid",
			"borderColor":"#47b391"
		});
		 //oTarget.style.color="#019ddd";
	
	} 
	//失去焦点时变为黑色 
	var oTB = function() 
	{ 
		 var oEvent = arguments[0]; 
		 var oTarget = oEvent.target || oEvent.srcElement; 
		 //oTargelor="#000000"; 
		 $(oTarget).css({
				"borderWidth":"1px",
				"borderStyle":"solid",
				"borderColor":"#979797"
			});
		 //oTarget.style.color="#979797";
	} 

/*设置表头字体左对齐*/
	function setTextAlign(){
		$("table.dataTable.table thead th.sorting, table.dataTable.table thead th.sorting_asc, table.dataTable.table thead th.sorting_desc").css({
			"textAlign":"left",
			"paddingLeft":"0.7rem"
		});
	}
$(function(){
	/*添加输入框焦点效果  */
	var aInput=$(".contentbox input");
	for(var i=0;i<aInput.length;i++){
		if(aInput[i].type=="text"){
		 	oEventUtil.AddEventHandler(aInput[i],'focus',oTF); 
		 	oEventUtil.AddEventHandler(aInput[i],'blur',oTB); 
		 } 
	}
	//点击编辑
	 $(".edit").click(function(){
			$(".submitBtn").css("display","block");
	    	$(".staticValue").css("display","none");
	    	$(".dynamicValue").removeClass("hidden");
	    	$(".dynamicValue").css("display","block");
	 });
 
	/*动态设置内容区高度  */
	var wh=$(window).height();
	var ww=$(window).width();
	var th=$(".main .ui.inverted.menu").height();
	var mainLeftHeight=$("#mainLeft").height();
	var mainLeftWidth=$("#mainLeft").width();
	var mainRightHeight=$("#mainRight").height();
	
	$("#contentLeft").css("height",mainRightHeight+"px");
	$(".main").css("width",ww-mainLeftWidth+"px");
	$(".main .ui.inverted.menu").css("width",ww-mainLeftWidth+"px");
	$("#topmenu").css("width",ww-mainLeftWidth+"px!important");
	
	$(window).resize(function(){
		/*动态设置内容区高度  */
		var wh=$(window).height();
		var ww=$(window).width();
		var th=$(".main .ui.inverted.menu").height();
		
		var mainLeftHeight=$("#mainLeft").height();
		var mainLeftWidth=$("#mainLeft").width();
		
		var mainRightHeight=$("#mainRight").height();
		$("#contentLeft").css("height",mainRightHeight+"px");
		$(".main").css("width",ww-mainLeftWidth+"px");
		$(".main .ui.inverted.menu").css("width",ww-mainLeftWidth+"px");
		$("#topmenu").css("width",ww-mainLeftWidth+"px!important");
	});
	
	/*内容区左侧导航添加tab切换事件  */
	$("#submenu .item").click(function(){
		$(this).addClass("on").siblings().removeClass("on");
	});
	
	 /*左侧导航的选中效果*/
    $( ".leftmenu").click(function(){
        $(this).addClass("active").siblings(".leftmenu").removeClass("active");
    });
	
    /*内容区头部切换导航*/
    $(".main .ui.inverted.icon.menu .item").click(function(){
        $(this).addClass("on").siblings().removeClass("on");
        $(".contentTab").eq($(this).index()).addClass("on");
        $(".contentTab").eq($(this).index()).siblings().addClass("on");
    });
	
    /* icon图标 */
	linkTag = document.createElement('link');
	linkTag.setAttribute('rel','shortcut'+' '+'icon');
	linkTag.href = '/public/static/common/img/favicon.ico';
	document.getElementsByTagName('head')[0].appendChild(linkTag);
 
});