/*存放缓存中的，项目id*/
var teamID = $.cookie("teamid");
/*存放缓存中的，项目name*/
var teamName = $.cookie("teamname");
/*存放缓存中的，建筑id*/
var buildingID = $.cookie("buildingid");
/*存放缓存中的，建筑name*/
var buildingName = $.cookie("buildingname");
$(".tit-buildingname").html(buildingName.length>8?buildingName.substring(0,8)+"..":buildingName);
$(".tit-teamname").html(teamName.length>8?teamName.substring(0,8)+"..":teamName);
//存放获取的项目下设备列表，用于查询
var deviceList = [];
//存放获取的项目下问卷列表，用于查询
var surveyList = [];

// 时间选择框验证
var reg_time = /^\d{4}-\d{2}-\d{2}$/;

/*时间格式转换  */
Date.prototype.Format = function(fmt) 
{
  var o = {
    "M+" : this.getMonth()+1,                 //月份 
    "d+" : this.getDate(),                    //日 
    "h+" : this.getHours(),                   //小时 
    "m+" : this.getMinutes(),                 //分 
    "s+" : this.getSeconds(),                 //秒 
    "q+" : Math.floor((this.getMonth()+3)/3), //季度 
    "S"  : this.getMilliseconds()             //毫秒 
  }; 
  if(/(y+)/.test(fmt)) 
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  for(var k in o) 
    if(new RegExp("("+ k +")").test(fmt)) 
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
  return fmt; 
}

//获取建筑下测点信息
$all_id = [];
function getPointData(){
	point_list_data = [];
	var url="/project/single/building/point";
	var json={"buildingID":buildingID};
	var successFunc = function(data){
		
		var points = data.list;
		var htmlStr = "";
		var startTime2 = "";
		var endTime2 = "";
		
		point_list_data = points; //将数组保存 跳转到详情使用
		
		if(points.length == 0){
			htmlStr = "<div class='ui segment' style='text-align:center'>"+ getLangStr("mobilehome_2") +"</div>";
		}
		
		$all_length = points.length;
		
		//alert($all_length);
		
		for(i in points){

			var point = points[i];
			var pointID = point.id;
			var pointName = point.name;
			var positionDesc = point.positionDesc;
			var surveyTitle = point.surveyTitle;
			var deviceName = point.deviceName;
			var deviceStatus = point.deviceStatus;
			var answerTime = point.answerTime;
			var startTime = point.startTime;
			var endTime = point.endTime;
			var imageAvatar = point.image;
					
			var deviceID = point.deviceID;//设备ID
			var surveyID = point.surveyID;//问卷ID

			$all_id.push(deviceID);
			
			if(deviceStatus==true){
				deviceStatus = getLangStr("deviceList_online");
			}else if(deviceStatus==false){
				deviceStatus = getLangStr("deviceList_notonline");
			}

			if(deviceID == -1){
				deviceName = "<span>"+getLangStr("buildingPoint_no_device")+"</span>";
				deviceStatus = "";
			}

			if(surveyID == -1){
				answerTime = "<span>"+getLangStr("buildingPoint_no_survey")+"</span>";
			}

			if(answerTime==""){
				answerTime = "<span style='border-bottom:1px solid #cccccc;'>"+getLangStr("buildingPoint_no_comment")+"</span>";
			}
			
			if(startTime==""){
				startTime2=getLangStr("buildingPoint_no_time");
			}else{
				startTime2=startTime;
			}
			
			if(endTime==""){
				endTime2=getLangStr("buildingPoint_no_time");
			}else{
				endTime2=endTime;
			}
			
			htmlStr += '<div class="ui card card_box" data-stime="'+ startTime +'" data-etime="'+ endTime +'" data-pointid="'+ pointID +'" data-deviceid="'+ deviceID +'" data-surveyid="'+ surveyID +'">'+
							'<div class="image content_tz">'+
							 		'<div class="uc_image_intro">'+
							 			'<h3><i class="home icon"></i><strong><span class="pointName">'+ pointName +'</span></strong></h3>'+
							 			'<h5>'+ positionDesc +'</h5>'+
							 		'</div>'+
							    	'<img src="'+ imageAvatar +'">'+
							 '</div>'+
							 '<div class="content content_tz">'+
							 		'<div class="uc_time">'+
										'<div class="uc_time_nav">'+getLangStr("begin")+'：<span>'+ startTime2 +'</span></div>'+
										'<div class="uc_time_nav">'+getLangStr("end")+'：<span>'+ endTime2 +'</span></div>'+
							    	'</div>'+
						   	 		'<div class="header">'+getLangStr("associated_device")+'：<span>'+ deviceName + deviceStatus +'</span></div>'+
							    	'<div class="description" id="d'+ deviceID +'">'+
							    		'<div class="description_list">'+
							    			'<h5>'+getLangStr("devicedata_tem")+'</h5>'+
							    			'<h3><div class="ui mini active inline loader"></div></h3>'+
							    		'</div>'+
							    		'<div class="description_list">'+
							    			'<h5>'+getLangStr("devicedata_hum")+'</h5>'+
							    			'<h3><div class="ui mini active inline loader"></div></h3>'+
							    		'</div>'+
							    		'<div class="description_list">'+
							    			'<h5>'+getLangStr("devicedata_sun")+'</h5>'+
							    			'<h3><div class="ui mini active inline loader"></div></h3>'+
							    		'</div>'+
							    		'<div class="description_list">'+
							    			'<h5>'+getLangStr("devicedata_co2")+'</h5>'+
							    			'<h3><div class="ui mini active inline loader"></div></h3>'+
							    		'</div>'+
							    		'<div class="description_list">'+
							    			'<h5>'+getLangStr("devicedata_pm25")+'</h5>'+
							    			'<h3><div class="ui mini active inline loader"></div></h3>'+
							    		'</div>'+
							    	'</div>'+
							  '</div>'+
							  '<div class="extra content">'+getLangStr("latest_evaluation")+'：<span class="content_tz">'+ answerTime +'</span><span class="extra_del" title="'+getLangStr("click_delete")+'" id="'+ pointID +'">'+getLangStr("delete")+'</span>'+
							  '</div>'+
						'</div>';
			
				
		}
		$("#datatable_body").append(htmlStr);
		
		 // 判断中英文
	  	 var $this_language = localStorage.getItem("language");
	  	 console.log($this_language);
	  	 if($this_language=="en"){
	  		$(".ui.card").css({
	  			"height":"39rem"
	  		});
	  		
	  		$(".ui.card .uc_time .uc_time_nav").css({
		  	    "width":"95%",
		  	    "margin-bottom":"10px"
	  		});
	  		$(".ui.card .uc_time .uc_time_nav span").css({
	  		    "float":"right",
		  	    "width":"80%"
	  		});
	  	 } 
		
	}
	sentJson(url,json,successFunc);
}

function showDataCard(deviceids){
	$.ajax({
		url:"/project/single/building/point_data",
		type:"POST",
		data:{"deviceId":deviceids},
		success:function(data){
			
			console.log(data);
			
			var hum = data.hum;
			var tem = data.tem;
			var co2 = data.co2;
			var pm25 = data.pm;
			var sun = data.lightIntensity;
			
			if(data.code == 200){

				$str_card = '<div class="description_list">'+
									'<h5>'+getLangStr("devicedata_tem")+'</h5>'+
									'<h3>'+ tem +'</h3>'+
							'</div>'+
							'<div class="description_list">'+
								'<h5>'+getLangStr("devicedata_hum")+'</h5>'+
								'<h3>'+ hum +'</h3>'+
							'</div>'+
							'<div class="description_list">'+
								'<h5>'+getLangStr("devicedata_sun")+'</h5>'+
								'<h3>'+ sun +'</h3>'+
							'</div>'+
							'<div class="description_list">'+
								'<h5>'+getLangStr("devicedata_co2")+'</h5>'+
								'<h3>'+ co2 +'</h3>'+
							'</div>'+
							'<div class="description_list">'+
								'<h5>'+getLangStr("devicedata_pm25")+'</h5>'+
								'<h3>'+ pm25 +'</h3>'+
							'</div>';
			}else{
				$str_card = '<div class="description_list">'+
				    			'<h5>'+getLangStr("devicedata_tem")+'</h5>'+
				    			'<h3>'+getLangStr("mobilehome_2")+'</h3>'+
				    		'</div>'+
				    		'<div class="description_list">'+
				    			'<h5>'+getLangStr("devicedata_hum")+'</h5>'+
				    			'<h3>'+getLangStr("mobilehome_2")+'</h3>'+
				    		'</div>'+
				    		'<div class="description_list">'+
				    			'<h5>'+getLangStr("devicedata_sun")+'</h5>'+
				    			'<h3>'+getLangStr("mobilehome_2")+'</h3>'+
				    		'</div>'+
				    		'<div class="description_list">'+
				    			'<h5>'+getLangStr("devicedata_co2")+'</h5>'+
				    			'<h3>'+getLangStr("mobilehome_2")+'</h3>'+
				    		'</div>'+
				    		'<div class="description_list">'+
				    			'<h5>'+getLangStr("devicedata_pm25")+'</h5>'+
				    			'<h3>'+getLangStr("mobilehome_2")+'</h3>'+
				    		'</div>';
				
			}
			$("#d" + deviceids).html($str_card);
		}
	});
	
}

$(document).ready(function() {
	
	//获取数据，放置到页面table中
	getPointData();

	var $setPointList=window.setInterval(showCard,3000);

	function showCard(){
		if($(".description").length == $all_id.length){

			for(var j=0;j<$all_id.length;j++){
				showDataCard($all_id[j])
				
				// $(".ui.card.card_box").eq(j).find(".description").html($all_str[j]);
				
				$setPointList=window.clearInterval($setPointList);
			}			
		}else{
			console.log("加载中...")
		}

	}
	
	$('.form_datetime').datetimepicker({
		lang:'ch',
		timepicker:false,
		todayButton:false,
		format:'Y-m-d',
		formatDate:'Y-m-d',
		//minDate:'-1970/01/02',
		//maxDate:'+1970/01/02' 
    });
	
/*	// 时间选择变化 清空关联设备
	$("#start_t,#end_t").change(function(){
		$("#glsb").html("");
	})*/
	
});

// 点击查看测点详情
$("body").on("click","#datatable_body .ui.card .content_tz",function(){
	
	var this_index = $(this).parents(".ui.card").index();
	$.cookie("point_data_detail",JSON.stringify(point_list_data[this_index]));

	window.location.href += "&go=detail";
});

//点击添加按钮
$("body").on("click","#button_add",function(){
	 //先清空添加页的数据
	 $(".addteam input").val("");
	 $(".addteam textarea").val("");
	 $(".portraitStyle").attr("src","");
	 $(".addlogo").children("span").css("display","block");
	 $(".addlogo").children(".addicon").css("display","block");
	 $(".error h4").html("");
	 $('.basic.test.modal.addpoint-modal')
	  .modal('setting', 'closable', false)
	  .modal('show');
	 
	//显示默认头像	
	var url = "/project/single/building/point_image";
	var json = {};
	function successFunc(data){
		var imgUrl = data.image;
		$(".portraitStyle").attr("src",imgUrl);
	}
	sentJson(url,json,successFunc);
});
$('.datasource-option').click(function(){
	$(this).addClass('on').siblings('.on').removeClass('on');
})
//添加测点页，选择测点来源点击效果
var direction = "down";
$("#setDataSource").on("click",function(){
	if(direction =="down"){
		$(".addpoint .datasource .top i").removeClass("down");
		$(".addpoint .datasource .top i").addClass("up");
		direction ="up";
	}else{
		$(".addpoint .datasource .top i").removeClass("up");
		$(".addpoint .datasource .top i").addClass("down");
		direction ="down";
	}
	$(".addpoint .datasource .top i").remove
	$("#dataSource").slideToggle("slow");
});

//添加测点
$("#submit").click(function(){

		var start_time = $("#start_t").val();
		var end_time = $("#end_t").val();
	
		if(start_time!=''){
			if(end_time == ''){
				alertokMsg("开始时间或结束时间不能为空","确定");
				return;
			}
		}
		
		if(end_time != ''){
			if(start_time==''){
				alertokMsg("开始时间或结束时间不能为空","确定");
				return;				
			}
		}
		
/*		if(!reg_time.test(start_time)){
			alertokMsg("开始时间格式不正确","确定");
			return;
		}
		if(!reg_time.test(end_time)){
			alertokMsg("结束时间格式不正确","确定");
			return;
		}*/
		
		//判断时间是否符合规定（开始时间大于结束时间）
		var startTime_cd = new Date(start_time);
		var endTime_cd = new Date(end_time);
		var startTimeStamp = startTime_cd.getTime();
		var endTimeStamp = endTime_cd.getTime();
		startTime_cd = startTime_cd.Format("yyyy-MM-dd");
		endTime_cd = endTime_cd.Format("yyyy-MM-dd");
		
		if(startTimeStamp>1000 || endTimeStamp>1000){ // 判断日历中是否选择过日期
			if(startTimeStamp > endTimeStamp){
				alertokMsg(getLangStr("add_point_messg1"),getLangStr("determine"));
				return;
			}
		}else{
			startTime_cd = -1;
			endTime_cd = -1;
		}
		
		if(startTimeStamp > endTimeStamp){
			/*alertokMsg("结束时间不能早于开始时间","确定");
			return;*/
		}else{

			var selectedDevice;
			var selectedSurvey;
						
			//获取关联设备id		
			if($(".addPointListBox .ui.checkbox.checked").length>0){
				selectedDevice = 	$(".addPointListBox .ui.checkbox.checked").parent().data("id");
			}else{
				//$(".error h4").html("请选择关联设备");
				//return false;
				selectedDevice = -1;
			}
			//获取关联问卷id
			if($(".addSurveyListBox .ui.checkbox.checked").length>0){
				selectedSurvey = 	$(".addSurveyListBox .ui.checkbox.checked").parent().data("id");
			}else{
		/*		$(".error h4").html("请选择关联问卷");
				return false;*/
				selectedSurvey = -1;
			}
			//校验
			var pointName = $(".ui.form .name input").val();
			if($.trim(pointName)==""){
				$(".error h4").html(getLangStr("add_point_messg2"));
				return false;
			}
			var pointPosition = $(".ui.form .position input").val();
			if($.trim(pointPosition)==""){
				$(".error h4").html(getLangStr("add_point_messg3"));
				return false;
			}
			var pointImg = $(".portraitStyle").attr("src");
			if($.trim(pointImg)==""){
				$(".error h4").html(getLangStr("add_point_messg4"));
				return false;
			}
			
			//发送
			var url = "/project/single/building/point_add";
			var json = {"buildingID":buildingID,"surveyID":selectedSurvey,"deviceID":selectedDevice,"name":pointName,"positionDesc":pointPosition,"image":pointImg,"startTime":startTime_cd,"endTime":endTime_cd};
			function successFunc(data){
				alertokMsg(getLangStr("add_point_messg5"),getLangStr("determine"),"window.location.reload()");
			}
			function errorFunc(data){
				var errormsg = data.messg;
				$(".error h4").html(errormsg);
			}
			sentJson(url,json,successFunc,errorFunc);
			
		}
		
});
//添加测点时，点击手动上传时，隐藏设备列表.input设为可以编辑
//$("#input-device a").click(function(){
//	$('.addPointListBox').css("display","none");
//	$('.addpoint .field.name input').removeAttr("readonly");
//	$('.addpoint .field.position input').removeAttr("readonly");
//	$('.addpoint .addlogo input').removeAttr("disabled");
//})
//添加测点时，点击来源设备，弹出设备列表
$("#link-device a").click(function(){
	
	var start_time = $("#start_t").val();
	var end_time = $("#end_t").val();

/*	if(!reg_time.test(start_time)){
		alertokMsg("开始时间格式不正确","确定");
		return;
	}
	if(!reg_time.test(end_time)){
		alertokMsg("结束时间格式不正确","确定");
		return;
	}*/
	
	//判断时间是否符合规定（开始时间大于结束时间）
	var startTime_cd = new Date(start_time);
	var endTime_cd = new Date(end_time);
	var startTimeStamp = startTime_cd.getTime();
	var endTimeStamp = endTime_cd.getTime();
	startTime_cd = startTime_cd.Format("yyyy-MM-dd");
	endTime_cd = endTime_cd.Format("yyyy-MM-dd");
	
/*	if(startTimeStamp > endTimeStamp){
		alertokMsg("结束时间不能早于开始时间","确定");
		return;
	}else{*/
	
		$('.addSurveyListBox').css("display","none");
		$('.addPointListBox').css("display","block");
		/*if(deviceList.length==0){*/
			$("#loadingm").css("display","block");
			$("#child").empty();
			 $.ajax({
			   		type:"post",
			   		url:"/project/single/building/point_device_relevant",
			   		dataType:"json",
			   		data:{
			   			'projectID':teamID,
/*			   			'startTime':startTime_cd,
			   			'endTime':endTime_cd*/
			   		},
			   		success:function(data){
			   			console.log(data);

			   			if(data.code==200){
			   				$("#loadingm").css("display","none");
			   				var list=data.list;
			   				deviceList = list;
			   				var listStr='';
			   				for(var i=0;i<list.length;i++){
			   					listStr+='<li class="clearfix" data-id='+list[i].id+'>'+
					                         '<div class="ui checkbox fl">'+
						                          '<input type="checkbox" name="example">'+
						                          '<label></label>'+
						                      '</div>'+
					                          '<span class="fl">'+list[i].name+'</span>'+
					                     '</li>';
			   				}
			   				$("#child").html(listStr);
			   				
				   			  /*设置列表背景色*/
				   			    var _length=$(".addDeviceList li").length;
				   			    for(var i=0;i<_length;i++){
				   			        if(i%2==0){
				   			            $(".addDeviceList li").eq(i).css("background","#F2F2F2");
				   			        }else{
				   			            $(".addDeviceList li").eq(i).css("background","#FFF");
				   			        }
				   			    }
				   			
				   			 $(".ui.checkbox").checkbox();
				   			 /*s设置滚动条长度*/
				   			    var boxHeight=$("#box").height();
				   			    var contentHeight=$("#child").height();
				   			    var _length=$("#child").children("li").length;
				   			    if(_length<=6){
				   			    	$("#progress").css("display","none");
				   			    	$("#box").css("height",contentHeight);
				   			    }
				   			    else{
				   			    	$("#box").css("height","16rem");
				   			        $("#progress").css("display","block");
				   			        $("#bar").css("height",$("#box").height()/contentHeight*100+"%");
				   			    }
				   			    
				   			    
			   			}else{
			   				alertokMsg(data.messg);
			   			}
			   		},
			   		error:function(){
			   			console.log("error");
			   		}
			   	 });
		/*}*/
	/*}*/
});

//点击添加设备
$(".confirmBtn").click(function(){
	$('.addPointListBox').css("display","none");
	//获取关联设备id		
	if($(".addPointListBox .ui.checkbox.checked").length>0){
		var selectedDeviceName = $(".addPointListBox .ui.checkbox.checked").siblings(".fl").html();
		$("#glsb").html("&nbsp;&nbsp;&nbsp;&nbsp;:"+selectedDeviceName);
	}
});
//设备列表单选
$("#child").on("click","li",function(event){
	$("#child li").children(".ui.checkbox").checkbox('uncheck');
	$(this).children(".ui.checkbox").checkbox('check');
	// $(this).siblings().children(".ui.checkbox").checkbox('uncheck');
})
//设备列表上方的查询框，输入后即查询
$('#searchDevice').keyup(function(event){
	$this = $(this);
	var listStr = "";
   for(var i=0;i<deviceList.length;i++){
	   var devicename = deviceList[i].name;
	   var searchcontent = $this.val();
	   if(devicename.indexOf(searchcontent) >= 0 || $.trim(searchcontent)==""){
		   listStr+='<li class="clearfix" data-id='+deviceList[i].id+'>'+
           '<div class="ui checkbox fl">'+
                '<input type="checkbox" name="example">'+
                '<label></label>'+
            '</div>'+
            '<span class="fl">'+deviceList[i].name+'</span>'+
       '</li>';
	   }
   } 
   $("#child").html(listStr);
   //设置列表背景色
	    var _length=$(".addDeviceList li").length;
	    for(var i=0;i<_length;i++){
	        if(i%2==0){
	            $(".addDeviceList li").eq(i).css("background","#F2F2F2");
	        }else{
	            $(".addDeviceList li").eq(i).css("background","#FFF");
	        }
	    }
});
//添加测点时，点击关联问卷，弹出问卷列表
$("#link-survey a").click(function(){
	
	$('.addPointListBox').css("display","none");
	$('.addSurveyListBox').css("display","block");
	if(surveyList.length==0){
		$("#loadingmSurvey").css("display","block");
		$("#childSurvey").empty();
	   	 $.ajax({
	   		type:"post",
	   		url:"/project/single/building/point_survey_relevant",
	   		dataType:"json",
	   		data:{projectID:teamID},
	   		success:function(data){
	   			console.log(data);
	   			if(data.code==200){
	   				$("#loadingmSurvey").css("display","none");
	   				var surveys=data.list;
	   				surveyList = surveys;
	   				var listStr='';
	   				for(i in surveys){
	   					var survey = surveys[i];
	   					var id = survey.id;
	   					var name = survey.name;
	   					var title = survey.title;
	   					var host = window.location.host;
	   					listStr+='<li class="clearfix" data-id='+id+'>'+
	                    '<div class="ui checkbox fl">'+
	                         '<input type="checkbox" name="example">'+
	                         '<label></label>'+
	                     '</div>'+
	                     '<span class="fl">'+title+'</span>'+
	                     '</li>';
	   				}
	   				$("#childSurvey").html(listStr);
	   				
		   			  /*设置列表背景色*/
		   			    var _length=$(".addSurveyList li").length;
		   			    for(var i=0;i<_length;i++){
		   			        if(i%2==0){
		   			            $(".addSurveyList li").eq(i).css("background","#F2F2F2");
		   			        }else{
		   			            $(".addSurveyList li").eq(i).css("background","#FFF");
		   			        }
		   			    }
		   			
		   			 $(".ui.checkbox").checkbox();
		   			 /*s设置滚动条长度*/
		   			    var boxHeight=$("#boxSurvey").height();
		   			    var contentHeight=$("#childSurvey").height();
		   			    var _length=$("#childSurvey").children("li").length;
		   			    if(_length<=6){
		   			    	$("#progressSurvey").css("display","none");
		   			    	$("#boxSurvey").css("height",contentHeight);
		   			    }
		   			    else{
		   			    	$("#boxSurvey").css("height","16rem");
		   			        $("#progressSurvey").css("display","block");
		   			        $("#barSurvey").css("height",$("#box").height()/contentHeight*100+"%");
		   			    }
		   			    
		   			    
	   			}else{
	   				alertokMsg(data.messg);
	   			}
	   		},
	   		error:function(){
	   			console.log("error");
	   		}
	   	 });
	}
});
//问卷列表单选
$("#childSurvey").on("click","li",function(event){
	$(this).children(".ui.checkbox").checkbox('check');
	$(this).siblings().children(".ui.checkbox").checkbox('uncheck');
})
//点击添加问卷
$(".confirmBtnSurvey").click(function(){
	$('.addSurveyListBox').css("display","none");
	//获取关联问卷id
	if($(".addSurveyListBox .ui.checkbox.checked").length>0){
		var selectedSurveyName = 	$(".addSurveyListBox .ui.checkbox.checked").siblings(".fl").html();
		$("#glwj").html("&nbsp;&nbsp;&nbsp;&nbsp;:"+selectedSurveyName);
	}
	
});
//设备列表上方的查询框，输入后即查询
$('#searchSurvey').keyup(function(event){  
	$this = $(this);
	var listStr = "";
   for(var i=0;i<surveyList.length;i++){
	   var surveyname = surveyList[i].title;
	   var searchcontent = $this.val();
	   if(surveyname.indexOf(searchcontent) >= 0 || $.trim(searchcontent)==""){
		   listStr+='<li class="clearfix" data-id='+surveyList[i].id+'>'+
           '<div class="ui checkbox fl">'+
                '<input type="checkbox" name="example">'+
                '<label></label>'+
            '</div>'+
            '<span class="fl">'+surveyname+'</span>'+
       '</li>';
	   }
   } 
   $("#childSurvey").html(listStr);
   /*设置列表背景色*/
	    var _length=$(".addSurveyList li").length;
	    for(var i=0;i<_length;i++){
	        if(i%2==0){
	            $(".addSurveyList li").eq(i).css("background","#F2F2F2");
	        }else{
	            $(".addSurveyList li").eq(i).css("background","#FFF");
	        }
	    }
});

// 搜索建筑
$("#search_result").keyup(function(){
	
	var this_val = $(this).val();
	var totalList = $("#datatable_body .ui.card");
	
	totalList.hide();
	
	for(var i=0;i<totalList.length;i++){	
		if(totalList.eq(i).find(".pointName").text().indexOf(this_val) >= 0 ){
			totalList.eq(i).show();
		}
	}
})
//点击删除测点按钮
$("body").on("click",".extra_del",function(){
	
		var pointid = $(this).attr("id");

		var url = "/project/single/building/point_del";
		var json = {"buildingPointID":pointid};

		var $this = $(this);
		function successFunc(data){
			alertokMsg(getLangStr("point_delete_ok"),getLangStr("determine"));
			$this.parent().parent().remove();
		}
		function errorFunc(){
			
		}
		sentJson(url,json,successFunc,errorFunc);
	
});



