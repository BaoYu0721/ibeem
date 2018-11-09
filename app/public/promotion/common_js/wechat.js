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
	// 获取jsapi_ticket
	var jsapi_ticket = "";
	$.ajax({
		type: "post",
        dataType: "json",
        async : false,
        url: '/weixin/getTicket',
        data: {},
 		success:function(data){
 			jsapi_ticket = data.ticket;
 			// alert("jsapi_ticket:"+jsapi_ticket);
		 	var noncestr = randomString(32);
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
			    jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});	
			
 			wx.ready(function(){



	          // 微信分享到朋友圈配置
        wx.onMenuShareTimeline({
                title: "IBEM实时建筑环境后评估系统", // 分享标题
                link: "http://www.ibeem.cn/promotion", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: "http://www.ibeem.cn/promotion/ibem_images/ibem_web/logo_300.png",// 分享图标
                success: function () { 
                  // 用户确认分享后执行的回调函数
              },
              cancel: function () { 
                  // 用户取消分享后执行的回调函数
              }
          });
            // 微信分享给朋友配置
            wx.onMenuShareAppMessage({
                title: "IBEM实时建筑环境后评估系统", // 分享标题
                desc: "通过在线移动应用、实时传感设备采集建筑环境的主客观数据采用后评估领域专业模型对“建筑-能耗-客观参数-主观评价”进行深入挖掘分析，提高后评估数据采集分析的效率", // 分享描述
                link: "http://www.ibeem.cn/promotion", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: "http://www.ibeem.cn/promotion/ibem_images/ibem_web/logo_300.png", // 分享图标
                type: '', // 分享类型,music、video或link，不填默认为link
              dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
              success: function () { 
                // 用户确认分享后执行的回调函数
            },
            cancel: function () { 
                // 用户取消分享后执行的回调函数
            }
         });



	      });
 		},
 		error:function(data){
 		}
 	});
});