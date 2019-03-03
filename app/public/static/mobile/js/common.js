//判断是android还是ios 设置body的字体为默认
/*if(basic.isIos()){
    $('body').css({fontFamily:'Heiti SC,Helvetica,HelveticaNeue'});
}
if(basic.isAndroid()){
    $('body').css({fontFamily:'Droidsansfallback,Droid Sans'});
}
*/

function init_home_setting(){
	localStorage.setItem("home_setting_initlized",true); 
	localStorage.setItem("shape",1);
	localStorage.setItem("window_class",1);
	localStorage.setItem("window_area",3.6);
	localStorage.setItem("floor_area",20);
	localStorage.setItem("people_number",3);
	localStorage.setItem("window_number",2);
	localStorage.setItem("ceil_light_number",1);
	localStorage.setItem("desk_light_number",1);
	localStorage.setItem("has_air_cleaner",1);
	localStorage.setItem("has_air_new",0);
	localStorage.setItem("ac_form",2);	
	localStorage.setItem("ac_form_leng",1);
}

function show_home_setting(){
	$("#floor_area").val(localStorage.getItem("floor_area"));
	$("#people_number").val(localStorage.getItem("people_number"));
	$("#window_number").val(localStorage.getItem("window_number"));
	$("#window_class").val(localStorage.getItem("window_class"));
	$("#ceil_light_number").val(localStorage.getItem("ceil_light_number"));
	$("#desk_light_number").val(localStorage.getItem("desk_light_number"));
	$("#window_area").val(localStorage.getItem("window_area"));
	var shape = ["",getLangStr("mobilehome_5"),getLangStr("mobilehome_6"),getLangStr("mobilehome_7"),getLangStr("mobilehome_8")][localStorage.getItem("shape")];
	$("#shape").html(shape);
	$(".shape_items span[value="+localStorage.getItem("shape")+"]").addClass("current");
	
	var windowclass = ["",getLangStr("mobilehome_9"),getLangStr("mobilehome_10"),getLangStr("mobilehome_11"),getLangStr("mobilehome_12"),getLangStr("mobilehome_13")][localStorage.getItem("window_class")];
	$("#window_class").html(windowclass);
	$(".windowclass_items span[value="+localStorage.getItem("window_class")+"]").addClass("current");
	
	var ac_form = ["",getLangStr("mobilehome_14"),getLangStr("mobilehome_15"),getLangStr("mobilehome_16"),getLangStr("mobilehome_17")][localStorage.getItem("ac_form")];
	$("#ac_form").html(ac_form);
	$(".heating span[value="+localStorage.getItem("ac_form")+"]").addClass("current");
	
	var ac_form_leng = ["",getLangStr("mobilehome_18"),getLangStr("mobilehome_19"),getLangStr("mobilehome_20")][localStorage.getItem("ac_form_leng")];
	$("#ac_form_leng").html(ac_form_leng);
	$(".cold span[value="+localStorage.getItem("ac_form_leng")+"]").addClass("current");
	
	$("#has_air_cleaner").html([getLangStr("mobilehome_2"),getLangStr("mobilehome_1")][localStorage.getItem("has_air_cleaner")]);
	$("#has_air_new").html([getLangStr("mobilehome_2"),getLangStr("mobilehome_1")][localStorage.getItem("has_air_new")]);

	
	
}

function bind_home_setting_input(){
	$(".paramItem li input").change(function(){
		var key = $(this).attr("id");
		var val;
		if($(this).is('input')){
			val = $(this).val();
		}else{
			val = $(this).html();
		}
		localStorage.setItem(key,val);	
	});
}
                

$(function(){
	/* 修改html font-size */
	var windowWidth = $(window).width();
	var thisSize = (28/414)*windowWidth;
	$("html").css("font-size",thisSize);

	/*从localstorage获取deviceid*/
	var device_id=localStorage.getItem("device_id"); 
	
	/*底部导航添加事件*/
	$(".footer li").click(function(){
		$(this).addClass("current").siblings().removeClass("current");
	});
	var timestamp = Date.parse(new Date());
 	timestamp = timestamp / 1000;
	//底部导航链接
	 $("#devicetab").click(function(){
		 window.location.href = "/weixin/device?did=" + device_id + "&item=detail" + "&timestamp="+timestamp;
	 });
	 
	 $("#realtimetab").click(function(){
		window.location.href = "/weixin/device?did=" + device_id + "&item=realtime" + "&timestamp="+timestamp;
	 });
	 
	 $("#historytab").click(function(){
		window.location.href = "/weixin/device?did=" + device_id + "&item=history" + "&timestamp="+timestamp;
	 });
	 
	 $("#evaluationtab").click(function(){
		window.location.href = "/weixin/device?did=" + device_id + "&item=evaluation" + "&timestamp="+timestamp;
	 });
	 
	 $("#hometab").click(function(){
		window.location.href = "/weixin/device?did=" + device_id + "&item=room" + "&timestamp="+timestamp;
	 });	 
	 
	/*底部导航的当前位置*/
	 if(window.location.href.indexOf("detail") != -1){
	    $(".footer li").removeClass("current");
	    $("#devicetab").addClass("current");
	}
	if(window.location.href.indexOf("realtime") != -1||window.location.href.indexOf("realtime") != -1){
		$(".footer li").removeClass("current");
		$("#realtimetab").addClass("current");
	}
	if(window.location.href.indexOf("history") != -1){
		$(".footer li").removeClass("current");
		$("#historytab").addClass("current");
	}
	if(window.location.href.indexOf("evaluation") != -1){
		$(".footer li").removeClass("current");
		$("#evaluationtab").addClass("current");
	}
	if(window.location.href.indexOf("room") != -1){
		$(".footer li").removeClass("current");
		$("#hometab").addClass("current");
	}
	
	bind_home_setting_input();
	
	
	
	//绑定返回列表
	if(localStorage.getItem("login_type") == "user" && $.cookie("login_type") == "user"  ){
		$(".return_to_list_float_btn").html(getLangStr("mobilehome_3"));
		$(".return_to_list_float_btn").show();
		$(".return_to_list_float_btn").click(function(){
			var timestamp = Date.parse(new Date());
		 	timestamp = timestamp / 1000;
			window.location.href = "/weixin/device?timestamp="+timestamp;
		});
	}else{
		$(".return_to_list_float_btn").html(getLangStr("mobilehome_4"));
		$(".return_to_list_float_btn").show();
		$(".return_to_list_float_btn").click(function(){
			var timestamp = Date.parse(new Date());
		 	timestamp = timestamp / 1000;
			window.location.href = "/weixin/device?timestamp="+timestamp;
		});
		//$(".return_to_list_float_btn").hide();
		$(".refresh").css("display","none");
		$(".img-panel").unbind();
		$(".img-panel .close").css("display","none");
		$(".devicedetail").css("margin-bottom","2.5rem");
	}	
});
//获取组件
function getComponent(src,func,replaceTxt){
    $.ajax({
        type:"get",
        url:src,
        async: false,
        dataType:"html",
        success:function(result){
        	if(replaceTxt){
        		var arr = Object.keys(replaceTxt);
                for(var i =0 ;i<arr.length;i++){
                    result = result.replace(new RegExp(arr[i],'gm'),replaceTxt[arr[i]]);
                }       
        	}
        	func(result);
        },
    	error:function(){
//			alert("error!");
		}
    });
}

//添加loading页面
function addMobileLoading(){
	var ele= $("body");
	getComponent("/common/mobileloading",
			function(result){
				if(ele.children(".loding-panel").length==0){
					ele.prepend(result);
					var loadingheight = $(window).width()*0.15;
					var loadingwidth = $(window).width()*0.15;
					$(".loding-icon").height(loadingheight);
					$(".loding-icon").width(loadingwidth);
					$(".loding-icon").css("margin-left",-(loadingwidth/2));
					$(".loding-icon").css("margin-top",-(loadingheight/2));
				}
			});
}
//去掉loding页面
function removeLoading(){
	
		$(".loding-panel").remove();
	
	
}
//mobile添加alertOk,参数分别为：title-提示框中部文字，ok-底部提示文字
function mobilealertokMsg(title,ok,okfunc){
	getComponent("/common/mobilealertOk",
			function(result){
				if($("#alertokBackground").length==0){
					$("body").prepend(result);
					$('.segment.alertok').dimmer('show');
				}
			},
			{"-title-":title,"-ok-":ok,"-okfunc-":okfunc});
}