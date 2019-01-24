var passwordEdited = false;

$(document).ready(function(){ 
	var windowHeight = $(window).height();
	$("body").css("height",windowHeight);
	var contentHeight = $("#content").height();
	$("#logo").css("margin-top",contentHeight*0.14);
	$("#user_name").css("margin-top",contentHeight*0.43);
	$("#user_password").css("margin-top",contentHeight*0.52);
	$("button").css("height",contentHeight*0.067);
	$("#user_login_btn").css("margin-top",contentHeight*0.64);
	$("#qrcode_login_btn").css("margin-top",contentHeight*0.74);
	$("#copyright").css("margin-top",contentHeight*0.95);
	$("#cover").css("visiability","hidden");
	$("#register_btn").css("top",contentHeight*0.82)
	
	if($.cookie("username")!=null){
		$("#user_name").val($.cookie('username'));
	}
	
	if($.cookie('password') != null){
		$("#user_password").val($.cookie('password').substr(0,8));
	}
	
	$("#user_password").change(function(){
		passwordEdited = true;
	});
	
	$("#register_btn").click(function(){
		alert("注册功能在春节后开放~");
	});
//	var str = "IBEMV1,10000";	    		
//	if(str.indexOf(",")!=-1){
//		//2017.12.25新增，新添了一批设备，二维码是字符串：IBEMV1,10000	    		
//		//逗号后面是设备id
//		window.location.href = "/device/qrcodelogin?id="+str.split(",")[1];
//	}

			
	$("#user_login_btn").click(function(){
		addMobileLoading();
		var username = $("#user_name").val();
		
		var password = $.cookie('password');
		if(password == null || passwordEdited){
			password = $("#user_password").val();
		}
		
		$.ajax({
	        type: "post",
	        dataType: "json",
	        url: '/weixin/login',
	        data: {username:username,
	        	   password:password},
	        success: function (data) {
	        	removeLoading();
	            if (data.status == 0) {
	            	localStorage.setItem("login_type","user");
	            	var timestamp = Date.parse(new Date());
	            	timestamp = timestamp / 1000;
	            	window.location.href = "/weixin/device?timestamp="+timestamp;
	            }else{  //失败
	            	if(data.messg==1){
	            		alert(getLangStr("login_messg1"));
	            	}else if(data.messg==2){
	            		alert(getLangStr("login_messg2"));
	            	}else{
	            		alert(getLangStr("mobile_index1"));
	            	}
	            }
	        },
	        error:function (XMLHttpRequest, textStatus, errorThrown) 
	        { 
	        	removeLoading();
	        } 
	    });
	});
	
	
	
	$("#qrcode_login_btn").click(function(){
		wx.scanQRCode({
		    needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
		    scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
		    success: function (res) {
		    	var token = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
		    	if(token.indexOf("www.ibeem.cn") >= 0){
		    		window.location.href = token;
		    	}else{
		    		var timestamp = Date.parse(new Date());
	            	timestamp = timestamp / 1000;
		    		window.location.href = "/device/qrcodelogin?token="+token+"&timestamp="+timestamp;
		    	}
		    	localStorage.setItem("login_type","device");
			},
			fail: function(res){
			}
		});
	});
	
	/*$(".register_now").click(function(){
		window.location.href="register.jsp";
	});*/
	
	
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

	$("#chooseLanguage>a").click(function(){
		$(this).addClass("active").siblings("a").removeClass("active");
		if($(this).data("value")=="language_ch"){
			window.localStorage.setItem("language","ch");
			setLanguageCookie();
			window.location.reload();
		}else if($(this).data("value")=="language_en"){
			window.localStorage.setItem("language","en");
			setLanguageCookie();
			window.location.reload();
		}
	})
});