function randomString(len) {
		len = len || 32;
		var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
		var maxPos = $chars.length;
		var pwd = '';
		for (i = 0; i < len; i++) {
			pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return pwd;
	}

	$(document).ready(function(){ 
		var windowHeight = $(window).height();
		$("body").css("height",windowHeight);
		var contentHeight = $("#content").height();
		$("#logo").css("margin-top",contentHeight*0.14);
		$("#device_name").css("margin-top",contentHeight*0.43);
		$("#device_password").css("margin-top",contentHeight*0.52);
		$("button").css("height",contentHeight*0.067);
		$("#device_login_btn").css("margin-top",contentHeight*0.64);
		$("#qrcode_login_btn").css("margin-top",contentHeight*0.74);
		$("#copyright").css("margin-top",contentHeight*0.95);
		$("#cover").css("visiability","hidden");
				
		if($.cookie('device_name') != null){
			$("#device_name").val($.cookie('device_name'));
		}
		
		
		$("#device_login_btn").click(function(){
			
			var devicename = $("#device_name").val();
			var password = $("#device_password").val();

			$.ajax({
		        type: "post",
		        dataType: "json",
		        url: '/device/login',
		        data: {devicename:devicename,
		        	   password:password},
		        success: function (data) {
		        	
		            if (data.status == 0) {
		        		/*存储device的id*/
		            	localStorage.setItem("device_id",data.deviceId);
		            	window.location.href = "/page/mobile/realtime/"+data.deviceId;
		            }else{  //失败
		            	alert("登录失败，请重新尝试！");
		            }
		        },
		        error:function (XMLHttpRequest, textStatus, errorThrown) 
		        { 
		          alert(textStatus);
		         
		        } 
		    });
		});
		
		var noncestr = randomString(32);
		var jsapi_ticket = $("#weixin_api_ticket").attr("key");
		var timestamp =new Date().getTime();
		var url = window.location.href;
		url = url.substr(0,url.indexOf("#")== -1 ? url.length : url.indexOf("#"));
		var raw = "jsapi_ticket=" + jsapi_ticket + "&noncestr=" + noncestr + "&timestamp=" + timestamp + "&url=" + url;
		var signature = $.sha1(raw);
		
		wx.config({
		    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
		    appId: 'wx472e78d4295c4091', // 必填，公众号的唯一标识
		    timestamp: timestamp, // 必填，生成签名的时间戳
		    nonceStr: noncestr, // 必填，生成签名的随机串
		    signature: signature,// 必填，签名，见附录1
		    jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
		});

		wx.ready(function(){
		    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。			
		});
		
		wx.error(function(res){
		    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
		});
		
		$("#qrcode_login_btn").click(function(){
			wx.scanQRCode({
			    needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
			    scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
			    success: function (res) {
			    	var token = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
			    	alert(token);
			    	if(token.indexOf("www.ibeem.cn") >= 0){
			    		window.location.href = token;
			    	}else{
			    		window.location.href = "/device/qrcodelogin?token="+token;
			    	}
				}
			});
		});
		
		/*$(".register_now").click(function(){
			window.location.href="register.jsp";
		});*/
		
	});