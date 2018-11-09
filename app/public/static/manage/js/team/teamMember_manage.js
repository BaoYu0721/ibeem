/*存放缓存中的，项目id*/
var id = $.cookie("teamid");
/*存放缓存中的，项目name*/
var teamname = $.cookie("teamname");
$(".teamTitleTit").html(teamname.length>10?teamname.substring(0,9)+"...":teamname);
//保存项目成员信息
var memberList=[];
function getData(){
	var url="/admin/getUserByProject";
	var json={"projectID":id};
	var successFunc = function(data){
		memberList = data.list;
		 //清除当前页面上的数据
		 $(".member-item").each(function(){$(this).remove()});
		 for(var i=0;i<memberList.length;i++){
			 var name = memberList[i].name;
			 name = name.length>14?name.substring(0,14)+"..":name;
			 var portrait = memberList[i].portrait;
			 var id = memberList[i].id;
			 var role = memberList[i].role;
			 getComponent("/static/manage/components/memberList_item.html",
					 function(resultHTML){
					   $(".memberList .showMember").append(resultHTML);
					   if(role==1){
						   addManagerClass($(".memberList .showMember .member-item:last"));
					   }else if(role==0){
						   addCreaterClass($(".memberList .showMember .member-item:last"));
					   }
				 	 },
					 {"-id-":id,"-name-":name,"-role-":role,"-portrait-":portrait}
			 )
		 }
	}
	sentJson(url,json,successFunc);
}
getData();
//查询并显示项目成员
function searchTeamMember(searchContent){
	//删掉输入内容开头的空格
	while(searchContent.substring(0,1)==" "){
		searchContent = searchContent.substring(1);
	} 
	var searchResult =[];
	//清除当前页面上的数据
	 $(".member-item").each(function(){$(this).remove()});
	for(var i=0;i<memberList.length;i++){
		var name = memberList[i].name;
		var portrait = memberList[i].portrait;
		var id = memberList[i].id;
		//项目名称以及项目简介匹配
		if(name.indexOf(searchContent) >= 0 || $.trim(searchContent)=="")
		{
			searchResult.push(memberList[i]);
			getComponent("/static/manage/components/memberList_item.html",
					 function(resultHTML){
					   $(".showMember").prepend(resultHTML);
				 	 },
					 {"-id-":id,"-portrait-":portrait,"-name-":name}
			 )
		}
	}
	//搜索结果
	if($.trim(searchContent)==""){
		//搜索结果
		$(".ui.header.title").html("");
	}else{
		//搜索结果
		$(".ui.header.title").html(getLangStr("project_search_results")+searchResult.length+getLangStr("project_item"));
	}
	 
}
//查询并显示成员
function searchUser(searchContent){
	//删掉输入内容开头的空格
	while(searchContent.substring(0,1)==" "){
		searchContent = searchContent.substring(1);
	} 
	var searchResult =[];
	//清除当前页面上的数据
	 $(".addMember .member-item").each(function(){$(this).remove()});
	 addLoading($('body'));
	 var url="/admin/searchUser";
	 var json={"key":searchContent,"projectID":id};
	 var successFunc = function(data){
		 memberList = data.arrayList;
		 if(memberList.length==0){
			 $(".addMember .showMember").prepend("<span class='member-item searchmember-empty'>"+getLangStr("project_search_empty")+"</span>");
		 }
		 for(var i=0;i<memberList.length;i++){
			 var name = memberList[i].name;
			 var portrait = memberList[i].portrait;
			 var id = memberList[i].id;
			 getComponent("/static/manage/components/memberList_item.html",
					 function(resultHTML){
					   $(".addMember .showMember").prepend(resultHTML);
				 	 },
					 {"-id-":id,"-name-":name,"-portrait-":portrait}
			 )
		 }
	 }
	 sentJson(url,json,successFunc);
}
//添加列表页查询框回车事件
$('#searchMember').keyup(function(event){  
        searchTeamMember($('#searchMember').val());
});
//添加新增成员页查询框回车事件
$('#searchAddMember').bind('keypress',function(event){  
    if(event.keyCode == "13")      
    {  
        searchUser($('#searchAddMember').val());
    }  
});
//添加点击变颜色事件
function clickChangeColor(ele){
	if($(ele).hasClass("click")){
		$(ele).removeClass("click");
	}else{
		$(ele).addClass("click");
	}
}
//点击菜单【添加成员】事件
$("#addMember-button").each(function(){
	 $(this).on('click',function(){
		 $("#searchAddMember").val("");
		 $(".addMember .member-item").each(function(){$(this).remove()});
		 showAddDlg();
	 });
})
function showAddDlg(){
	 $('.basic.test.modal.addmember-modal')
	  .modal('setting', 'closable', false)
	  .modal('show');
}
//点击删除成员按钮事件
$("#deleteMember").on("click",function(){
	alertMsg(getLangStr("teamMember_is_delete"),getLangStr("cancel"),getLangStr("delete"),"okFunc");
})
function okFunc(){//调用删除项目接口
	var url = "/admin/deleteUser";
	//获取选中成员id
	$(".memberList .member-item a.click").each(function(){
		var memberId = $(this).data("id");
		var $item = $(this).parent();
		var json={"projectID":id,"userID":memberId};
		var successFunc = function(data,linkNum){
			$item.remove();
			alertokMsg(getLangStr("deviceList_del_ok"),getLangStr("determine"));
		}
		var errorFunc = function(data){
			alertokMsg(data.messg,getLangStr("determine"));
		}
		sentJson(url,json,successFunc,errorFunc);
	});
}
//点击设为管理员按钮事件
$("#addrole-button").on("click",function(){
	alertMsg(getLangStr("teamMember_is_administrator"),getLangStr("cancel"),getLangStr("determine"),"addroleFunc");
})
function addroleFunc(){//调用设为管理员接口
	var url = "/admin/addManager";
	//获取选中成员id
	$(".memberList .member-item a.click").each(function(){
		var memberId = $(this).data("id");
		var memberRole = $(this).data("role");
		var memberName = $(this).find(".name").html();
		var $item = $(this).parent();
		var $this = $(this);
		if(memberRole==0){
			alertokMsg(getLangStr("teamMember_member")+memberName+getLangStr("teamMember_messg1"),getLangStr("determine"));
			return false;
		}else if(memberRole==1){
			alertokMsg(getLangStr("teamMember_member")+memberName+getLangStr("teamMember_messg2"),getLangStr("determine"));
			return false;
		}
		var json={"projectID":id,"userID":memberId};
		var successFunc = function(data,linkNum){
			$(".memberList .member-item a").removeClass("click");
			$this.data("role","1");
			$this.removeClass("click");
			addManagerClass($item);
		}
		var errorFunc = function(data){
			alertokMsg(data.messg,getLangStr("determine"));
		}
		sentJson(url,json,successFunc,errorFunc);
	});
}
//点击撤销管理员按钮事件
$("#deleterole-button").on("click",function(){
	alertMsg(getLangStr("teamMember_messg3"),getLangStr("cancel"),getLangStr("determine"),"deleteroleFunc");
})
function deleteroleFunc(){//调用撤销管理员接口
	var url = "/admin/relieveManager";
	//获取选中成员id
	$(".memberList .member-item a.click").each(function(){
		var memberId = $(this).data("id");
		var memberRole = $(this).data("role");
		var memberName = $(this).find(".name").html();
		var $item = $(this).parent();
		var $this = $(this);
		if(memberRole==0){
			alertokMsg(getLangStr("teamMember_member")+memberName+getLangStr("teamMember_messg4"),getLangStr("determine"));
			return false;
		}else if(memberRole==2){
			alertokMsg(getLangStr("teamMember_member")+memberName+getLangStr("teamMember_messg5"),getLangStr("determine"));
			return false;
		}
		var json={"projectID":id,"userID":memberId};
		var successFunc = function(data,linkNum){
			$(".memberList .member-item a").removeClass("click");
			$this.data("role","2");
			$this.removeClass("click");
			removeManagerClass($item);
		}
		var errorFunc = function(data){
			alertokMsg(data.messg,getLangStr("determine"));
		}
		sentJson(url,json,successFunc,errorFunc);
	});
}
//点击添加成员按钮事件
$(".button-add").on("click",function(){
	var url = "/admin/addUser";
	//获取选中成员id
	if($(".addMember .member-item a.click").length==0){
		alertokMsg(getLangStr("teamMember_messg6"),getLangStr("determine"),"showAddDlg()");
	}else{
		$(".addMember .member-item a.click").each(function(){
			var memberId = $(this).data("id");
			addLoading($('body'));
			var json={"projectID":id,"userID":memberId};
			var successFunc = function(data,linkNum){
				if(linkNum==0){
					window.location.href="/redirect?url=administrator/teamMember.jsp";
				}
			}
			sentJson(url,json,successFunc);
		});
	}
})
function addManagerClass($item){
	$item.find("a").append("<span class='member-role'><i class='red user icon'></i></span>");
}
function removeManagerClass($item){
	$item.find("a .member-role").remove();
}
function addCreaterClass($item){
	$item.find("a").append("<span class='member-role'><i class='green user icon'></i></span>");
}