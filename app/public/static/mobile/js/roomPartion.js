function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

    	$(function(){
    		$("#wechatName").html(localStorage.getItem("wechatname"));
    		var urlStateParam = getUrlParam("state");
    		//state 为BindingWechat，本页面的打开时先检测STATE参数，然后获取code，传递到后台获取用户信息
    		if(urlStateParam == "BindingWechat"){
    			console.log(code);
    			var code = getUrlParam("code");
    			//获取用户信息
    			$.ajax({
    		        type: "post",
    		        dataType: "json",
    		        url: '/weixin/getUser',
    		        data:{
    		        	code:code
    		        	// userID:
    		        },
    		        success: function (data) {
    		        	console.log(data);
    		        	//alert(JSON.stringify(data));
    		        	//更新用户绑定微信账户的信息，并且更新用户在使用的设备的微信绑定信息；
    		        	var openid = data.openid;
    		        	var wechatName = data.nickname;
    		        	localStorage.setItem("wechatname",wechatName);
    		        	
    		        	$("#wechatName").html(localStorage.getItem("wechatname"));
    		        	localStorage.setItem("openid",openid);
    		        	//localStorage.setItem("wechatname",wechatName);
    		        },
    		        error:function (XMLHttpRequest, textStatus, errorThrown) 
    		        { 
    		        	alert("获取微信用户信息失败！");
    		       	} 
    		    });
    		}
			
    		$("#areaList li").click(function(){
    			var area=$(this).attr("data-name");
    			localStorage.setItem("area",area);
    		});;
    		
    		/*  */
    		var areaList=$("#areaList li");
    		for(var i=0;i<areaList.length;i++){
    			if(i%2==1){
    				$("#areaList li").eq(i).css("marginRight","0");
    			}
    		}
    		
    		$("#areaList li").click(function(){
    			window.location.href="../views/mobile/complain.jsp"
    		});
    	});
    	
    	