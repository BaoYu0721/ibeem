
function UploadPhotoMethod(obj){
	var getFile=$(obj).val();
  	var fileName=getFileName(getFile)
	function getFileName(o){
	    var pos=o.lastIndexOf(".");
	    return o.substring(pos+1);
	}
	var te=/jpg|jpeg|png|JPG|PNG/g;
	if(te.test(fileName)==false){
		alertokMsg(getLangStr("image_error"),getLangStr("alert_ok"));
	}else{
		$(".portraitForm").ajaxSubmit(function(json) {
			console.log(json);
			if(json.code != 200) {
				alertokMsg(getLangStr("image_failed"),getLangStr("alert_ok"));
				return;
			}
			uploadImg=json.imageList[0].imageurl;
			$(".portraitStyle").css("display","none");
			$(".portraitForm img").css("display","block");
			$(".portraitForm img").attr("src",uploadImg);
		})
}};

$(function(){
	
	// 默认加载头像
	$.ajax({
		type:"post",
		dataType:"json",
		url:"/user/getPortrait",
		success:function(e){
			 if(e.code==200){
				 portrait = e.portrait;
				 $(".portraitForm img").attr("src",portrait);
			 }
		}
	});	
	
	$(".upload").change(function(){
		UploadPhotoMethod(".portrait");
	});

	$("#return-btn").click(function(){
		window.history.go(-1);
	});

	// 正则验证
	// var $reg_email = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
	var $reg_name = /^\w{2,20}$/;
	var $reg_password = /^\w{6,20}$/;
	
	$("#register-btn").click(function(){
		var userName=$("#username").val();
		var password=$("#password1").val();
		var confirmPassword=$("#confirmPassword").val();
		var company=$("#company").val();
		var email=$("#email").val();
		var telephone=$("#telephone").val();
		var position=$("#professor").val();
		var portrait=$(".portraitForm img").attr("src");
		var name=$("#name").val();

		if(userName==""){
			$(".username .warning").html(getLangStr("home_15"));
			return false;
		}else if(!$reg_name.test(userName)){
			$(".username .warning").html(getLangStr("login_inputusername_2"));
			return false;
		}else{
			$(".username .warning").html("");
		}
		
		if(password==""){
			$(".password .warning").html(getLangStr("home_18"));
			return false;
		}else if(!$reg_password.test(password)){
			$(".password .warning").html(getLangStr("login_inputpassword"));
			return false;
		}else{
			$(".password .warning").html("");
		}
		
//		if(!$reg_name.test(userName)){
//			$(".username .warning").html(getLangStr("login_inputusername_2"));
//			return false;
//		}else{
//			$(".username .warning").html("");
//		}

//		if(!$reg_password.test(password)){
//			$(".password .warning").html(getLangStr("login_inputpassword"));
//			return false;
//		}else{
//			$(".password .warning").html("");
//		}

		if(password!=confirmPassword){
			$(".confirmPassword .warning").html(getLangStr("home_9"));
		}else{
			$(".confirmPassword .warning").html("");
		}
		//如果头像为空，设置为默认头像		
/*		if(portrait==''){
			portrait = "../static/manage/img/userdefault.png";
		}*/	

		//姓名不能为空，否则项目成员显示不出姓名
		if(name==''){
			$(".name .warning").html(getLangStr("home_13"));
		}else{
			$(".name .warning").html("");
		}
/*
		if(portrait==''){
			$(".portraitForm .warning").html("头像不能为空！");
		}else{
			$(".portraitForm .warning").html("");
		}

		if(telephone==''){
			$(".telephone .warning").html("手机号不能为空!");
		}else if(mobilePhoneReg.test(telephone)==false){
			$(".telephone .warning").html("手机号格式不对!");
		}else{
			$(".telephone .warning").html("");
		}
		*/

		if(email==''){
			$(".email .warning").html(getLangStr("home_19"));
			return false;
		}else if(emailReg.test(email)==false){
			$(".email .warning").html(getLangStr("home_5"));
			return false;
		}else{
			$(".email .warning").html("");
		}
		/*if(email==''){
			$(".email .warning").html(getLangStr("home_4"));
			return false;
		}else if(emailReg.test(email)==false){
			$(".email .warning").html(getLangStr("home_5"));
			return false;
		}else{
			$(".email .warning").html("");
		}*/

		if(userName!=''&&password!=''&&password==confirmPassword&&name!=''&&email!=''){
			password=$.md5(password);
			addLoading($("body"));
			$.ajax({
				type:"post",
				dataType:"json",
				url:"/user/register",
				data:{
					userName:userName,
    				password:password,
    				email:email,
    				workplace:company,
    				position:position,
    				mobilePhone:telephone,
    				portrait:portrait,
    				name:name
				},
				success:function(data){
					removeLoading();

					if(data.code==200){
						alertokMsg2(getLangStr("home_14"),getLangStr("alert_ok"),"toLogin");
						setTimeout(function(){
							$("#username").val("");
							$("#password1").val("");
							$("#confirmPassword").val("");
							$("#company").val("");
							$("#email").val("");
							$("#telephone").val("");
							$("#professor").val("");
							// $(".portraitForm img").css("display","none");
							$(".portraitForm .portraitStyle").css("display","block");
							$("#name").val("");
						},300);
					}else{
						alertokMsg(data.messg,getLangStr("alert_ok"));
					}
				},
				error:function(){
					removeLoading();
				}
			});
		}
	});
	
	// 忘记密码
	$("#formForgetPassword").click(function(){
		var userName=$("#username").val();
		var email=$("#email").val();
		
//		if(userName==''){
//			$(".username .warning").html(getLangStr("home_15"));
//			return;
//		}else{
//			$(".username .warning").html("");
//		}
		
		if(userName==""){
			$(".username .warning").html(getLangStr("home_15"));
			return false;
		}else if(!$reg_name.test(userName)){
			$(".username .warning").html(getLangStr("login_inputusername_2"));
			return false;
		}else{
			$(".username .warning").html("");
		}
		
//		
//		if(email==''){
//			$(".email .warning").html(getLangStr("home_4"));
//			return;
//		}else if(emailReg.test(email)==false){
//			$(".email .warning").html(getLangStr("home_5"));
//			return;
//		}else{
//			$(".email .warning").html("");
//		}
		
		if(email==''){
			$(".email .warning").html(getLangStr("home_19"));
			return false;
		}else if(emailReg.test(email)==false){
			$(".email .warning").html(getLangStr("home_5"));
			return false;
		}else{
			$(".email .warning").html("");
		}
		
		if(userName!=''&&email!=''){

			addLoading($("body"));
			$.ajax({
				type:"post",
				dataType:"json",
				url:"/user/fingPassword",
				data:{
					username:userName,
    				email:email
				},
				success:function(data){
					removeLoading();

					if(data.code==200){
						alertokMsg2(getLangStr("home_16"),getLangStr("alert_ok"),"toLogin");
					}else{
						alertokMsg(getLangStr("home_17"),getLangStr("alert_ok"));
					}
				},
				error:function(){
					removeLoading();
				}
			});
		}
		
	});
	
	
});

function toLogin(){
	window.location.href="login";
}