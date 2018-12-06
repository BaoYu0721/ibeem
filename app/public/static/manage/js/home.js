$(function(){
       	 /*上传头像  */
       	 var uploadImg="";
       	 $(".portraitForm").change(function(){
       		//$("#formntwo").submit();
       		 UploadPhotoMethod(".eportrait");
       	 });
   		
           $(".main .ui.inverted.icon.menu .item").click(function(){
               $(this).addClass("on").siblings().removeClass("on");
           });
         
           /*获取个人信息  */
           $.ajax({
           	type:"post",
           	datatype:"json",
           	url:"/user/user_info",
           	data:{},
           	success:function(data){
           		if(data.code==200){
           			//alert("获取成功");
           			$(".portrait").css("opacity","1");
           			if(data.user.portrait==""){
           				$(".portrait").attr("src","/public/static/manage/img/userdefault.png");
           				$(".portraitStyle").attr("src","/public/static/manage/img/userdefault.png");
           			}else {
           				$(".portrait").attr("src",data.user.portrait);
           				$(".portraitStyle").attr("src",data.user.portrait);
           			}
           			
           			$(".username").html(data.user.userName);
           			$(".name").html(data.user.name);
           			$(".unit").html(data.user.workplace);
           			$(".position").html(data.user.position);
           			$(".email").html(data.user.email);
           			$(".phonenum").html(data.user.mobilePhone);
           			$(".wechat").html(data.user.wechat);
           			/*二维码  */
   					$(".ecode").attr("src",data.user.qrCode);

           			$(".eusername").val(data.user.userName);
           			$(".ename").val(data.user.name);
           			$(".eunit").val(data.user.workplace);
           			$(".eposition").val(data.user.position);
           			$(".e_email").val(data.user.email);
           			$(".ephonenum").val(data.user.mobilePhone);
           			
           			$(".password_reset").attr("id",data.user.password);

           			$("#loginUserName").text(data.user.name);
           			localStorage.setItem("LocalName",data.user.name);
           		}
           	},
           	error:function(){
           		//alert("请求失败,请稍后重试");
           	}
           });
           
           /*修改用户信息*/
           $("#submitPersonalInfo").click(function(){
        	console.log(new Date().toLocaleString( ));
           	var name=$(".ename").val();
       		console.log(name);
       		var workplace=$(".eunit").val();
       		var position=$(".eposition").val();
       		var email=$(".e_email").val();
       		var mobilePhone=$(".ephonenum").val();
			   var uploadImg=$(".portraitStyle").attr("src");
       		if(workplace==""){
       			alertokMsg(getLangStr("home_2"),getLangStr("alert_ok"));
       		}else if(position==""){
       			alertokMsg(getLangStr("home_3"),getLangStr("alert_ok"));
       		}
       		else if(email==""){
       			alertokMsg(getLangStr("home_4"),getLangStr("alert_ok"));
       		}
       		else if(emailReg.test(email)==false){
       			alertokMsg(getLangStr("home_5"),getLangStr("alert_ok"));
       		}else if(mobilePhone==""){
       			alertokMsg(getLangStr("home_6"),getLangStr("alert_ok"));
       		}else if(mobilePhoneReg.test(mobilePhone)==false){
       		    alertokMsg(getLangStr("home_7"),getLangStr("alert_ok"));
       		}else {
				   console.log(uploadImg);
       			$.ajax({
           			type:"post",
           			dataType:"json",
           			url:"/user/change_info",
           			data:{
           				name:name,
           				workplace:workplace,
           				position:position,
           				email:email,
           				mobilePhone:mobilePhone,
           				portrait:uploadImg
           			},
           			success:function(data){
           				console.log(new Date().toLocaleString( ));
           				console.log(data);
           				if(data.code==200){
           					$(".submitBtn").css("display","none");
                   			$(".staticValue").css("display","block");
                           	$(".dynamicValue").css("display","none");
           					//$(".edit").html("编辑");
           					if(uploadImg==""){
           						$(".portrait").attr("src","/public/static/manage/img/userdefault.png");
           					}else{
           						$(".portrait").attr("src",uploadImg);
           					}
           					
                   			$(".name").html(name);
                   			$(".unit").html(workplace);
                   			$(".position").html(position);
                   			$(".email").html(email);
                   			$(".phonenum").html(mobilePhone);
                   			
                   			/*二维码  */
           					$(".ecode").attr("src","/public/static/common/images/ecode.png");
           				}
           			},
           			error:function(){}
           		});
       		}
           });
           
         //上传图片方法
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
	           			$(".portraitStyle").attr("src","/public/file/image/" + uploadImg);
	           		})
	           }
           	};
           	
           	// 返回主页
           	$("#editBack").click(function(){
           		$(".myform_01,.edit-pass,.edit").show();
				$("#editBack,.edit-back,.myform_02,#submitPassChange").hide();
           	});
           	
           	//修改密码
           	$("#changePassword").click(function(){
           		$(".myform_01,.edit-pass,.edit,#submitPersonalInfo").hide();
           		$(".edit-back,.myform_02,#submitPassChange").show();
           		$(".fl.dynamicValue").css("display","block");
           	});
           	
           	$("#submitPassChange").click(function(){
         
               		var password_r= $(".password_reset").val();
               		var password_o= $(".password_reset").attr("id");
               		password_r=$.md5(password_r);
               		
               		var password_1=$(".password_1").val();
               		var password_2=$(".password_2").val();
               		
               		var regg = /^[A-Za-z0-9]{6,}$/; // 校验6位以上数字和字母
               		
               		if(password_r==""){
               			alertokMsg(getLangStr("home_8"),getLangStr("alert_ok"));
               		}else if(password_1!=password_2){
               			alertokMsg(getLangStr("home_9"),getLangStr("alert_ok"));
               		}else if(password_o!=password_r){
               			alertokMsg(getLangStr("home_10"),getLangStr("alert_ok"));
               			$(".password_reset").val("");
               			$(".password_reset").attr("type","text");
               		}else if(!regg.test(password_1)){
               			// $("#pass_error_message").text("输入错误");
               			alertokMsg(getLangStr("home_11"),getLangStr("alert_ok"));
               		}else {
               			
               			password_1=$.md5(password_1);
	
               			$.ajax({
                   			type:"post",
                   			dataType:"json",
                   			url:"/user/changhe_password",
                   			data:{
                   				password:password_1
                   			},
                   			success:function(data){                				
                   				if(data.code==200){
                   					alertokMsg(getLangStr("home_12"),getLangStr("alert_ok"));
                   					setTimeout(function(){
                   						window.location.reload();
                   					},2000);
                   					
                   				}
                   			},
                   			error:function(){}
                   		});
               		}
           	
           	});
           	
           	// 文本域聚焦后变成密码域，防止密码自动填充
           	$(".myform_02 input").focus(function(){
           		$(this).attr("type","password");
           	});

	 		  // 判断中英文
	 	  	 var $this_language = localStorage.getItem("language");
	 	  	 console.log($this_language);
	 	  	 if($this_language=="en"){
	 	  		 $(".contentbox ul").css({
	 	  			  
	 	  		 });
	 	  	 } 
           	
       });