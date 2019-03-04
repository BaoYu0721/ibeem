/**
 * Call Weixin API
 */
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
	var noncestr = randomString(32);
//	var jsapi_ticket = $("#weixin_api_ticket").attr("key");
	var jsapi_ticket = "";
	$.ajax({
        type: "post",
        dataType: "json",
        async : false,
        url: '/weixin/getTicket',
        data: {},
        success: function (data) {
			jsapi_ticket = data.ticket;
        }
	});
//	alert("tocken:"+tocken);
	var timestamp =new Date().getTime();
	var url = window.location.href;
	url = url.substr(0,url.indexOf("#")== -1 ? url.length : url.indexOf("#"));
	var raw = "jsapi_ticket=" + jsapi_ticket + "&noncestr=" + noncestr + "&timestamp=" + timestamp + "&url=" + url;
	var signature = $.sha1(raw);
	wx.config({
	    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
	    appId: 'wx9e2ae443958122f4', // 必填，公众号的唯一标识
	    timestamp: timestamp, // 必填，生成签名的时间戳
	    nonceStr: noncestr, // 必填，生成签名的随机串
	    signature: signature,// 必填，签名，见附录1
	    jsApiList: ['checkJsApi','scanQRCode','chooseImage','uploadImage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	});


	wx.ready(function(){
	    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
		wx.checkJsApi({
		    jsApiList: ['scanQRCode'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
		    success: function(res) {
		        // 以键值对的形式返回，可用的api值true，不可用为false
		        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
		    	console.log(res);
		    },
			fail: function (res) {  
	              console.log(res);
	        }  
		});
		
	});

	wx.error(function(res){
	    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
	});

});
