//动态设置图片的宽度
function setPicSize(){
	var formWidth=$(".myform").width();
	$(".imgBox").css("width",formWidth*0.27+"px");
	$(".uploadImgStyle").css("width",formWidth*0.27+"px");
}

function loadDeviceInfo(id){
	addLoading();

	localStorage.setItem("checkedId",id);

	
	 	$.ajax({
			url:"/device/status",
			type:"POST",
			data:{"deviceID":id},
			success:function(data){

				//console.log(data)
				if(data.code == 200){
					 var $status = data.status;
	 				  if($status==true){
	 					 $status = getLangStr("deviceList_online");
	 				  }else if($status==false){
	 					 $status = getLangStr("deviceList_notonline");
	 				  }
	 				  
	 				 $(".state").html($status);
	 				 $(".estate").html($status);
				}
				
			}
		 });
	
 	   /*设备信息页面  */
 	   var devicePosition=[];
 	   var uploadImg=[];
 	   $.ajax({
 		   type:"post",
 		   dataType:"json",
 		   url:"/device/info",
 		   data:{
 			   deviceID:id
 		   },
 		   success:function(data){
 			   console.log(data);
 			   if(data.code==200){
 				   console.log(data);
 				   var device=data.device;
 				   var imageList=data.device.imageList;
 				   var imageStr="";
 				   if(imageList.length>0){
 					   for(var i=0;i<imageList.length;i++){
 						   uploadImg.push(imageList[i].img);
     					   imageStr+='<div class="imgBox fl"><img src="'+imageList[i].img+'" class="fl"/><i class="trash outline icon"></i></div>';
     				   } 
 					   $("#upLoadDeviceImg").html(imageStr);
 					   $("#deviceImg").html(imageStr);
 					   
 				   }else{
 					   var defaultImg='<div class="imgBox fl"><img src="/public/static/manage/img/userdefault.png" class="fl"/><i class="trash outline icon"></i></div>';
 					   //var defaultImg = '';
 					   uploadImg.push("/public/static/manage/img/userdefault.png");
	       					$("#deviceImg").html(defaultImg);
	       					$("#upLoadDeviceImg").html(defaultImg);
 				   }
 				  setPicSize();
 				   
 				  
/* 				  var $status = device.onlineStatus;
 				  if($status=="true"){
 					 $status = getLangStr("deviceList_online");
 				  }else if($status=="false"){
 					 $status = getLangStr("deviceList_notonline");
 				  }
 				  */
 				   $("#deviceName").html(device.name);
 				   $('.owner').html(device.owner);
 				   $('.address').html(device.address);
 				   $('.user').html(device.gname);
 				   //$('.user').html(device.user);
 				   $('.type').html(device.type);
 				   $('.source').html(device.source);
 				   $(".chatname").html(device.wechat);
 				   $(".describ").html(device.describe);
 				   //$(".state").html($status);
 				   $(".ecode").attr("src",device.QRcode);
 				   $(".memo").html(device.memo);
 				   

 				   if(device.warnning == "true"){
 					   $(".staticValue .checkbox input").attr("checked",true);
 					   $(".dynamicValue .checkbox input").attr("checked",true);
 				   }else{
 					   $(".staticValue .checkbox input").attr("checked",false);
 					   $(".dynamicValue .checkbox input").attr("checked",false);
 				   }
 				   
 				   $('.eowner').val(device.owner);
 				   $('.eaddress').val(device.address);
 				   $('.euser').val(device.gname);
 				   //$('.euser').val(device.user);
 				   $('.etype').val(device.type);
 				   $('.esource').val(device.source);
 				   $(".echatname").html(device.wechat);
 				   $(".edescrib").html(device.describe);
 				   //$(".estate").html($status);
 				  $(".ememo").val(device.memo);
 				  
				   	// 设备信息下载页面数据
				   	var checkedId = device.id;
				   	var deviceNameId = [];
		   			 
				 	deviceNameId.push({
						id:device.id,
						name:device.name,
						oname:device.owner,
						uname:device.user,
						type:device.type
					});
				 	
		    		localStorage.setItem("checkedId",checkedId);
		    		localStorage.setItem("deviceNameId",JSON.stringify(deviceNameId));
 				   
 				   /*地图描点  */
 				   devicePosition.push({
 						name:device.deviceName,
 						lat:device.latitude,
 						lon:device.longitude
 					});
 				   
 				   console.log(devicePosition);
 				   
 				   if(devicePosition[0].lat==null || devicePosition[0].lon==null){
 					  setMap("#container2","");
 				   }else{
 					  setMap("#container2",devicePosition);
 				   }
 				   
 				   /*$(".highcharts-legend-item").css("display","none");
     			   $(".highcharts-credits").remove();
     			   $(".highcharts-contextbutton").remove();
     			   $(".highcharts-title").remove();*/

     			   removeLoading();
     			   
 			   }
 		   },
 		   error:function(){}
 	   });
 	   
 	  
   }