
var deleteId='';
var relieveId='';
var selected_ID = [];
function reset_selectID(){
	
    // 选择需要操作的设备
    $("body").on("click","#example label",function(){
    	var thisid = $(this).parents("tr").data("id");
    	var thisname = $(this).parents("tr").data("name");
    	var thistype = $(this).parents("td").data("type");
    	var thisuname = $(this).parents("td").data("uname");
    	var thisoname = $(this).parents("td").data("oname");

    	var thisobj = {};
    	
    	thisobj.id = thisid;
    	thisobj.name = thisname;
    	thisobj.type = thistype;
    	thisobj.uname = thisuname;
    	thisobj.oname = thisoname;

    	// 将选中的值放进数组 判断最后一个和之前的 如果有相同的则删掉，跳出循环
    	selected_ID.push(thisobj); 	
    	
    	if(selected_ID.length > 1){
    		for(var i=0;i<selected_ID.length - 1;i++){

        		if(selected_ID[i].id == thisid){
        			selected_ID.splice(i,1);
        			selected_ID.splice(-1,1);
        			break;
        		}
        		
        	}	
    	}    	
    	
		if(thisIdList.indexOf(thisid) == -1){
			thisIdList.push(thisid);
			//console.log("数组中没有 添加");
		}else{
			for(var i=0;i<thisIdList.length;i++){
				if(thisIdList[i] == thisid){
					thisIdList.splice(i,1);
					//console.log("数组中有 删除");
				}
			}
		}

		selected_ID.idList = thisIdList;
		
    	console.log(selected_ID);
    });
}

//复选框选中事件
function toggleTest(obj){
	var _this=obj;
	if($(_this).parent().hasClass('checked')){
		$(_this).parent().removeClass("checked");
	}else{
		$(_this).parent().addClass("checked");
	}
}
//删除设备
function deleteDevice(){
	 $.ajax({
		 type:"post",
		 dataType:"json",
		 url:"/device/deleteDevice",
		 data:{
			 deviceID:deleteId
		 },
		 success:function(data){
			 console.log(data);
			 if(data.code==200){
				 removeAlert();
				 setTimeout(function(){
					 alertokMsg2(getLangStr("deviceList_del_ok"),getLangStr("alert_ok"),"loadDeviceList");
				 },300);
			 }else{
				 removeAlert();
				 setTimeout(function(){
					 alertokMsg(getLangStr("deviceList_del_fail"),getLangStr("alert_ok")); 
				 },300);
			 }
		 },
		 error:function(){}
	 });
 } 

//解除设备关注
function relieveDevice(){
	$.ajax({
		 type:"post",
		 dataType:"json",
		 url:"/device/relieveDevice",
		 data:{
			 deviceID:relieveId
		 },
		 success:function(data){
			 console.log(data);
			 if(data.code==200){
				 removeAlert();
				 setTimeout(function(){
					 alertokMsg2(getLangStr("deviceList_relieve_ok"),getLangStr("alert_ok"),"loadDeviceList");
				 },300);
				 
				 //loadDeviceList();
			 }else{
				 removeAlert();
				 setTimeout(function(){
					 alertokMsg(getLangStr("deviceList_relieve_fail"),getLangStr("alert_ok"));
				 },300);
			 }
		 },
		 error:function(){}
	 });
}
var count=0;
function loadDeviceList(page){

	addLoading();
	/*存放经纬度  */
	
	var table=tableFrame();
	
	loadListId = [];
	
	thisIdList = [];
	
	$("#tableBox").html(table);
		/*获取设备列表  */
	     $.ajax({
	     		type:"post",
	     		dataType:"json",
	     		url:"/device/page_list",
	     		data:{"pageNo":page},
	     		success:function(data){
	     			removeLoading();
	     			
	     			if(data.code==200){
	     				$("#tbody").html("");

		     			// 设备列表分页器
		     			var pagelength = data.page.maxPage; // 分页总数
		     			var pagenumnow = data.page.pageNo; // 当前页码
		     			
		     			//设置分页
		     			var pagingHtml = "<ul><li data-page='1'>"+ getLangStr("datatable_firstpage") +"</li>";
		     			if(pagenumnow>1){
		     				pagingHtml += "<li data-page='"+(pagenumnow-1)+"'>"+ getLangStr("datatable_previous") +"</li>";
		     			}else{
		     				pagingHtml += "<li data-page='1' class='disable'>"+ getLangStr("datatable_previous") +"</li>";
		     			}
		     			if(pagelength>=3){
		     				if(pagenumnow<pagelength-1){
		     					pagingHtml+="<li data-page='"+(pagenumnow)+"' class='active'>"+(pagenumnow)+"</li>";
		     					pagingHtml+="<li data-page='"+(pagenumnow+1)+"'>"+(pagenumnow+1)+"</li>";
		     					pagingHtml+="<li data-page='"+(pagenumnow+2)+"'>"+(pagenumnow+2)+"</li>";
		     				}else{
		     					pagingHtml+="<li data-page='"+(pagenumnow)+"' class='active'>"+(pagenumnow)+"</li>";
		     					for(var num=(pagenumnow+1);num <=pagelength;num++){
		     						pagingHtml+="<li data-page='"+(num)+"'>"+(num)+"</li>";
		     					}
		     				}
		     				
		     			}else{
		     				for(var n=1;n<=pagingHtml;n++){
		     					if(n==pagenumnow){
		     						pagingHtml+="<li data-page='"+n+"' class='active'>"+n+"</li>";
		     					}else{
		     						pagingHtml+="<li data-page='"+n+"'>"+n+"</li>";
		     					}
		     				}
		     			}
		     			
		     			if(pagelength==pagenumnow){
		     				pagingHtml+="<li data-page='' class='disable'>"+ getLangStr("datatable_next") +"</li>";
		     			}else{
		     				pagingHtml+="<li data-page='"+(pagenumnow+1)+"'>"+ getLangStr("datatable_next") +"</li>";
		     			}
		     			pagingHtml+="<li data-page='"+pagelength+"'>"+ getLangStr("datatable_lastpage") +"</li>";
		     			pagingHtml+="<li data-page='-1'>"+ getLangStr("datatable_msgaa_1") +""+pagelength+""+ getLangStr("datatable_msgaa_2") +"</li></ul>"
		     			
		     			$("#devicePagination").html(pagingHtml);

		     			$("#devicePagination li").click(function(){
		     				var $this_page = $(this).data("page");
		     				if($this_page != -1){
			     				$("#devicePagination").html("");
			     				loadDeviceList($this_page);	
		     				}
		     			});
		     			
	     				// 获取设备列表
	     				var deviceList=data.page.list;
	     				var str = "";
	     				var $thismemo;
	     				/*var str1="";
	     				var str2="";
	     				var status;*/
	     				for(var i=0;i<deviceList.length;i++){
	     					
	     					loadListId.push(deviceList[i].id);

	     					if(deviceList[i].memo==null){
	     						$thismemo = ""
	     					}else{
	     						$thismemo = deviceList[i].memo;
	     					}
	     					if(window.localStorage.getItem('language') == 'ch'){
								if(deviceList[i].status == '1')
									deviceList[i].status = '在线';
								else
									 deviceList[i].status = '不在线';
							}
							else if(window.localStorage.getItem('language') == 'en'){
							   if(deviceList[i].status == '1')
								   deviceList[i].status = 'Online';
							   else
								   deviceList[i].status = 'Not online';
							}
	     					str += '<tr data-id='+deviceList[i].id+' data-name='+deviceList[i].deviceName+' >' 
						      +'<td class="collapsing firstColumn" data-type="'+deviceList[i].type+'" data-uname="'+deviceList[i].gname+'" data-oname="'+deviceList[i].ownerName+'">'
				        	  +'<div class="ui fitted  checkbox" id="'+deviceList[i].id+'">'
				          	  +'<input type="checkbox" id="id'+(i+1)+'" onclick="toggleTest(this)"> <label for="id'+(i+1)+'"></label>'
				       		  +"</div>"
				      		  +"</td>"
						      +"<td class='normalColumn' title="+deviceList[i].deviceName+">"+deviceList[i].deviceName+"</td>"
						      +"<td class='normalColumn' title="+deviceList[i].ownerName+">"+deviceList[i].ownerName+"</td>"
						      +"<td class='normalColumn'>"+deviceList[i].gname+"</td>"
						      +"<td class='smallColumn'  title="+deviceList[i].type+">"+deviceList[i].type+"</td>"
						      +"<td class='normalColumn'>"+deviceList[i].bname+"</td>"
						      +"<td class='normalColumn'>"+deviceList[i].cname+"</td>"
						      +"<td class='normalColumn'>"+deviceList[i].pname+"</td>"
						      +"<td class='normalColumn'>"+ $thismemo +"</td>"
						      +"<td class='smallColumn' style='text-align:center;' id='dev-"+ deviceList[i].id +"'>"+ deviceList[i].status +"</td>"
						      +"</tr>";
	     					
	     					/*// 状态判断 在线的排在前面
	     					if(deviceList[i].status=="true"){
	     						status=getLangStr("deviceList_online");
	     						
	         					str1+='<tr data-id='+deviceList[i].id+' data-name='+deviceList[i].deviceName+' >' 
							      +'<td class="collapsing firstColumn" data-type="'+deviceList[i].type+'" data-uname="'+deviceList[i].gname+'" data-oname="'+deviceList[i].ownerName+'">'
					        	  +'<div class="ui fitted  checkbox" id="'+deviceList[i].id+'">'
					          	  +'<input type="checkbox" id="id'+(i+1)+'" onclick="toggleTest(this)"> <label for="id'+(i+1)+'"></label>'
					       		  +"</div>"
					      		  +"</td>"
							      +"<td class='normalColumn' title="+deviceList[i].deviceName+">"+deviceList[i].deviceName+"</td>"
							      +"<td class='normalColumn' title="+deviceList[i].ownerName+">"+deviceList[i].ownerName+"</td>"
							      +"<td class='normalColumn'>"+deviceList[i].gname+"</td>"
							      +"<td class='smallColumn'  title="+deviceList[i].type+">"+deviceList[i].type+"</td>"
							      +"<td class='normalColumn'>"+deviceList[i].bname+"</td>"
							      +"<td class='normalColumn'>"+deviceList[i].cname+"</td>"
							      +"<td class='normalColumn'>"+deviceList[i].pname+"</td>"
							      +"<td class='smallColumn' title="+status+">"+status+"</td>"
							      +"</tr>";
	     						
	     						}else{
	     						status=getLangStr("deviceList_notonline");
	     						
	     						str2+='<tr data-id='+deviceList[i].id+' data-name='+deviceList[i].deviceName+' >' 
							      +'<td class="collapsing firstColumn" data-type="'+deviceList[i].type+'" data-uname="'+deviceList[i].gname+'" data-oname="'+deviceList[i].ownerName+'">'
					        	  +'<div class="ui fitted  checkbox" id="'+deviceList[i].id+'">'
					          	  +'<input type="checkbox" id="id'+(i+1)+'" onclick="toggleTest(this)"> <label for="id'+(i+1)+'"></label>'
					       		  +"</div>"
					      		  +"</td>"
							      +"<td class='normalColumn' title="+deviceList[i].deviceName+">"+deviceList[i].deviceName+"</td>"
							      +"<td class='normalColumn' title="+deviceList[i].ownerName+">"+deviceList[i].ownerName+"</td>"
							      +"<td class='normalColumn'>"+deviceList[i].gname+"</td>"
							      +"<td class='smallColumn'  title="+deviceList[i].type+">"+deviceList[i].type+"</td>"
							      +"<td class='normalColumn'>"+deviceList[i].bname+"</td>"
							      +"<td class='normalColumn'>"+deviceList[i].cname+"</td>"
							      +"<td class='normalColumn'>"+deviceList[i].pname+"</td>"
							      +"<td class='smallColumn' title="+status+">"+status+"</td>"
							      +"</tr>";
	     					}*/
	     				}		
	     				// 所有状态拼接
	     				// str = str1 + str2;
	     				
	     				if(count!=1){
	     					$("#example_wrapper").remove();
	     				}
	     				
	     				$("#example tbody").html(str);
	     				$('#example').DataTable({
		     			        "lengthMenu": [50], 
		     			        "bPaginate" : false,
		     			        "bFilter": false,
		     			        "oLanguage": {
		     			        	"sZeroRecords": getLangStr("datatable_infoEmpty"),
		     			        }
	     			    });
	     				
	     				$(".paginate_button.previous").text(getLangStr("datatable_previous"));
	     				$(".paginate_button.next").text(getLangStr("datatable_next"));
	     				
	     	        	$("#example_wrapper .seven").remove();
	     	        	$("#example_wrapper .nine").removeClass("nine");
	     	        	$("#example_wrapper .eight.right").removeClass("eight").removeClass("right");
	     	        	$("#example_wrapper .eight").remove();
	     	        	setTextAlign();
	     	        	
	     	        	var searchStr='<img class="searchIcon" src="/public/static/manage/img/search.png" />';
	     	        	$("#example_filter  label").append(searchStr);
	     	        	$(".searchIcon").css({
	     	        		"position":"absolute",
	     	        		"left":"1rem",
	     	        		"top":"50%",
	     	        		"width":"1.3rem",
	     	        		"height":"1.3rem",
	     	        		"marginTop":"-0.5rem"
	     	        			
	     	        	});
	     	        	$("#example_filter  label").css({
	     	        		"position":"relative"
	     	        	});
		     	       	$("#example_filter  label input").css({
		 	        		"paddingLeft":"2rem"
		 	        	}); 	
	     	          	
	     	        	var btnStr='<div class="column right aligned clearfix" style="width:100%!important;">'+
	     	        		
	     	        		'<div class="fl"><input type="text" value="" id="searck_input"/> <div id="searck_ok">'+ getLangStr("datatable_search") +'</div></div>'+
	     	        		'<div class=" fr editbtn" id="viewOnlineStatus">'+ getLangStr("check_status") +'</div>'+
							'<div class=" fr editbtn" id="viewDeviceData">'+ getLangStr("deviceList_viewdata") +'</div>'+
							'<div class=" fr editbtn" id="viewDeviceDatas">'+ getLangStr("deviceList_contrastdata") +'</div>'+
							'<div class=" fr editbtn" id="downloadDeviceData">'+ getLangStr("deviceList_download") +'</div>'+
				           '</div>';
						$("#example_wrapper .ui.grid .row:first-child").addClass("two").addClass("column").append(btnStr);
						$("#example_wrapper .ui.grid .row:first-child").css({
							background:"#E7E7E7",
							padding:"0.7rem 1.5rem 0rem"
						});
						$("#example_filter label input").css({
							height:"0.4rem",
							borderRadius:"100px"
						});
						
						
						
						/*去掉input标签的search文本  */
						/*var div = $("#example_wrapper .ui.grid .row:first-child label").get(0),
					        childs = div.childNodes;
					    for(var i = 0; i < childs.length; i++){
					        childs[i].nodeType === 3 && (childs[i].nodeValue = "\n");
					    }*/
					    
					    var firstRow='<div class="row column eight " id="tit" >'+ getLangStr("deviceList_list") +'</div>';
					    $("#example_wrapper .ui.grid .row:first-child ").before(firstRow);
					    $("#tit").css({
					    	background:"#E7E7E7",
					    	color:"#000"
					    });
					  
					    /* 复选框加选中事件 */
					    $('.ui.checkbox').checkbox();
					    
					    $("#example_wrapper .ui.grid .row:first-child").css({
							"border":"1px solid #7C7C7C",
							"borderBottom":"none"
						});
						$("#example_wrapper .ui.grid .row:eq(1)").css({
							"borderLeft":"1px solid #7C7C7C",
							"borderRight":"1px solid #7C7C7C"
						});
						
						search_device();
						
						//自动获取设备状态
						// for(var i=0;i<loadListId.length;i++){
						// 	getStatus(loadListId[i]) 
						// }
	     			}
	     		},
	     		error:function(){
	     			removeLoading();
	     		}
	     });
	
}

/* 搜索 */
function search_device(){
	// 搜索功能
	$("#searck_ok").click(function(){
		
		loadListId = []; // 清空需要填充状态的设备ID
		
		var $search_value = $("#searck_input").val();
		
		if($.trim($search_value)==""){
			alertokMsg(getLangStr("datatable_search_f"),getLangStr("alert_ok"));
			return;
		}
		
		$("#devicePagination").html("");
		addLoading();
		
		/* 20170830 */
		var table=tableFrame();
		$("#tableBox").html(table);
		/* background-color:#e7e7e7;border:1px solid #333333; */
     	var btnStrsss='<div class="ui grid" style="margin-bottom:-20px;"><div class="column right aligned clearfix" style="width:100%!important;margin-top:15px;">'+
     		
     		'<div class="fl"><input type="text" value="" id="searck_input"/> <div id="searck_ok">'+ getLangStr("datatable_search") +'</div></div>'+
     		'<div class=" fr editbtn" id="viewOnlineStatus">'+ getLangStr("check_status") +'</div>'+
			'<div class=" fr editbtn" id="viewDeviceData">'+ getLangStr("deviceList_viewdata") +'</div>'+
			'<div class=" fr editbtn" id="viewDeviceDatas">'+ getLangStr("deviceList_contrastdata") +'</div>'+
			'<div class=" fr editbtn" id="downloadDeviceData">'+ getLangStr("deviceList_download") +'</div>'+
           '</div></div>';
     	
     	$("#tableBox").prepend(btnStrsss);
		/* 20170830 */
		
		$.ajax({
			url:"/device/search",
			type:"POST",
			data:{"name": $search_value},
			success:function(data){
				removeLoading();
				console.log(data);
				search_device();
				
				if(data.code==200){
					// 获取设备列表
     				var deviceList=data.list;
     				/*var str1="";
     				var str2="";
     				var status;*/
     				var str = "";
     				var $thismemo;
     				console.log(data);
     				if(deviceList == 0){
     					$("#example tbody").html("<tr align='center'><td colspan='10' style='text-align:center;'>"+ getLangStr("datatable_deviceEmpty") +"</td></tr>");
     					return;
     				}
     				
     			for(var i=0;i<deviceList.length;i++){
     				
     				loadListId.push(deviceList[i].id);
     				
 					if(deviceList[i].memo==null){
 						$thismemo = ""
 					}else{
 						$thismemo = deviceList[i].memo;
 					}
     				if(window.localStorage.getItem('language') == 'ch'){
						 if(deviceList[i].status == '1')
							 deviceList[i].status = '在线';
						 else
						 	 deviceList[i].status = '不在线';
					 }
					 else if(window.localStorage.getItem('language') == 'en'){
						if(deviceList[i].status == '1')
							deviceList[i].status = 'Online';
						else
							deviceList[i].status = 'Not online';
					 }
 					str += '<tr data-id='+deviceList[i].id+' data-name='+deviceList[i].deviceName+' >' 
						      +'<td class="collapsing firstColumn" data-type="'+deviceList[i].type+'" data-uname="'+deviceList[i].gname+'" data-oname="'+deviceList[i].ownerName+'">'
				        	  +'<div class="ui fitted  checkbox" id="'+deviceList[i].id+'">'
				          	  +'<input type="checkbox" id="id'+(i+1)+'" onclick="toggleTest(this)"> <label for="id'+(i+1)+'"></label>'
				       		  +"</div>"
				      		  +"</td>"
						      +"<td class='normalColumn' title="+deviceList[i].deviceName+">"+deviceList[i].deviceName+"</td>"
						      +"<td class='normalColumn' title="+deviceList[i].ownerName+">"+deviceList[i].ownerName+"</td>"
						      +"<td class='normalColumn'>"+deviceList[i].gname+"</td>"
						      +"<td class='smallColumn'  title="+deviceList[i].type+">"+deviceList[i].type+"</td>"
						      +"<td class='normalColumn'>"+deviceList[i].bname+"</td>"
						      +"<td class='normalColumn'>"+deviceList[i].cname+"</td>"
						      +"<td class='normalColumn'>"+deviceList[i].pname+"</td>"
						      +"<td class='normalColumn'>"+$thismemo+"</td>"
						      +"<td class='smallColumn' style='text-align:center;' id='dev-"+ deviceList[i].id +"'>"+ deviceList[i].status +"</td>"
						      +"</tr>";
					}
				
     				$("#example tbody").html(str);

     				$('#example').DataTable({
     			        "lengthMenu": [30], 
     			        //"bPaginate" : false,
     			        "bLengthChange": false,
     			        "bFilter": false,
     			        "bInfo": false,
     			        "oLanguage": {
	     			        "sZeroRecords": getLangStr("datatable_infoEmpty"),
	     			    }
     			    });
     				//$("#example_info").hide();
				}
			}
		});
	});	
}

/* 地图类聚 */
function createDeviceMap(){
	var positionArr=[];
	
	/*获取地图经纬度 */
	$.ajax({
   		type:"post",
   		dataType:"json",
   		url:"/device/location",
   		success:function(response){
   			if(response.code==200){
   	  			for(var i=0;i<response.list.length;i++){

   	   				positionArr.push({
   						name:response.list[i].deviceName,
   						lat:response.list[i].latitude,
   						lon:response.list[i].longitude
   					});
   	   			}
   	  			
   	  			/***********************   经纬度距离计算设备数量 2017.05.19 by LiHuYong *******************/
 			    function getRad(d){
 			        return d * Math.PI/180.0;
 			    }  
 			    
 				function getFlatternDistance(lat1,lng1,lat2,lng2){
 					
 			        var f = getRad((lat1 + lat2)/2);
 			        var g = getRad((lat1 - lat2)/2);
 			        var l = getRad((lng1 - lng2)/2);  
 			          
 			        var sg = Math.sin(g);  
 			        var sl = Math.sin(l);  
 			        var sf = Math.sin(f);  
 			          
 			        var s,c,w,r,d,h1,h2;  
 			        var a = 6378137.0;  // EARTH_RADIUS 地球半径
 			        var fl = 1/298.257;  
 			          
 			        sg = sg*sg;  
 			        sl = sl*sl;  
 			        sf = sf*sf;  
 			          
 			        s = sg*(1-sl) + (1-sf)*sl;  
 			        c = (1-sg)*(1-sl) + sf*sl;  
 			          
 			        w = Math.atan(Math.sqrt(s/c));  
 			        r = Math.sqrt(s*c)/w;  
 			        d = 2*w*a;  
 			        h1 = (3*r -1)/2/c;  
 			        h2 = (3*r +1)/2/s;  
 			       
 			        distanceResult = d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));
 			        return distanceResult;
 			    } 
 				
 				max_distance = 30000; // 最大距离 （单位：米）
 				positionArrayTotal = positionArr;
 				
 				positionListArr = [];
 				positionPage = 0;
 				
 				positionShow();
 				function positionShow(){
 					
 					positionListThis = [];
						positionThis = {};
 				
 					if(positionArrayTotal.length > 0){
 						
	     				// 把第一个值PUSH进数组 进行对比
 						positionThis.name = positionArrayTotal[0].name;
 						positionThis.lat = positionArrayTotal[0].lat;
 						positionThis.lon = positionArrayTotal[0].lon;
 						
 						if(positionThis.lat==null||positionThis.lon==null){
 							positionArrayTotal.splice(0,1);
 							
 						}else{
 							
 							positionListThis.push(positionThis);
	     						positionArrayTotal.splice(0,1);
	     						// 循环和第一个值进行对比 筛选数据
	     						for(var i=0;i<positionArrayTotal.length;i++){
	     							
	     							positionName = {};
	     							
	     	     					this_pos = positionArrayTotal[i];
	     	     					pre_pos = positionThis;
	     	     					
	     	     	   				getFlatternDistance(this_pos.lat,this_pos.lon,pre_pos.lat,pre_pos.lon);
	     	     	   				//console.log(distanceResult);

	     	     					if(isNaN(distanceResult)){
	     	     						//continue;
	     	     						distanceResult = 0;
	     	     					}
	     	     					
	     	     					//console.log(distanceResult)
	     	     					if(distanceResult <= max_distance){
	     	     						
	     	     						positionName.name = this_pos.name;
	     	     						positionName.lat = this_pos.lat;
	     	     						positionName.lon = this_pos.lon;

	     	     						positionListThis.push(positionName);
	     	     						positionArrayTotal.splice(i,1);
	     	     						
	    	     						//数组删除数据之后长度减一，避免跳过符合条件之后的下一条数据造成数据丢失
	     	     						i--;
	     	     					}
	     	     				}
	     						positionListArr[positionPage] = positionListThis;
 						}


 						positionPage++;
 						
 						positionShow();
 					}
 				}
 				
 				// 整理地图数据
 				positionArrMap = [];

 				for(var k=0;k<positionListArr.length;k++){
 						positionObj = {};
 					
						positionObj.name = positionListArr[k].length; //  positionListArr[k].length + "个";
						positionObj.lat = positionListArr[k][0].lat;
						positionObj.lon = positionListArr[k][0].lon;
						
						positionArrMap.push(positionObj);
 				}
 				
 				// console.log(positionArrMap);
 				
 				/*********************** 经纬度距离计算  *********************/

 				localStorage.setItem("deviceListPosition",JSON.stringify(positionArr));
 				setMap("#container",positionArrMap);
   	  			
   			}	
   		}
   	});
}

/*定义表格*/
function tableFrame(){
	var  tableStr='<table class="ui compact celled definition table"  id="example">'+
		  '<thead class="full-width">'+
		    '<tr>'+
		      '<th class="firstColumn ">'+
		      '</th>'+
		      '<th class="normalColumn">'+ getLangStr("deviceList_devicename") +
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+
		      '<th class="normalColumn">'+ getLangStr("deviceList_owner") +
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+
		      '<th class="normalColumn">'+ getLangStr("deviceList_concern") +
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+
		      '<th class="smallColumn">'+ getLangStr("deviceList_type") +
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+
		      '<th class="addressColumn">'+ getLangStr("deviceList_building") +
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+
		      '<th class="addressColumn">'+ getLangStr("deviceList_measuringpoint") +
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+	
		      '<th class="addressColumn">'+ getLangStr("deviceList_pname") +
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+	
		      '<th class="addressColumn">'+ getLangStr("deviceList_memo") +
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+			      
		      '<th class="normalColumn">'+ getLangStr("deviceList_state") +
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+
		    '</tr>'+
		  '</thead>'+
		  '<tbody >'+
		  '</tbody>'+
		  '<tfoot></tfoot>'+
		'</table>';
	return tableStr;
}
$(function(){
			addLoading();
	
			createDeviceMap();
			loadDeviceList(1);
		
			reset_selectID();

	         /*删除设备  */
	         $("body").on("click","#deleteDeviceBtn",function(){
	        	 deleteId='';
	        	 var selectedId=[];
	        	 var checkboxArr=$(".checkbox");
	        	 for(var i=0;i<checkboxArr.length;i++){
	        		 if($(checkboxArr[i]).hasClass("checked")){
	        			 selectedId.push($(checkboxArr[i]).attr("id"));
	        		 }
	        	 }
	        	 if(selectedId.length==1){
	        		 alertokMsg(getLangStr("deviceList_btn_del"),getLangStr("alert_ok"));
	        	 }else{
	        		 deleteId=selectedId.join(",");
		        	 alertMsg(getLangStr("deviceList_btn_del_ok"),getLangStr("sign_out"),getLangStr("delete_ok"),"deleteDevice");
	        	 }
	        	
	         });
	         
	      	 
	         /*解除关注 */
	         $("body").on("click","#relieveDeviceBtn",function(){
	        	 relieveId="";
	        	 var selectedId=[];
	        	 var checkboxArr=$(".checkbox");
	        	 var count=0;
	        	 for(var i=0;i<checkboxArr.length;i++){
	        		 if($(checkboxArr[i]).hasClass("checked")){
	        			 selectedId.push($(checkboxArr[i]).attr("id"));
	        			 //relieveId+=','+$(checkboxArr[i]).attr("id");
	        		 }
	        	 }
	        	 if(selectedId.length==1){
	        		 alertokMsg(getLangStr("deviceList_relieve"),getLangStr("alert_ok"));
	        	 }else{
	        		 relieveId=selectedId.join(",");
	        		 alertMsg(getLangStr("deviceList_relieve_abs"),getLangStr("sign_out"),getLangStr("deviceList_relieve_btn"),"relieveDevice");
	        	 }
		       });
	         
	         
	         /*统计已选的id数*/
	         $("#submenu .item").click(function(){
	        	var sel_device_id=[];
	        	var current=$("#submenu .item").index($(this));
	        	 	$(".contentTab").eq(current).addClass("on");
	        	  	$(".contentTab").eq(current).siblings().removeClass("on");
	         });
	         
	         /*参数中有设备id，跳转到设备信息页面*/
    		 var deviceid=getUrlParam("deviceId");
    		 if(deviceid){
    			 $("#deviceList").css("display","none");
    			 $("#deviceInfo").css("display","block");
    			 loadDeviceInfo(deviceid);
    		 }
    		 
    		 /* 检查在线状态 */
    		 $("body").on("click","#viewOnlineStatus",function(){	 
    			 var $this_status;
    			 for(var i=0;i<loadListId.length;i++){
    				 getStatus(loadListId[i]) 
    			 }
    		 });
    		 
    		 /*点击跳转到设备数据页面  */
			$("body").on("click","#viewDeviceData",function(){
				 
				 addLoading();
				
				 var deviceNameId={};
				 var checkedId=[];
				 var ids = '';
				 
				 for(var j=0;j<selected_ID.length;j++){
					 deviceNameId[selected_ID[j].name] = selected_ID[j].id;
					 if(j == selected_ID.length - 1){
						ids = ids + selected_ID[j].name;
					 }else{
						ids = ids + selected_ID[j].name + ',';
					 }
					 checkedId.push(selected_ID[j].id);
				 }
				 
	        	 if(checkedId[0]==undefined){
	        		 removeLoading();
	        		 alertokMsg(getLangStr("deviceList_select_one"),getLangStr("alert_ok"));
	        		 // $(".main .ui.inverted.icon.menu .item").eq(0).addClass("on");
	        		 // $(".main .ui.inverted.icon.menu .item").eq(0).siblings().removeClass("on");
        			 $(".contentTab").eq(0).addClass("on");
        		     $(".contentTab").eq(0).siblings().removeClass("on");
	        	 }else if(checkedId.length!=1){
	        		 removeLoading();
	        		 alertokMsg(getLangStr("deviceList_select_one_msg"),getLangStr("alert_ok"));
	        	 }else{
	        		 localStorage.setItem("checkedId",checkedId);
	        		 localStorage.setItem("deviceNameId",JSON.stringify(deviceNameId));
		    		 window.location.href="/device?item=view&id=" + ids;
	        	 }
    		 });
			
			/* 对比数据 */
			$("body").on("click","#viewDeviceDatas",function(){
				 
				 addLoading();
				
				 var deviceNameId={};
				 var checkedId=[];
				 var ids = '';
				 
				 for(var j=0;j<selected_ID.length;j++){
					 deviceNameId[selected_ID[j].name] = selected_ID[j].id;
					 if(j == selected_ID.length - 1){
						 ids = ids + selected_ID[j].name;
					 }else{
						 ids = ids + selected_ID[j].name + ',';
					 }
					 checkedId.push(selected_ID[j].id);
				 }
				 
	        	 if(checkedId[0]==undefined){
	        		 removeLoading();
	        		 alertokMsg(getLangStr("deviceList_select_more"),getLangStr("alert_ok"));
        			 //$(".main .ui.inverted.icon.menu .item").eq(0).addClass("on");
	        		 //$(".main .ui.inverted.icon.menu .item").eq(0).siblings().removeClass("on");
        			 $(".contentTab").eq(0).addClass("on");
        		     $(".contentTab").eq(0).siblings().removeClass("on");
	        	 }else if(checkedId.length < 2){
	        		 removeLoading();
	        		 alertokMsg(getLangStr("deviceList_select_more_msg"),getLangStr("alert_ok"));
	        	 }else{
	        		 localStorage.setItem("checkedId",checkedId);
	        		 localStorage.setItem("deviceNameId",JSON.stringify(deviceNameId));
		    		 window.location.href="/device?item=compare&id=" + ids;
	        	 }
    		 });
			
    		 /*跳转到下载数据页面  */
			$("body").on("click","#downloadDeviceData",function(){
    		 
				 addLoading();
				
				 var deviceNameId=[];
				 var checkedId=[];
				 
				 for(var j=0;j<selected_ID.length;j++){
					 
					checkedId.push(selected_ID[j].id);
			 		deviceNameId.push({
						id:selected_ID[j].id,
						name:selected_ID[j].name,
						oname:selected_ID[j].oname,
						uname:selected_ID[j].uname,
						type:selected_ID[j].type
					});
					 
				 }
    			 
	        	 if(checkedId[0]==undefined){
	        		 
	        		 removeLoading();
	        		 setTimeout(function(){
	        			 //$(".main .ui.inverted.icon.menu .item").eq(0).addClass("on");
	        			 //$(".main .ui.inverted.icon.menu .item").eq(0).siblings().removeClass("on");
	        			 $(".contentTab").eq(0).addClass("on");
	        		     $(".contentTab").eq(0).siblings().removeClass("on");
	        		 },300);
	        		 
	        		 //alertokMsg(getLangStr("deviceList_relieve_ts"),getLangStr("alert_cancel"));
					 alertMsg(getLangStr("deviceList_relieve_ts"),getLangStr("alert_no"),getLangStr("alert_yes"),"showConfirm");
	        		 //alertokMsg(getLangStr("deviceList_download_list"),getLangStr("alert_ok"));
	        	 }else{
	        		 localStorage.setItem("checkedId",checkedId);
					 localStorage.setItem("deviceNameId",JSON.stringify(deviceNameId));
		    		 window.location.href="/device?item=download";
	        	 }
    		 });
			
    		 /*点击列表跳转详情页*/
			 $("body").on("click","#example tbody tr td",function(){
				 // 不是第一个则进行页面跳转
				 if($(this).index()!=0){
	    			 var deviceId=$(this).parent().attr("data-id");
	    			 $("#deviceList").css("display","none");
	    			 $("#deviceInfo").css("display","block");
			    	 loadDeviceInfo(deviceId);					 
				 }
 
    		 });
			 
    		 $("body").on("click","#submenu .first",function(){
    			 $("#deviceList").css("display","block");
    			 $("#deviceInfo").css("display","none");

    			 var deviceListPosition=JSON.parse(localStorage.getItem("deviceListPosition"));
    			 
    			 setMap("#container",deviceListPosition);
    		 });
    		 
    		 /*点击编辑按钮  */
    		 $("body").on("click","#submitDeviceInfo",function(){
    			// addLoading();
    			 var address=$('.eaddress').val();
 				   var describ=$(".edescrib").val();
 				   var wechat=$('.echatname').val();
 				   var memo=$(".ememo").val();
 				   var warnning;
 				   
 				  if($(".dynamicValue .checkbox").hasClass("checked")){
 					  warnning="true";
 				  }else{
 					  warnning="false";
 				  }

  	 		   	   var imgList=[];
  	 		   	   var ilength=$("#upLoadDeviceImg .imgBox").length;
  	 		   	   
  	 		   	   for(var i=0;i<ilength;i++){
  	 		   		   imgList.push($("#upLoadDeviceImg .imgBox").eq(i).children("img").attr("src"));
  	 		   	   }

  				   var localId = localStorage.getItem("checkedId");
  				   
  	 		   $.ajax({
  	 			   type:"post",
  	 			   dataType:"json",
  	 			   url:"/device/update",
  	 			   data:{
  	 				   id:localId,
  	 				   address:address,
  	 				   describe:describ,
  	 				   image:imgList.join(","),
  	 				   wechat:wechat,
  	 				   warning:warnning,
  	 				   memo:memo
  	 			   },
  	 			   success:function(data){
  	 				  removeLoading()
  	 				   if(data.code==200){
  	 					   alertokMsg(getLangStr("submit_ok"),getLangStr("alert_ok"));
  	     				   $('.address').html(address);
  	     				   $(".describ").html(describ);
  	     				   $(".chatname").html(wechat);
  	     				   $(".memo").html(memo);
	  	     					console.log($(".ewarn .checkbox").hasClass("checked"));
	   	     				   
	   	     				   if($(".ewarn .checkbox").hasClass("checked")){
	   	     					   $(".warn .checkbox").checkbox("check");	   
	   	     				   }else{
	   	     					   $(".warn .checkbox").checkbox("uncheck");
	   	     				   }

  	     				   var imageStr2="";
  	     				   for(var i=0;i<imgList.length;i++){
  	     					   imageStr2+='<div class="imgBox fl"><img src="'+imgList[i]+'" class="fl"/><i class="trash outline icon"></i></div>';
  	     					   
  	     				   } 
  	 					   $("#deviceImg").html(imageStr2);
  	     				   
	 					   	setPicSize();
	 					   
					    	$("#submitDeviceInfo").css("display","none");
					    	$("#editDeviceInfo").show();
	   		              	$("#editDeviceBack").hide();
	   		              	
   		              		$(".staticValue").css("display","block");
   		              		$(".dynamicValue").css("display","none");
	   		              	
  	 				   }else{
  	 					   alertokMsg(getLangStr("deviceList_change"),getLangStr("alert_ok"));
  	 				   }
  	 			   },
  	 			   error:function(){}
  	 		   });
    		 });
    	 	 
    	 	  
    	 	   $("#deviceInfoForm").change(function(){
    	 		   var imgNum=$("#upLoadDeviceImg .imgBox").length;
    	 		   if(imgNum<3){
    	 			   /*上传设备图片 */
   		   	    	   	var getFile=$(".eportrait").val();
   		   	    	    var fileName=getFileName(getFile)
   		   	    	   	function getFileName(o){
   		   	    	   	    var pos=o.lastIndexOf(".");
   		   	    	   	    return o.substring(pos+1);  
   		   	    	   	}
   		   	    	   	var te=/jpg|jpeg|png|JPG|PNG/g;
   		   	    	   	if(te.test(fileName)==false){
   		   	    	   		alertokMsg(getLangStr("image_error"),getLangStr("alert_ok"));
   		   	    	   		
   		   	    	   	}else{
   		   	    	   		$("#deviceInfoForm").ajaxSubmit(function(json) {
   		   	    	   			console.log(json);
   		   	    	   			if(json.code != 200) {
   		   	    	   				alertokMsg(getLangStr("image_failed"),getLangStr("alert_ok"));
   		   	    	   				return;
   		   	    	   			}
   		   	    	   		   console.log(json.imageList[0].imageurl);
   		   	    	   			var str='<div class="imgBox fl"><img src="/public/file/image/'+json.imageList[0].imageurl+'" class="fl"/><i class="trash outline icon"></i></div>';
   		   	    	   		
   		   	    	   			$("#deviceImg").append(str);
   		   	    	   			$("#upLoadDeviceImg").append(str);
   		   	    	   			
   		   	    	   		    setPicSize();
    		   	    	   		var imgNumNow=$("#upLoadDeviceImg .imgBox").length;
 		   	    	   			if(imgNumNow==3){
 		   	    	   				$("#deviceInfoForm").css("display","none");
 		   	    	   			}else{
 		   	    	   				$("#deviceInfoForm").css("display","block");
 		   	    	   			}
							})
							
   		   	    	   }
    	 		   }else{
    	 			   alertokMsg(getLangStr("image_max"),getLangStr("alert_ok"));
    	 		   }
    	 	   });
    	 	   
    	 	   /*点击编辑按钮  */
    	 	   $("body").on("click","#editDeviceInfo",function(){
    	 		   $("#editDeviceBack").show();
    	 		  $(".imgBox").children("i.trash.outline.icon").show();
    	 		   
    	 		  var imgNum=$("#deviceImg .imgBox").length;
    	 		  if(imgNum==3){
		   				$("#deviceInfoForm").css("display","none");
		   			}else{
		   				$("#deviceInfoForm").css("display","block");
		   			}
		 		   $(".edescrib").val( $(".describ").html());
		 		   $(".echatname").val( $(".chatname").html());
		 		   
				    $("#submitDeviceInfo").css("display","block");
	              	$(".staticValue").css("display","none");
	              	$(".dynamicValue").css("display","block");
	              	
	              	$("#editDeviceInfo").hide();
	              	$("#submitDeviceInfo").css("display","block");
    	 	   });
    	 	   
    	 	   /* 取消编辑 */
    	 	  $("body").on("click","#editDeviceBack",function(){
    	 		  
    	 		  	$(this).hide();
					$("#deviceInfoForm").css("display","none");
					$(".imgBox").children("i.trash.outline.icon").hide();
				    $("#submitDeviceInfo").css("display","none");
	              	$(".staticValue").css("display","block");
	              	$(".dynamicValue").css("display","none");
	              	
	              	$("#editDeviceInfo").show();

    	 	  });
    	 	   
    	 	  $("body").on("click",".trash",function(){
    	 		   /* 删除图片  */
   	    		   $(this).parent().remove();
   	    		   $("#deviceInfoForm").css("display","block");
   	    	   });

    	 	  // 设备信息页面的下载按钮
    	 	  $("body").on("click","#editDeviceDownload",function(){
    	 		 addLoading();
		    		 window.location.href="/device?item=download";
    	 	  });
    	 	  
    	 	// 设备信息页面的编辑评估按钮
    	 	  $("body").on("click","#editDeviceEvaluation",function(){
    	 		 addLoading();
		    		 window.location.href="/device?item=assessment";
    	 	  });
    	 	  
    	 	  // 设备信息页面的查看按钮
    	 	  $("body").on("click","#editDeviceShow",function(){
    	 		 addLoading();
				  window.location.href="/device?item=view" + "&id=" + JSON.parse(window.localStorage.getItem("deviceNameId"))[0].name;
    	 	  });
    	 	  
        });

// 未选中下载设备时候的弹窗
function showConfirm(){	 
	checkedId = [];
	deviceNameId = [];
	localStorage.setItem("checkedId",checkedId);
	localStorage.setItem("deviceNameId",JSON.stringify(deviceNameId));
	window.location.href="/device?item=download";
}

function getStatus(id){
	$("#dev-"+id).html('<div class="ui mini active inline loader"></div>');
	
	$.ajax({
		url:"/device/status",
		type:"POST",
		data:{"deviceID":id},
		success:function(response){

			if(response.code == 200){
				if(response.status==true){
					$this_status = getLangStr("deviceList_online");
				}else{
					$this_status = getLangStr("deviceList_notonline");
				}
				
				$("#dev-"+id).html($this_status);
			}
			
		}
	 });
}
