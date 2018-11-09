/**
 * Created by xiaohe on 16/5/17.
 */

function loadTeamData(){
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/team/list',
        data: {},
        success: function (data) {

            if (data.status == 0) {
//        console.log(data);
                $("#grouplist").html('');
                if(data.priviledge ==0){
                	$("#addNewteamButton").show();
                }
                for (id in data.teams){
                    var team = data.teams[id];
                    //$("#addNewteamButton").hide();
                    if(data.priviledge ==0 ){
                        $("#grouplist").append("<tr id='team_"+team.team_id+"'><td>"+team.teamname+"</td><td>"+team.institution+"</td><td>"+
                            team.descripiton+"</td><td><button class='btn btn-primary' style='margin-right:10px' onclick='editTeam("+team.team_id+")'>编辑</button><button class='btn btn-link' style='margin-right:10px' onclick='deleteTeam("+team.team_id+")'>删除</button><a class='btn btn-link' href='./page/memberManage/"+team.team_id+"/'>进入>></a></td></tr>");
                    }else if(data.priviledge ==1 ){
                        $("#grouplist").append("<tr id='team_"+team.team_id+"'><td>"+team.teamname+"</td><td>"+team.institution+"</td><td>"+
                            team.descripiton+"</td><td><button class='btn btn-primary' style='margin-right:10px' onclick='editTeam("+team.team_id+")'>编辑</button><a class='btn btn-link' href='./page/memberManage/"+team.team_id+"/'>进入>></a></td></tr>");
                    }else{
                        $("#grouplist").append("<tr id='team_"+team.team_id+"'><td>"+team.teamname+"</td><td>"+team.institution+"</td><td>"+
                            team.descripiton+"</td><td><button class='btn btn-primary' style='margin-right:10px' onclick='editTeam("+team.team_id+")'>查看</button></td></tr>");
                    }


                    $("#team_"+team.team_id).data("team_id",team.team_id);
                    $("#team_"+team.team_id).data("teamname",team.teamname);
                    $("#team_"+team.team_id).data("institution",team.institution);
                    $("#team_"+team.team_id).data("descripiton",team.descripiton);

                }
            }else{  //失败
                console.log("null data");
            }
        }});
}
function addTeam(){
    var newteamName = $("#newteamName").val();
    var newteamInstitution = $("#newteamInstitution").val();
    var newteamDescripiton = $("#newteamDescripiton").val();
    console.log(newteamName,newteamInstitution,newteamDescripiton);
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/team/add',
        data: {newteamName:newteamName,
            newteamInstitution:newteamInstitution,
            newteamDescripiton:newteamDescripiton},
        success: function (data) {
            if (data.status == 0) {
                console.log(data);
                $('#addNewTeam').modal('hide');
                loadTeamData();
            }else{  //失败
                console.log(data);
            }
        }});

}

function editTeam(id){
    console.log($("#team_"+id).data("teamname"));
    $("#teamID").val($("#team_"+id).data("team_id"));
    $("#teamName").val($("#team_"+id).data("teamname"));
    $("#teamInstitution").val($("#team_"+id).data("institution"));
    $("#teamDescripiton").val($("#team_"+id).data("descripiton"));
    $("#editTeam").modal('show');
}
function editTeamForm(){
    var teamID =  $("#teamID").val();
    var newteamName = $("#teamName").val();
    var newteamInstitution = $("#teamInstitution").val();
    var newteamDescripiton = $("#teamDescripiton").val();
    console.log(newteamName,newteamInstitution,newteamDescripiton);
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/team/edit',
        data: {teamID:teamID,
            newteamName:newteamName,
            newteamInstitution:newteamInstitution,
            newteamDescripiton:newteamDescripiton},
        success: function (data) {
            if (data.status == 0) {
                console.log(data);
                $('#editTeam').modal('hide');
                loadTeamData();
            }else{  //失败
                console.log("更新失败");
            }
        }});
}

function deleteTeam(id){
    var r = confirm("确认删除组"+id+"吗?");
    if (r == true) {
        $.ajax({
            type: "post",
            dataType: "json",
            url: '/team/delete',
            data: {teamID:id},
            success: function (data) {
                if (data.status == 0) {
                    console.log(data);
                    $('#editTeam').modal('hide');
                    loadTeamData();
                }else{  //失败
                    console.log(data);
                }
            }});
    }

}

$(function(){
    loadTeamData();
});




