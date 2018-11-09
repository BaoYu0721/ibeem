/**
 * 有关用户注册、登录、登出
 */

var prePage=null;




function bindLoginHandler(){
	$("#login-submit-btn").click(function(){
		$("#login-msg").addClass("hidden");
		var username = $("#username").val();
		var password;
		if(rememberUserInfo){
			password = $("#password").val();
		}else{
			password = $.md5($("#password").val());
		}
		
		$.ajax({
	        type: "post",
	        dataType: "json",
	        url: '/user/login',
	        data: {username:username,
	        	   password:password},
	        success: function (data) {
	            if (data.status == 0) {
	            	$("#login-btn").addClass("hidden");
	            	$("#user-name").html(data.user.name);
	            	$("#user-profile").removeClass("hidden");
	            	$('#loginModal').modal('hide');
	            	console.log(prePage);
	            	if(prePage == null){
	            		window.location.href = "/page/homeManage";  //默认跳转到这一页
	            	}else{
	            		window.location.href = prePage;
	            	}
	            }else{  //失败
	            	$("#login-msg").html(data.messg);
	            	$("#login-msg").removeClass("hidden");
	            }
	        },
	        error:function (XMLHttpRequest, textStatus, errorThrown) 
	        { 
	          alert(textStatus);
	        } 
	    });
	});
}

function bindLogoutHandler(){
	$("#logout-submit-btn").click(function(){
		$.ajax({
	        type: "post",
	        dataType: "json",
	        url: '/user/logout',
	        success: function (data) {
            	window.location.href = "/page/index";
	        },
	        error:function (XMLHttpRequest, textStatus, errorThrown) 
	        { 
	          alert(textStatus);
	          
	        } 
	    });
	});
}

/**
 * 获取当前URL参数值
 * @param name	参数名称
 * @return	参数值
 */
function getUrlParam(name) {
	   var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
	   var r = window.location.search.substr(1).match(reg);
	   if (r!=null) 
		   return unescape(r[2]); 
	   return null;
	   
}

function updateUserInfo(){
	
	var url = window.location.href;
	if(url.indexOf("index") >= 0){ //首页
		if($.cookie('username') != null){
			$("#username").val($.cookie('username'));
			if($.cookie('password') != null){
				$("#password").val($.cookie('password'));
				rememberUserInfo = true;
			}
		}
		
		/*
		if($.cookie('status') == "logged"){ //已经登录
			$("#login-btn").addClass("hidden");
        	$("#user-name").html(unescape($.cookie('name')));
        	$("#user-profile").removeClass("hidden");
		}else{
			//如果存在prePage后缀，拿到后缀，并且弹出登陆框
			prePage = getUrlParam("prePage");
			
			if(prePage != null){
				prePage = unescape(prePage);
				$('#loginModal').modal('show');
			}
			
			$("#user-profile").addClass("hidden");
        	$("#login-btn").removeClass("hidden");
		}*/
	}else{

			$("#login-btn").addClass("hidden");
			$("#user-name").html(unescape($.cookie('name')));
			$("#user-profile").removeClass("hidden");

	}
}

function bindPasswordChange(){
	$("#password").change(function(){
		rememberUserInfo = false;
	});
}

var rememberUserInfo = false;

$(function(){
	bindLoginHandler();
	bindLogoutHandler();
	bindPasswordChange();
	updateUserInfo();
}); 





