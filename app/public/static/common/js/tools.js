//当前页面没有返回的ajax请求数
var linkNum =0;
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
    		alertokMsg("network busy，Please retry！网络繁忙，请重试！","OK");
		}
    });
}
//发送json
function sentJson(url,dataJson,successFunc,errorFunc){
	addLoading();
	linkNum++;
//	
//	$.cookie("this_project_id",JSON.stringify(dataJson));
//	
	$.ajax({
 		type:"post",
 		dataType:"json",
 		url:url,
 		data:dataJson,
 		success:function(data){
 			linkNum--;
 			if(data.code==200){
 				successFunc(data,linkNum);
 			}else{
 				if(errorFunc){
 					errorFunc(data,linkNum);
 				}else{
 					if(data){
 	 					var errorcode = parseInt(data.code);
 	 					var errormsg = data.messg;
 	 					removeLoading()
// 	 					alertokMsg("error!errorcode:"+errorcode+","+errormsg,"OK");
						if(errorcode == 4005){
							alertokMsg(errormsg,"ok");
							setTimeout(function(){
								window.history.back();
							}, 3000);
						}else{
							alertokMsg("network busy，Please retry！网络繁忙，请重试！","OK");
						}
 	 				}
// 					重定向？？写什么待定
// 					setTimeout(function(){},1000);
 				}
 			}
 			removeLoading()
 		},
 		error:function(data){
 			linkNum--;
 			removeLoading()
 			alertokMsg("network busy，Please retry！网络繁忙，请重试！","OK");
// 			alertokMsg("系统出错，请联系管理员！","确定");
// 			alert("err data:"+JSON.stringify(data));
// 			alert("error!");
 		}
 	});
}
//发送json
function sentJson2(url,dataJson,successFunc,errorFunc,errorFunc1){
	linkNum++;
	console.log(dataJson);
	$.ajax({
 		type:"post",
 		dataType:"json",
 		url:url,
 		data:dataJson,
 		success:function(data){
 			linkNum--;
 			if(data.code==200){
 				successFunc(data,linkNum);
 			}else{
 				if(errorFunc){
 					errorFunc(data,linkNum);
 				}else{
 					if(data){
 	 					var errorcode = data.code;
 	 					var errormsg = data.messg;
 	 					removeLoading()
// 	 					alertokMsg("error!errorcode:"+errorcode+","+errormsg,"确定");
 	 				}
// 					重定向？？写什么待定
// 					setTimeout(function(){},1000);
 				}
 			}
 		},
 		error:function(data){
 			linkNum--;
 			if(errorFunc1){
 				errorFunc1();
 			}else{
 				alertokMsg("network busy，Please retry！网络繁忙，请重试！","OK");
// 				alertokMsg("系统出错，请联系管理员！","确定");
 			}
 			
 			// alert("err data:"+JSON.stringify(data));
 		}
 	});
}
//发送json
function sentJsonSync(url,dataJson,successFunc,errorFunc){
	linkNum++;
	$.ajax({
 		type:"post",
 		dataType:"json",
 		url:url,
 		async: false,
 		data:dataJson,
 		success:function(data){
 			linkNum--;
 			if(data.code==200){
 				successFunc(data,linkNum);
 			}else{
 				if(errorFunc){
 					errorFunc(data,linkNum);
 				}else{
 					if(data){
 	 					var errorcode = data.code;
 	 					var errormsg = data.messg;
// 	 					removeLoading()
// 	 					alertokMsg("error!errorcode:"+errorcode+","+errormsg,"确定");
 	 				}
// 					重定向？？写什么待定
// 					setTimeout(function(){},1000);
 				}
 				
 				
 			}
// 			removeLoading()
 		},
 		error:function(data){
 			linkNum--;
 			removeLoading();
 			alertokMsg("network busy，Please retry！网络繁忙，请重试！","OK");
// 			alertokMsg("系统出错，请联系管理员！","确定");
// 			alert("err data:"+JSON.stringify(data));
// 			alert("error!");
 		}
 	});
}
//添加loading页面
function addLoading(ele){
//	if(!ele){
//		ele=$(".content .ui.grid:first");
//	}
//	getComponent("/static/common/components/loding.html",
//			function(result){
//				if(ele.children(".loding-panel").length==0){
//					ele.prepend(result);
//				}
//			});
	ele= $("body");
//	getComponent("/static/common/components/loding.html",
//			function(result){
//				if(ele.children(".loding-panel").length==0){
//					ele.prepend(result);
//					var loadingheight = $(".loding-icon i.icon").height();
//					var loadingwidth = $(".loding-icon i.icon").width();
//					$(".loding-icon").height(loadingheight);
//					$(".loding-icon").width(loadingwidth);
//					$(".loding-icon").css("margin-left",-(loadingwidth/2));
//					$(".loding-icon").css("margin-top",-(loadingheight/2));
//				}
//			});
	
	
		if(ele.children(".loding-panel").length==0){
			ele.prepend('<style>'+
					'.loding-panel{width:100%;height:100%;background-color:rgba(0,0,0,0.5);position:fixed ;top:0;left:0;;z-index:2000;}'+
					'.loding-icon{position:absolute;top:50%;left:50%;z-index:2001}'+
					'.loding-icon i{color:white;}'+
					'</style>'+
						'<div class="loding-panel">'+
						'	<div class="loding-icon" ><i class="huge white spinner loading icon"></i></div>'+
						'</div>');
			var loadingheight = $(".loding-icon i.icon").height();
			var loadingwidth = $(".loding-icon i.icon").width();
			$(".loding-icon").height(loadingheight);
			$(".loding-icon").width(loadingwidth);
			$(".loding-icon").css("margin-left",-(loadingwidth/2));
			$(".loding-icon").css("margin-top",-(loadingheight/2));
		}
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
					if(loadingheight>80){
						loadingheight=80;
						loadingwidth=80;
					}
					$(".loding-icon").height(loadingheight);
					$(".loding-icon").width(loadingwidth);
					$(".loding-icon").css("margin-left",-(loadingwidth/2));
					$(".loding-icon").css("margin-top",-(loadingheight/2));
				}
			});
}
//去掉loding页面
function removeLoading(){
		if(linkNum==0){
			$(".loding-panel").remove();
		}
}
//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

//添加alert,参数分别为：title-提示框中部文字，cancel-取消提示文字，ok-确认提示文字，cancelFun-点取消执行方法，okFunc-点确认执行方法
function alertMsg(title,cancel,ok,okFuncName){
	getComponent("/common/alert",
			// function(result){
			// 	if($("#alertBackground").length==0){
			// 		$("body").prepend(result);
			// 	}
			// 	$('.segment.alert').modal('show');
			// },
			// {"-title-":title,"-cancel-":cancel,"-ok-":ok,"-okFunc-":okFuncName});
			function(result){
				if($("#alertokBackground").length==0){
					$("body").prepend(result);
					$(".ui.modal.alertok").modal('setting', 'closable', false).modal('show');
				}
			},
			{"-title-":title,"-cancel-":cancel,"-ok-":ok,"-okFunc-":okFuncName}
			// {"-title-":title,"-ok-":ok,"-doScript-":cancel}
	);
}
function removeAlert(){
	$('.segment.alert').modal('hide');
	setTimeout(function(){$('.segment.alert').remove();},100);
}
//添加alertOk,参数分别为：title-提示框中部文字，ok-底部提示文字
function alertokMsg(title,ok,doScript){
	getComponent("/common/alert_ok",
		function(result){
			if($("#alertokBackground").length==0){
				$("body").prepend(result);
				$(".ui.modal.alertok").modal('setting', 'closable', false).modal('show');
			}
		},
		{"-title-":title,"-ok-":ok,"-doScript-":doScript}
	);
}
function removeAlertOk(){
	$(".ui.modal.alertok").modal("hide");
	setTimeout(function(){$(".ui.modal.alertok").remove();},100);
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
function mobileremoveAlertOk(){
	$('.segment.alertok').dimmer('hide');
	setTimeout(function(){$(".segment.alertok").remove();},100);
}


//添加alertOk,参数分别为：title-提示框中部文字，ok-底部提示文字,okfun点确定的回调函数
function alertokMsg2(title,ok,okFuncName){
	getComponent("/common/alert_ok2",
			function(result){
				if($("#alertokBackground").length==0){
					$("body").prepend(result);
					$(".ui.modal.alertok").modal('setting', 'closable', false).modal('show')
				}
			},
			{"-title-":title,"-ok-":ok,"-okFunc-":okFuncName});
}

/*判断数据是否为空  */
function isEmpty(arr){
	   var count=0;
	   var _length=arr.length;
	   for(var i=0;i<arr.length;i++){
		   if(arr[i].data.length==0){
			   count++;
		   }
	   }
	   if(count==_length){
		   return true;
	   }
	   
	   return false;
}


/* 设置左侧导航显示 用户的名字 */
function setName(){
	var LocalName = localStorage.getItem("LocalName");
	$("#loginUserName").text(LocalName);
}

$(function(){
	setName();
});
//将canvas转换成image
function convertCanvasToImageData(canvas,type) {
	var imgData = canvas.toDataURL(type);
	// 加工image data，替换mime type
	imgData = imgData.replace(_fixType(type),'image/octet-stream');
	return imgData;
}
/**
 * 获取mimeType
 * @param  {String} type the old mime-type
 * @return the new mime-type
 */
var _fixType = function(type) {
    type = type.toLowerCase().replace(/jpg/i, 'jpeg');
    var r = type.match(/png|jpeg|bmp|gif/)[0];
    return 'image/' + r;
};
/**
 * 在本地进行文件保存
 * @param  {String} data     要保存到本地的图片数据
 * @param  {String} filename 文件名
 */
var saveFile = function(data, filename){
    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = data;
    save_link.download = filename;
   
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
};
// download canvas
function saveCanvas(canvas,filename,type){
	var imgData = convertCanvasToImageData(canvas,type);
	//下载后的问题名
	var name = filename + '_' + (new Date()).getTime() + '.' + type;
	saveFile(imgData,name);
}

//判断是否为空
function isNull(str){
	if(!str || str==null || $.trim(str)==""){
		return true;
	}else{
		return false;
	}
}

// 百度统计
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?7741df31404af44f50c784e72eb35b8e";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
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
(function(window, undefined){
	   //如果已经支持了，则不再处理
	   if( window.localStorage )
	       return;
	   /*
	    * IE系列
	    */
	   var userData = {
	       //存储文件名（单文件小于128k，足够普通情况下使用了）
	      file : window.location.hostname || "localStorage",
	      //key'cache
	      keyCache : "localStorageKeyCache",
	      //keySplit
	      keySplit : ",",
	      // 定义userdata对象
	      o : null,
	      //初始化
	      init : function(){
	          if(!this.o){
	              try{
	                  var box = document.body || document.getElementsByTagName("head")[0] || document.documentElement, o = document.createElement('input');
	                  o.type = "hidden";
	                  o.addBehavior ("#default#userData");
	                  box.appendChild(o);
	                  //设置过期时间
	                  var d = new Date();
	                  d.setDate(d.getDate()+365);
	                  o.expires = d.toUTCString();
	                  //保存操作对象
	                  this.o = o;
	                  //同步length属性
	                  window.localStorage.length = this.cacheKey(0,4);
	              }catch(e){
	                  return false;
	              }
	          };
	          return true;
	      },
	      //缓存key，不区分大小写（与标准不同）
	      //action  1插入key 2删除key 3取key数组 4取key数组长度
	      cacheKey : function( key, action ){
	          if( !this.init() )return;
	          var o = this.o;
	          //加载keyCache
	          o.load(this.keyCache);
	          var str = o.getAttribute("keys") || "",
	              list = str ? str.split(this.keySplit) : [],
	              n = list.length, i=0, isExist = false;
	          //处理要求
	          if( action === 3 )
	              return list;
	          if( action === 4 )
	              return n;
	          //将key转化为小写进行查找和存储
	            key = key.toLowerCase();
	          for(; i<n; i++){
	              if( list[i] === key ){
	                  isExist = true;
	                  if( action === 2 ){
	                      list.splice(i,1);
	                      n--; i--;
	                  }
	              }
	          }
	          if( action === 1 && !isExist )
	              list.push(key);
	          //存储
	          o.setAttribute("keys", list.join(this.keySplit));
	          o.save(this.keyCache);
	      },
	  //核心读写函数
	      item : function(key, value){
	          if( this.init() ){
	              var o = this.o;
	              if(value !== undefined){ //写或者删
	                  //保存key以便遍历和清除
	                  this.cacheKey(key, value === null ? 2 : 1);
	                  //load
	                  o.load(this.file);
	                  //保存数据
	                  value === null ? o.removeAttribute(key) : o.setAttribute(key, value+"");
	                  // 存储
	                  o.save(this.file);
	              }else{ //读
	                  o.load(this.file);
	                  return o.getAttribute(key) || null;
	              }
	              return value;
	          }else{
	              return null;
	          }
	          return value;
	      },
	      clear : function(){
	          if( this.init() ){
	              var list = this.cacheKey(0,3), n = list.length, i=0;
	              for(; i<n; i++)
	                  this.item(list[i], null);
	          }
	     }
	 };
	 //扩展window对象，模拟原生localStorage输入输出
	 window.localStorage = {
	     setItem : function(key, value){userData.item(key, value); this.length = userData.cacheKey(0,4)},
	     getItem : function(key){return userData.item(key)},
	     removeItem : function(key){userData.item(key, null); this.length = userData.cacheKey(0,4)},
	     clear : function(){userData.clear(); this.length = userData.cacheKey(0,4)},
	     length : 0,
	     key : function(i){return userData.cacheKey(0,3)[i];},
	     isVirtualObject : true
	 };
	 })(window);


