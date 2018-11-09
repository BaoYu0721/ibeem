//保存项目信息
var teamList=[];
//请求项目数据方法
function getData(){
	 var url = "/admin/getProjectListByAdmin";
	 var json = {};
	 function func(data){
		 teamList = data.list;
		 //清除当前页面上的数据
		 $(".team-item").not(".team-item-add").each(function(){$(this).remove()});
		 for(var i=0;i<teamList.length;i++){
			 var name = teamList[i].name;
			 var image = teamList[i].image;
			 var id = teamList[i].id;
			 var decribe = teamList[i].decribe;
			if(decribe.length>23){
				decribe = decribe.substring(0, 22);
				decribe = decribe +"..."
			}
			 getComponent("/static/manage/components/teamList_item.html",
					 function(resultHTML){
					   $(".showTeam").prepend(resultHTML);
				 	 },
					 {"-id-":id,"-imgSrc-":image,"-teamName-":name.length>10?name.substring(0,18)+"...":name,"-teamIntro-":decribe,"-url-":"/redirect?url=administrator/teamContent.jsp"}
			 )
		 }
		 //共计
		 $(".ui.header.title").html(getLangStr("project_total")+" "+teamList.length+" "+getLangStr("project"));
	 }
	 sentJson(url,json,func);
}
//查询并显示项目
function searchTeam(searchContent){
	//删掉输入内容开头的空格
	while(searchContent.substring(0,1)==" "){
		searchContent = searchContent.substring(1);
	} 
	var searchResult =[];
	//清除当前页面上的数据
	 $(".team-item").not(".team-item-add").each(function(){$(this).remove()});
	for(var i=0;i<teamList.length;i++){
		var name = teamList[i].name;
		var image = teamList[i].image;
		var id = teamList[i].id;
		var decribe = teamList[i].decribe;
		//项目名称以及项目简介匹配
		if(name.indexOf(searchContent) >= 0 || decribe.indexOf(searchContent) >= 0 || $.trim(searchContent)=="")
		{
			searchResult.push(teamList[i]);
			getComponent("/static/manage/components/teamList_item.html",
					 function(resultHTML){
					   $(".showTeam").prepend(resultHTML);
				 	 },
					 {"-id-":id,"-imgSrc-":image,"-teamName-":name,"-teamIntro-":decribe}
			 )
		}
	}
	//搜索结果
	if($.trim(searchContent)==""){
		//共计
		 $(".ui.header.title").html(getLangStr("project_total")+" "+teamList.length+" "+getLangStr("project"));
	}else{
		//搜索结果
		$(".ui.header.title").html(getLangStr("project_search_results")+" "+searchResult.length+" "+getLangStr("project_item"));
	}
	 
}
//添加查询框回车事件
$('#searchTeam').keyup(function(event){  
    
        searchTeam($('#searchTeam').val());

});
 //添加点击事件，进入添加项目页面
 $(".showaddteam").each(function(){
	 $(this).on('click',function(){
		 //先清空添加页的数据
			 $(".addteam input").val("");
			 $(".addteam textarea").val("");
			 $(".portraitStyle").attr("src","");
			 $(".addlogo").children("span").css("display","block");
			 $(".addlogo").children(".addicon").css("display","block");
			 $(".error h4").html("");
			 $('.basic.test.modal.addteam-modal')
			  .modal('setting', 'closable', false)
			  .modal('show');
			//显示默认头像	
			var url = "/project/getImage";
			var json = {};
			function successFunc(data){
				var imgUrl = data.image;
				$(".portraitStyle").attr("src",imgUrl);
			}
			sentJson(url,json,successFunc);
	 });
 })
// //添加点击事件，进入项目列表页面
// $(".redirecttolist").each(function(){
//	 $(this).on('click',function(){
//		 $(".teamList").css("display","block");
//		 $(".addteam").css("display","none");
//		 //每次返回项目列表页时，重新请求		 
//		 getData();
//	 });
// })

//页面刷新默认请求数据
getData();
//item宽度按屏幕宽度修改
 $(window).resize(initItemWidth);
 function initItemWidth(){
	 var windowWidth = $(window).width();
	 if(windowWidth <1420){
	 	$(".showTeam .team-item").css("width","27.6rem");
	 	$(".showTeam .content-panel").css("width","10rem");
	 	$(".showTeam .team-item").css("padding","1.928rem 2.5rem");
	 } else if(windowWidth <1450){
	 	$(".showTeam .team-item").css("width","31rem");
	 	$(".showTeam .content-panel").css("width","12rem");
	 	$(".showTeam .team-item").css("padding","1.928rem 2.5rem");
	 }else if(windowWidth <1620){
	 	$(".showTeam .team-item").css("width","26.6rem");
	 	$(".showTeam .content-panel").css("width","10rem");
	 	$(".showTeam .team-item").css("padding","1.928rem 1.5rem");
	 }else if(windowWidth <1940){
		$(".showTeam .team-item").css("width","25.6rem");
	 	$(".showTeam .content-panel").css("width","10rem");
	 	$(".showTeam .team-item").css("padding","1.928rem 1rem");
	 }else{
		$(".showTeam .team-item").css("width","27.6rem");
	 	$(".showTeam .content-panel").css("width","10rem");
	 	$(".showTeam .team-item").css("padding","1.928rem 2.5rem");
	 }
 }
//添加项目
$("#submit").click(function(){
	//校验
	var teamName = $(".ui.form .name input").val();
	if($.trim(teamName)==""){
		$(".error h4").html(getLangStr("add_priject_messg1"));
		return false;
	}else if($.trim(teamName).length>20){
		$(".error h4").html(getLangStr("project_survey_nametoolong"));
	}
	var teamIntro = $(".ui.form .intro textarea").val();
	if($.trim(teamIntro)==""){
		$(".error h4").html(getLangStr("add_priject_messg2"));
		return false;
	}
	var teamImg = $(".portraitStyle").attr("src");
	if($.trim(teamImg)==""){
		$(".error h4").html(getLangStr("add_priject_messg3"));
		return false;
	}
	//发送
	addLoading($('body'));
	var url = "/project/addProject";
	var json = {"projectName":teamName,"describe":teamIntro,"image":teamImg};
	 
	function successFunc(data){
		window.location.href="/redirect?url=administrator/teamList.jsp";
		$('.basic.test.modal.addteam-modal').modal('hide');
	}
	function errorFunc(data){
		var errormsg = data.messg;
		$(".error h4").html(errormsg);
	}
	sentJson(url,json,successFunc,errorFunc);
});
//添加项目时，项目介绍字数限制
var maxstrlen = 60;  
$("#restNum").html(maxstrlen);
$("#teamintro_textarea").keyup(function(){
	len = maxstrlen;  
    var str = $(this).val();  
    myLen = str.length;  

    if (myLen > len) {  
    	$(this).val(str.substring(0, maxstrlen));  
    }  
    else {  
    	$("#restNum").html((len-myLen));  
    }  
});

