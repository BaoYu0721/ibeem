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
    		alertokMsg("系统出错，请联系管理员！","确定");
		}
    });
}
//发送json
function sentJson(url,dataJson,successFunc,errorFunc){
	addLoading();
	$.ajax({
 		type:"post",
 		dataType:"json",
 		url:url,
 		data:dataJson,
 		success:function(data){
 			if(data.code==200){
 				successFunc(data);
 			}else{
 				if(errorFunc){
 					errorFunc(data);
 				}else{
 					if(data){
 	 					var errorcode = data.code;
 	 					var errormsg = data.messg;
 	 					removeLoading();
 	 					alertokMsg("error!errorcode:"+errorcode+","+errormsg,"确定");
 	 				}
// 					重定向？？写什么待定
// 					setTimeout(function(){},1000);
 				}
 				
 				
 			}
 			removeLoading();
 		},
 		error:function(data){
 			removeLoading();
 			alertokMsg("系统出错，请联系管理员！","确定");
 		}
 	});
}
//添加loading页面
function addLoading(ele){
	ele= $("body");
		if(ele.children(".loding-panel").length==0){
			ele.prepend('<style>'+
					'.loding-panel{width:100%;height:100%;background-color:rgba(0,0,0,0.5);position:fixed ;top:0;left:0;;z-index:2000;}'+
					'.loding-icon{position:absolute;top:50%;left:50%;z-index:2001}'+
					'</style>'+
						'<div class="loding-panel">'+
						'	<div class="loding-icon" ><img style="width:100%;height:100%;" src="/public/public/static/manage/img/loading.gif"></div>'+
						'</div>');
			var loadingheight = $(".loding-icon img").height();
			var loadingwidth = $(".loding-icon img").width();
			$(".loding-icon").height(loadingheight);
			$(".loding-icon").width(loadingwidth);
			$(".loding-icon").css("margin-left",-(loadingwidth/2));
			$(".loding-icon").css("margin-top",-(loadingheight/2));
		}
}
//去掉loding页面
function removeLoading(){
		$(".loding-panel").remove();
}
//判断是否为空
function isNull(str){
	if(!str || str==null || $.trim(str)==""){
		return true;
	}else{
		return false;
	}
}
//mobile添加alertOk,参数分别为：title-提示框中部文字，ok-底部提示文字
function mobilealertokMsg(title,ok,okfunc){
	getComponent("/static/common/components/mobilealertOk.html",
			function(result){
				if($("#alertokBackground").length==0){
					$("body").prepend(result);
					$("#alertokPanel").css("width","12em");
					$("#alertokPanel").css("height","6em");
					$("#alertokPanel").css("margin-left","-6em");
					$("#alertokPanel").css("margin-top","-3em");
					$("#alertokPanel>.top").css("height","4em");
					$("#alertokPanel>.top>span").css("font-size",".6em");
					$("#alertokPanel>.top>span").css("padding","2em 1em 0");
					$("#alertokPanel>.bottom").css("height","2em");
					$("#alertokPanel>.bottom>a").css("border-radius",".2857em");
					$("#alertokPanel>.bottom>a").css("min-width","4em");
					$("#alertokPanel>.bottom>a").css("height","1.5em");
					$("#alertokPanel>.bottom>a").css("font-size",".6em");
					$("#alertokPanel>.bottom>a").css("line-height","1.5em");
					
					
					$('.segment.alertok').dimmer('show');
				}
			},
			{"-title-":title,"-ok-":ok,"-okfunc-":okfunc==undefined?"":okfunc});
}
function mobileremoveAlertOk(){
	$('.segment.alertok').dimmer('hide');
	setTimeout(function(){$(".segment.alertok").remove();},100);
}
//添加alertOk,参数分别为：title-提示框中部文字，ok-底部提示文字
function alertokMsg(title,ok,doScript){
	getComponent("/static/common/components/alertOk.html",
			function(result){
				if($("#alertokBackground").length==0){
					$("body").prepend(result);
					$('.segment.alertok').dimmer('show');
				}
			},
			{"-title-":title,"-ok-":ok,"-doScript-":doScript});
}
function removeAlertOk(){
	$('.segment.alertok').dimmer('hide');
	setTimeout(function(){$(".segment.alertok").remove();},100);
}
//根据key值获取中英文对照文字
function getLangStr(key){	
	var langobj = window.localStorage.getItem("lang");
	langobj = eval('(' + langobj + ')');
	var str = langobj[key];
	if(str==undefined || str==null){
		console.log("======error！无法获取值为：【"+key+"】的localStorage值======");
		alertokMsg("faild to load languageStr！","ok");
		return "";
	}
	return str;
}

