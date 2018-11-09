/**
 * 
 */

function editMemberForm(){
    var newname = $("#newname").val();
    var newworkplace = $("#newworkplace").val();
    var newposition = $("#newposition").val();
    var newemail = $("#newemail").val();
    var userId = $.cookie('user_id')*1;
    

    $.ajax({
        type: "post",
        dataType: "json",
        url: '/user/changeUserInfo',
        data: {userID:userId,
            name:newname,
            workplace:newworkplace,
            position:newposition,
            email:newemail},
        success: function (data) {
            if (data.status == 0) {
                $('#editMember').modal('hide');
                updateInfo();
            }else{  //失败
                console.log("更新失败");
            }
        }});
}

function editMemberPasswordForm(){
	
	var newp1 = $("#newpassword1").val();
	var newp2 = $("#newpassword2").val();
	if(newp1 != newp2){
		$("#login-msg").html("输入的两个新密码不一致，请重新输入！")
		$("#login-msg").removeClass("hidden");
		return;
	}
	
	var oldp1 = $.cookie('password');
	var oldp2 = $("#oldpassword").val();
	if(oldp1 != $.md5(oldp2)){
		$("#login-msg").html("输入的旧密码不正确，请重新输入！")
		$("#login-msg").removeClass("hidden");
	}
	
	var userId = $.cookie('user_id')*1;
	var newp = $.md5(newp1);
	$.ajax({
        type: "post",
        dataType: "json",
        url: '/user/changheUserPassword',
        data: {userID:userId,
            password:newp
            },
        success: function (data) {
            if (data.status == 0) {
                $('#editMemberPassword').modal('hide');
                updateInfo();
            }else{  //失败
                console.log("更新失败");
            }
        }});
}

function updateInfo(){
	$("#name").html($.cookie('name'));
	$("#user-name").html($.cookie('name'));
	$("#workplace").html($.cookie('workplace'));
	$("#position").html($.cookie('position'));
	$("#email").html($.cookie('email'));
	
	$("#newname").val($.cookie('name'));
	$("#newworkplace").val($.cookie('workplace'));
	$("#newposition").val($.cookie('position'));
	$("#newemail").val($.cookie('email'));
	
	$("#username").val($.cookie('username'));
}

$(function(){
	//加载信息
	updateInfo();
	
	
	$("#editMemberPassword input").change(function(){
		$("#login-msg").addClass("hidden");
	});
});