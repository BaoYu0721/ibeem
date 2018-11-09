/**
 * Created by xiaohe on 16/5/17.
 */
var currentteamID = 0;
function loadMemberData(){
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/user/listMember',
        data: {teamID:currentteamID},
        success: function (data) {

            if (data.status == 0) {
//        console.log(data);
                $("#grouplist").html('');
                for (id in data.teams){

                    var team = data.teams[id];
                    var priviledge = "组员";
                    if(team.priviledge == 1){
                        priviledge = "管理员";
                    }
                    $("#grouplist").append("<tr id='team_"+team.user_id+"'><td>"+team.username+"</td><td>"+team.name+"</td><td>"+team.position+"</td><td>"+
                        team.email+"</td><td>"+priviledge+"</td><td><button class='btn btn-primary' style='margin-right:10px' onclick='editMember("+team.user_id+")'>编辑</button><button class='btn btn-link' style='margin-right:10px' onclick='deleteMember("+team.user_id+")'>删除</button></td></tr>");
                    $("#team_"+team.user_id).data("user_id",team.user_id);
                    $("#team_"+team.user_id).data("username",team.username);
                    $("#team_"+team.user_id).data("name",team.name);
                    $("#team_"+team.user_id).data("position",team.position);
                    $("#team_"+team.user_id).data("email",team.email);
                    $("#team_"+team.user_id).data("priviledge",team.priviledge);

                }
            }else{  //失败
                console.log("null data");
            }
        }});
}
function addMember(){
    var username = $("#username").val();
    var password = $.md5($("#password").val());
    var name = $("#name").val();
    var position = $("#position").val();
    var email = $("#email").val();
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/user/addMember',
        data: {
            teamID:currentteamID,
            username:username,
            password:password,
            name:name,
            position:position,
            email:email,
            workplace:"清华大学"
        },
        success: function (data) {
            if (data.status == 0) {
                console.log(data);
                $('#addNewMember').modal('hide');
                loadMemberData();
            }else{  //失败
                console.log(data);
            }
        }});

}

function editMember(id){
    $("#newuserid").val($("#team_"+id).data("user_id"));
    $("#newusername").val($("#team_"+id).data("username"));
    $("#newname").val($("#team_"+id).data("name"));
    $("#newposition").val($("#team_"+id).data("position"));
    $("#newemail").val($("#team_"+id).data("email"));
    console.log($("#team_"+id).data("priviledge"));
    if($("#team_"+id).data("priviledge").toString() == "1"){
        $("#priviledge").prop("checked",true);
    }
    $("#editMember").modal('show');
}
function editMemberForm(){
    var newuserid =  $("#newuserid").val();
    var newusername =  $("#newusername").val();
    var newname = $("#newname").val();
    var newposition = $("#newposition").val();
    var newemail = $("#newemail").val();
    var priviledge = 2;
    console.log($("#priviledge").prop("checked"));
    if($("#priviledge").prop("checked")){
        var priviledge = 1;
    }
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/user/editMember',
        data: {userID:newuserid,
            username:newusername,
            name:newname,
            position:newposition,
            email:newemail,
            priviledge:priviledge},
        success: function (data) {
            if (data.status == 0) {
                console.log(data);
                $('#editMember').modal('hide');
                loadMemberData();
            }else{  //失败
                console.log("更新失败");
            }
        }});
}

function deleteMember(id){
    var r = confirm("确认删除用户"+id+"吗?");
    if (r == true) {
        $.ajax({
            type: "post",
            dataType: "json",
            url: '/user/deleteMember',
            data: {userID:id},
            success: function (data) {
                if (data.status == 0) {
                    console.log(data);
                    loadMemberData();
                }else{  //失败
                    console.log(data);
                }
            }});
    }

}
function setAsManager(id){
    var r = confirm("确认设置用户"+id+"为管理员吗?");
    if (r == true) {
        $.ajax({
            type: "post",
            dataType: "json",
            url: '/user/setAsManager',
            data: {userID:id},
            success: function (data) {
                if (data.status == 0) {
                    console.log(data);
                    loadMemberData();
                }else{  //失败
                    console.log(data);
                }
            }});
    }
}

$(function(){
    var url = window.location.href;
    params = url.split('/');
    currentteamID = params[5];

    loadMemberData();
});




