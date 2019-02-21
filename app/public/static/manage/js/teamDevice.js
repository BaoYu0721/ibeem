var flag=false;
/*存放缓存中的，项目id*/
var teamId = $.cookie("teamid");
var operateId='';

/*存放缓存中的，项目name*/
var teamname = $.cookie("teamname");
$(".teamTitleTit").html(teamname.length>10?teamname.substring(0,9)+"...":teamname);

//回收设备
function recycleDevice(){
	 $.ajax({
		 type:"post",
		 dataType:"json",
		 url:"/project/single/device/recycle",
		 data:{
			 ids:operateId
		 },
		 success:function(data){
			 console.log(data);
			 //return;
			 if(data.code==200){
				 //alert("删除成功");
				 removeAlert();
				 
				 setTimeout(function(){
					 alertokMsg2(getLangStr("teamDevice_msg_1"),getLangStr("alert_ok"),"loadDeviceList");
				 },300)

				 //loadDeviceList();
				 //window.location.href="http://localhost:8080/views/manage/teamDevice.jsp";
			 }else{
				 removeAlert();
				 alertokMsg(getLangStr("teamDevice_msg_2"),getLangStr("alert_ok"));
			 }
		 },
		 error:function(){}
	 });
 } 
//关注使用
function markDevice(uid){
	
	 $.ajax({
		 type:"post",
		 dataType:"json",
		 url:"/project/single/device/addAttention",
		 data:{
			 ids:operateId,
			 userID:uid
		 },
		 success:function(data){
			 console.log(data);
			 if(data.code==200){
				 removeAlert();
				 alertokMsg2(getLangStr("teamDevice_msg_3"),getLangStr("alert_ok"),"loadDeviceList");
			 }else{
				 removeAlert();
				 alertokMsg(getLangStr("teamDevice_msg_4"),getLangStr("alert_ok"));
			 }
		 },
		 error:function(){}
	 });
 } 
//解除关注
function relieveDevice2(){
	 $.ajax({
		 type:"post",
		 dataType:"json",
		 url:"/project/single/device/relieve",
		 data:{
			 deviceID:operateId
		 },
		 success:function(data){
			 console.log(data);
			 if(data.code==200){
				 //alert("删除成功");
				 removeAlert();
				 setTimeout(function(){
					 alertokMsg2(getLangStr("deviceList_relieve_ok"),getLangStr("alert_ok"),"loadDeviceList");
				 },300);
				 
				 //loadDeviceList();
				 //window.location.href="http://localhost:8080/views/manage/teamDevice.jsp";
				 
			 }else{
				 removeAlert();
				 alertokMsg(getLangStr("deviceList_relieve_fail"),getLangStr("alert_ok"));
			 }
		 },
		 error:function(){}
	 });
 } 

function operateDevice(){
	 /*对项目设备的操作*/
    $(".addDevice span").click(function(){
		$("#loadingm").css("display","block");
	   	 $.ajax({
	   		type:"post",
	   		url:"/project/single/device/search",
	   		dataType:"json",
	   		data:{
	   			key:teamId
	   		},
	   		success:function(data){
	   			console.log(data);
	   			if(data.code==200){
	   				$("#loadingm").css("display","none");
	   				var list=data.list;
	   				var listStr='';
	   				var searchDevice = [];
	   				for(var i=0;i<list.length;i++){
	   					listStr+='<li class="clearfix" data-id='+list[i].id+'>'+
			                         '<div class="ui checkbox fl">'+
				                          '<input type="checkbox" name="example">'+
				                          '<label></label>'+
				                      '</div>'+
			                          '<span class="fl">'+list[i].name+'</span>'+
			                     '</li>';
	   					
	   					searchDevice.push({
	   						device_id:list[i].id,
	   						device_name:list[i].name
	   					});
	   					
	   				}
	   				localStorage.setItem("searchDevice",JSON.stringify(searchDevice));
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
		   			        $("#bar").css("height",$("#box").height()/contentHeight*500+"%");
		   			    /* $("#bar").css("height",$("#box").height()/contentHeight*100+"%");*/
		   			    }
		   			    
		   			    
	   			}else{
	   				alertokMsg(data.messg);
	   			}
	   		},
	   		error:function(){
	   			console.log("error");
	   		}
	   	 });
    });
    	

    
    
    /*加入设备*/
    $(".confirmBtn").click(function(){
    	
    	var ids=[];
    	var _length=$(".ui.checkbox").length;
    	
    	for(var i=0;i<_length;i++){
    		if($(".ui.checkbox").eq(i).hasClass("checked")){
    			ids.push($(".ui.checkbox").eq(i).parent().attr("data-id"));
    		}
    	}
    	
    	if(ids.length==0){
    		
    		setTimeout(function(){
    			alertokMsg(getLangStr("teamDevice_msg_5"),getLangStr("alert_ok"));
    		},300);
    		return;
    	}
    	addLoading();
    	$.ajax({
    		type:"post",
    		dataType:"json",
    		url:"/project/single/device/add",
    		data:{
    			projectID:teamId,
    			ids:ids.join(",")
    		},
    		success:function(data){
    			console.log(data);
    			removeLoading();
    			if(data.code==200){
    				
    				setTimeout(function(){
    					alertokMsg2(getLangStr("teamDevice_msg_6"),getLangStr("alert_ok"),"loadDeviceList");
    				},300);
    				
    				/*setTimeout(function(){
    					//window.location.href="/views/manage/teamDevice.jsp";
    					loadDeviceList();
    				},1000);*/
    			}
    		},
    		error:function(){
    			removeLoading();
    			console.log("error");
    		}
    	});
    });
    /*回收设备*/
   $("#recycleDevice").click(function(){
	   	 deleteId='';
	   	 
	   	 var selectedId = selected_ID;
	   	 
	   	 if(selectedId.length==0){
	   		 alertokMsg(getLangStr("teamDevice_msg_7"),getLangStr("alert_ok"));
	   	 }else{
	   		 

	   		 operateId=selectedId.idList.join(",");
	   		 
	       	 alertMsg(getLangStr("teamDevice_msg_8"),getLangStr("alert_cancel"),getLangStr("teamDevice_msg_9"),"recycleDevice");
	     	       	 
	   	 }
   });
   /*关注使用*/
   $("#markDevice").click(function(){

	   	var selectedId = selected_ID;
	   	 
	   	 if(selectedId.length==0){
	   		 alertokMsg(getLangStr("teamDevice_msg_10"),getLangStr("alert_ok"));
	   	 }else{
	   		operateId=selectedId.idList.join(",");
	   		
	   		$.ajax({
	    		type:"post",
	    		dataType:"json",
	    		url:"/project/single/device/attention",
	    		data:{
	    			projectID:teamId
	    		},
	    		success:function(data){

	    			var userStr = '';
	    			if(data.code==200){
	    				var data = data.user;
	    				for(var i=0;i<data.length;i++){
	    					
	    					userStr += '<li data-uid="'+ data[i].id +'"><img src="'+ data[i].portrait +'"><h4>'+ data[i].name +'</h4></li>'
	    				}
	    				
	    				$("#user_list").html(userStr);

	    				/* 选择关注者 */
    				   $("#user_list").find("li").on("click",function(){
    						var thisid = $(this).data("uid");

    						markDevice(thisid);
    						$("#user_add_list").modal('hide');
    					});
    				   
	    			}

	    		},
	    		error:function(){
	    			
	    		}
	   	 	});
	   		
	   		$("#user_add_list").modal('show');
	   	 }
   });
   

   
   /*解除关注者*/
   $("#relieveDevice").click(function(){

	   	 var selectedId = selected_ID;
	   	 
	   	 if(selectedId.length==0){
	   		 alertokMsg(getLangStr("deviceList_relieve"),getLangStr("alert_ok"));
	   	 }else{
	   		operateId=selectedId.idList.join(",");
	   		 alertMsg(getLangStr("deviceList_relieve_abs"),getLangStr("alert_cancel"),getLangStr("deviceList_relieve_btn"),"relieveDevice2");
	   	 
	   	 }
   });
    $(".actionBtn").click(function(){
        $(this).addClass("on").siblings().removeClass("on");
        if($(".actionBtn").eq(0).hasClass("on")){
        	$(".addDeviceListBox").css("display","block");
        	flag=true;
        	
        }else{
        	$(".addDeviceListBox").css("display","none");
        }
        return false;
    });
  
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
        $("#bar").css("height",boxHeight/contentHeight*100+"%");
    }

    /*设备列表滚动条*/
    var oParent = document.getElementById("progress");
    var oChild = document.getElementById("bar");
    var oBox = document.getElementById('box');
    var oContent = document.getElementById('child');
    var disX = 0;
    oChild.onmousedown = function (ev) {
        var ev = ev || window.event;
        disY = ev.clientY - oChild.offsetTop;
        document.onmousemove = function (ev) {
            console.log("move");
            var ev = ev || window.event;
            // 限制小div拖动范围
            var T  = ev.clientY - disY;
            if(T<0){ //因为小div是相对大div定位的，所以当拖到大div的最左边的时候，小div的left就为0了
                T = 0;
            }
            if(T>oParent.offsetHeight - oChild.offsetHeight){
                // 大div的宽 减去 小div的宽 就是小div可以拖动的最大值
                T = oParent.offsetHeight - oChild.offsetHeight;
            }
            oChild.style.top = T +'px';
            var scale = T/(oParent.offsetHeight - oChild.offsetHeight);// 定义一个滚动的比例
            //通过scale比例，滚动的时候改变content的top值
            oContent.style.top = -scale * (oContent.offsetHeight-oBox.offsetHeight) + 'px';
        }
        document.onmouseup = function(){
            document.onmousemove = null;
            document.onmouseup = null;
        }
        return false;
    }
    
    
   

}