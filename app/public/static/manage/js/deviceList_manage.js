var devicelist = [];
var datatable;
function loadDeviceList(page){
	addLoading();
	
	selected_ID = [];
	thisIdList = [];
	loadListId = [];
	
	var table=tableFrame();
	$("#tableBox").html(table);
	
		 /*获取设备列表  */
	     $.ajax({
	     		type:"post",
	     		dataType:"json",
	     		url:"/admin/device/list",
	     		data:{"pageNo":page},
	     		success:function(data){
	     		console.log(data);
	    			
	    			if(data.code==200){
	    				$("#tbody").html("");
	    				
	    				list=data.page.list;
	    				devicelist = list;
	    				setTable(list);
	    				console.log(data);
	    				removeLoading();
	    				
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

//		     			$("#devicePagination li").click(function(){
//		     				$("#devicePagination").html("");
//		     				var $this_page = $(this).data("page");
//		     				loadDeviceList($this_page);
//		     			});
		     			$("#devicePagination li").click(function(){
		     				var $this_page = $(this).data("page");
		     				if($this_page != -1){
			     				$("#devicePagination").html("");
			     				loadDeviceList($this_page);	
		     				}
						 });
						 
						 //自动获取设备状态
						for(var i=0;i<loadListId.length;i++){
							getStatus(loadListId[i]) 
						}
	    			}
	     		},
	     		error:function(){
	     			removeLoading();
	     		}
	    });
}

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

function setTable(deviceList){
	console.log(deviceList);
	var str = "";
/*	var str1 = "";
	var str2 = "";
	var str3 = "";*/
	var $thismemo;
	
	for(var i=0;i<deviceList.length;i++){
		
		loadListId.push(deviceList[i].id);
		
		if(deviceList[i].memo==null){
			$thismemo = ""
		}else{
			$thismemo = deviceList[i].memo;
		}
			
		str += '<tr data-id='+deviceList[i].id+' data-name='+deviceList[i].name+' >' 
			      +'<td class="collapsing firstColumn" data-type="'+deviceList[i].type+'" data-uname="'+deviceList[i].gname+'" data-oname="'+deviceList[i].ownerName+'">'
		    	  +'<div class="ui fitted  checkbox" id="'+deviceList[i].id+'">'
		      	  +'<input type="checkbox" id="id'+(i+1)+'" onclick="toggleTest(this)"> <label for="id'+(i+1)+'"></label>'
		   		  +"</div>"
		  		  +"</td>"
			      +"<td class='normalColumn' title="+deviceList[i].name+">"+deviceList[i].name+"</td>"
			      +"<td class='normalColumn owner' title="+deviceList[i].ownerName+">"+deviceList[i].ownerName+"</td>"
			      +"<td class='normalColumn'>"+deviceList[i].gname+"</td>"
			      +"<td class='smallColumn'  title="+deviceList[i].type+">"+deviceList[i].type+"</td>"
/*			      +"<td class='normalColumn'>"+deviceList[i].bname+"</td>"
			      +"<td class='normalColumn'>"+deviceList[i].cname+"</td>"*/
			      +"<td class='normalColumn'>"+deviceList[i].pname+"</td>"
			      +"<td class='normalColumn'>"+ $thismemo +"</td>"
			      +"<td class='normalColumn'>"+deviceList[i].dataCount+"</td>"
			      +"<td class='smallColumn' style='text-align:center;' id='dev-"+ deviceList[i].id +"'>"+ "—" +"</td>"
			      +"</tr>";
	}	
		/*// 状态判断 在线的排在前面
		if(deviceList[i].status=="true"){
			status="在线";
			
			str1+='<tr data-id='+deviceList[i].id+' data-name='+deviceList[i].name+' >' 
	      +'<td class="collapsing firstColumn" data-type="'+deviceList[i].type+'" data-uname="'+deviceList[i].gname+'" data-oname="'+deviceList[i].ownerName+'">'
    	  +'<div class="ui fitted  checkbox" id="'+deviceList[i].id+'">'
      	  +'<input type="checkbox" id="id'+(i+1)+'"> <label for="id'+(i+1)+'"></label>'
   		  +"</div>"
  		  +"</td>"
	      +"<td class='normalColumn' title="+deviceList[i].name+">"+deviceList[i].name+"</td>"
	      +"<td class='normalColumn owner' title="+deviceList[i].ownerName+">"+deviceList[i].ownerName+"</td>"
	      +"<td class='normalColumn'>"+deviceList[i].gname+"</td>"
	      +"<td class='smallColumn'  title="+deviceList[i].type+">"+deviceList[i].type+"</td>"
//	      +"<td class='normalColumn'>"+deviceList[i].bname+"</td>"
//	      +"<td class='normalColumn'>"+deviceList[i].cname+"</td>"
	      +"<td class='smallColumn' title="+status+">"+status+"</td>"
	      +"<td class='normalColumn' ></td>"
	      +"</tr>";
			
			}else if(deviceList[i].status=="false"){
			status="不在线";
			
			str2+='<tr data-id='+deviceList[i].id+' data-name='+deviceList[i].name+' >' 
	      +'<td class="collapsing firstColumn" data-type="'+deviceList[i].type+'" data-uname="'+deviceList[i].gname+'" data-oname="'+deviceList[i].ownerName+'">'
    	  +'<div class="ui fitted  checkbox" id="'+deviceList[i].id+'">'
      	  +'<input type="checkbox" id="id'+(i+1)+'"> <label for="id'+(i+1)+'"></label>'
   		  +"</div>"
  		  +"</td>"
	      +"<td class='normalColumn' title="+deviceList[i].name+">"+deviceList[i].name+"</td>"
	      +"<td class='normalColumn owner' title="+deviceList[i].ownerName+">"+deviceList[i].ownerName+"</td>"
	      +"<td class='normalColumn'>"+deviceList[i].gname+"</td>"
	      +"<td class='smallColumn'  title="+deviceList[i].type+">"+deviceList[i].type+"</td>"
//	      +"<td class='normalColumn'>"+deviceList[i].bname+"</td>"
//	      +"<td class='normalColumn'>"+deviceList[i].cname+"</td>"
	      +"<td class='smallColumn' title="+status+">"+status+"</td>"
	      +"<td class='normalColumn' ></td>"
	      +"</tr>";
		}else{
			status="";
			
			str3+='<tr data-id='+deviceList[i].id+' data-name='+deviceList[i].name+' >' 
	      +'<td class="collapsing firstColumn" data-type="'+deviceList[i].type+'" data-uname="'+deviceList[i].gname+'" data-oname="'+deviceList[i].ownerName+'">'
    	  +'<div class="ui fitted  checkbox" id="'+deviceList[i].id+'">'
      	  +'<input type="checkbox" id="id'+(i+1)+'"> <label for="id'+(i+1)+'"></label>'
   		  +"</div>"
  		  +"</td>"
	      +"<td class='normalColumn' title="+deviceList[i].name+">"+deviceList[i].name+"</td>"
	      +"<td class='normalColumn owner' title="+deviceList[i].ownerName+">"+deviceList[i].ownerName+"</td>"
	      +"<td class='normalColumn'>"+deviceList[i].gname+"</td>"
	      +"<td class='smallColumn'  title="+deviceList[i].type+">"+deviceList[i].type+"</td>"
//	      +"<td class='normalColumn'>"+deviceList[i].bname+"</td>"
//	      +"<td class='normalColumn'>"+deviceList[i].cname+"</td>"
	      +"<td class='smallColumn' title="+status+">"+status+"</td>"
	      +"<td class='normalColumn' ></td>"
	      +"</tr>";
		}
	}
	// 所有状态拼接
	str = str1 + str2 + str3;*/
	$("#tbody").html(str);
	$("#example tbody").html(str);
	/* 复选框加选中事件 */
	$('.ui.checkbox').checkbox({
		onChecked:function(){
			$(this).parent().parent().parent().addClass("selected");
		},
		onUnchecked:function(){
			$(this).parent().parent().parent().removeClass("selected");
		}
	});
	// datatable = $('#example').DataTable();
	
	datatable = $('#example').DataTable({
	        "lengthMenu": [50], 
	        "bPaginate" : false,
	        "bFilter": false,
	        "oLanguage": {
		        "sZeroRecords": getLangStr("datatable_infoEmpty"),
		    }
	    });
	
	$("#example_wrapper .seven").remove();
	$("#example_wrapper .nine").removeClass("nine");
	$("#example_wrapper .eight.right").removeClass("eight").removeClass("right");
	$("#example_wrapper .eight").remove();
	setTextAlign();
	/*添加搜索按钮*/
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
	
	
	/* 添加按钮 */
	var btnStr='<div class="column right aligned clearfix" style="width:100%!important;">'+
	'<div class="fl"><input type="text" value="" id="searck_input"/> <div id="searck_ok">搜索</div></div>'+
   '<div class="clearfix fr pageNumBox" id="submenu" style="display:none;">'+
   '<span class="fl">1/6</span>'+
   '<span class="fl">页</span>'+
   '</div>'+
   '<div class=" fr editbtn" id="viewOnlineStatus">检查状态</div>'+
   '<div class=" fr editbtn" id="cancleOwner">解除拥有</div>'+
   '<div class=" fr editbtn" id="addOwner">设置拥有者</div>'+
   '<div class=" fr editbtn" id="addDevice">新增设备</div>'+
   '<div class=" fr editbtn" id="putInDevice">导入设备</div>'+
	'<div class=" fr editbtn" id="viewDeviceData">查看数据</div>'+
	'<div class=" fr editbtn" id="viewDeviceDatas">对比数据</div>'+
   '<div class=" fr editbtn" id="downloadDeviceData">下载</div>'+   
   '</div>';
	$("#example_wrapper .ui.grid .row:first-child").addClass("two").addClass("column").append(btnStr);
	
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
		
		$.ajax({
			url:"/admin/device/research",
			type:"POST",
			data:{"name": $search_value},
			success:function(data){
				removeLoading();
				console.log(data);
				if(data.code==200){
					// 获取设备列表
     				var deviceList=data.list;
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
     					
     					str += '<tr data-id='+deviceList[i].id+' data-name='+deviceList[i].deviceName+' >' 
     						      +'<td class="collapsing firstColumn" data-type="'+deviceList[i].type+'" data-uname="'+deviceList[i].gname+'" data-oname="'+deviceList[i].ownerName+'">'
     					    	  +'<div class="ui fitted  checkbox" id="'+deviceList[i].id+'">'
     					      	  +'<input type="checkbox" id="id'+(i+1)+'" onclick="toggleTest(this)"> <label for="id'+(i+1)+'"></label>'
     					   		  +"</div>"
     					  		  +"</td>"
     						      +"<td class='normalColumn' title="+deviceList[i].deviceName+">"+deviceList[i].deviceName+"</td>"
     						      +"<td class='normalColumn owner' title="+deviceList[i].ownerName+">"+deviceList[i].ownerName+"</td>"
     						      +"<td class='normalColumn'>"+deviceList[i].gname+"</td>"
     						      +"<td class='smallColumn'  title="+deviceList[i].type+">"+deviceList[i].type+"</td>"
     						      +"<td class='normalColumn'>"+deviceList[i].pname+"</td>"
     						      +"<td class='normalColumn'>"+ $thismemo +"</td>"
     						     +"<td class='normalColumn'>"+deviceList[i].dataCount+"</td>"
     						      +"<td class='smallColumn' style='text-align:center;' id='dev-"+ deviceList[i].id +"'>"+ "—" +"</td>"
     						      +"</tr>";
     					
     					
     				}		
     				
     				$("#example tbody").html(str);
     				
//     				$('#example').DataTable({
//     			        "lengthMenu": [50], 
//     			        //"bPaginate" : false,
//     			       "bLengthChange": false,
//     			        "bFilter": false,
//     			        "bInfo": false,
//     			        "oLanguage": {
//	     			        "sZeroRecords": getLangStr("datatable_infoEmpty"),
//	     			    }
//     			    });
     				
				}
			}
		});
	});
	
	//================导入设备设备点击事件================
	$("#putInDevice").click(function(){
		$("#buildUploadPopover").modal('show');	
	});
	
	// 上传模板
	$("#UpLoadFileButton").click(function(){
		
		addLoading();
		// return;
		
		var formData = new FormData($("#fileUpLoad")[0]);

		$.ajax({
			url:"/admin/device/export",
			type: "POST",
			data: formData,
			async: false,
			cache: false,
			contentType: false,
			processData: false,
			success: function(data) {
				//console.log(data);
				removeLoading();

				if(data.code == 200) {
					alertokMsg("导入模板成功！","确定","window.location.reload()");
				} else {	
					alertokMsg(data.msg,"确定");
				}
			},
			error: function(e) { // 
				removeLoading();
				if(e.status == 400){
					alertokMsg("文件类型错误(请导入xlxs格式文件)", "确定");
				}else if(e.status == 413){
					alertokMsg("文件过大", "确定");
				}
			}
		});
	});
	
	//================添加新增设备点击事件================
	$("#addDevice").click(function(){
		$('.basic.test.modal.adddevice')
		.modal('setting', 'closable', false)
		.modal('show');
		$('#addDeviceType').dropdown();
	})
	//================添加设置拥有点击事件================
	$("#addOwner").click(function(){
		if($("#example>tbody>tr .ui.checkbox.checked").length<=0){
			alertokMsg("请先选择设备","确定");
			return false;
		}
		//获取选中设备
		var selectedDataLength = $("#example>tbody>tr .ui.checkbox.checked").length;
		var returnStatus = true;
		$("#example>tbody>tr .ui.checkbox.checked").each(function(){
			var devicename = $(this).parent().parent().data("name");
			var owner = $(this).parent().parent().find(".owner").html();
			if($.trim(owner)!=""){
				alertokMsg("设备["+devicename+"]已有拥有者，无法重复设置","确定");
				returnStatus = false;
			}
		})
		if(returnStatus){
			$('.basic.test.modal.addowner')
			.modal('setting', 'closable', false)
			.modal('show');
			$("#child").empty();
			 $.ajax({
			   		type:"post",
			   		url:"/admin/device/user_list",
			   		dataType:"json",
			   		data:{},
			   		success:function(data){
			   			//console.log(data);
			   			if(data.code==200){
			   				$("#loadingm").css("display","none");
							var list=data.arrayList;
			   				var listStr='';
			   				for(var i=0;i<list.length;i++){	
			   					var name = list[i].name != null? list[i].name.length>15?list[i].name.substring(0,15):list[i].name: '';
			   					listStr+='<li class="clearfix show" data-id='+list[i].id+'>'+
					                         '<div class="ui checkbox fl">'+
						                          '<input type="checkbox" name="example">'+
						                          '<label></label>'+
						                      '</div>'+
					                          '<span class="fl">'+name+'</span>'+
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
				   			
				   			 /*s设置滚动条长度*/
				   			    var boxHeight=$("#box").height();
				   			    var contentHeight=$("#child").height();
				   			    var _length=$("#child").children("li").length;
				   			    if(_length<=6){
				   			    	$("#progress").css("display","none");
				   			    	$("#box").css("height",contentHeight);
				   			    }
				   			    else{
				   			        $("#progress").css("display","block");
				   			        $("#bar").css("height",$("#box").height()/contentHeight*100+"%");
				   			    }
				   			    
				   			    
			   			}else{
			   				alertokMsg(data.messg);
			   			}
			   			//搜索框搜索事件
			   			$("#searchUser").keyup(function(event){  
			   				var searchContent = $('#searchUser').val();
			   				//删掉输入内容开头的空格
			   				while(searchContent.substring(0,1)==" "){
			   					searchContent = searchContent.substring(1);
			   				} 
			   				$("#child>li>span").each(function(){
			   					var name = $(this).html();
			   					//如果列表中某一项包含查询的内容,则高亮显示		
			   					if(name.indexOf(searchContent) >= 0 || searchContent==""){
			   						$(this).parent().addClass("show");
			   					}else{
			   						$(this).parent().removeClass("show");
			   					} 
			   				});
			   				/*设置列表背景色*/
//			   			    var targetli=$(".addDeviceList li:not(.search)");
//			   			    for(var i in targetli){
//			   			    	if(i%2==0){
//			   			    		$(targetli[i]).css("background","#F2F2F2");
//			   			        }else{
//			   			        	$(targetli[i]).css("background","#FFF");
//			   			        }
//			   			    }
			   			});
			   			$("#child>li>.ui.checkbox").checkbox();
			   			//单选
			   			$("#child>li>.ui.checkbox").click(function(){
			   				$("#child>li>.ui.checkbox").checkbox("uncheck");
			   				$(this).checkbox("check");
			   			})
			   		},
			   		error:function(){
			   			console.log("error");
			   		}
			   	 });
		}
	})
	//================添加取消拥有点击事件================
	$("#cancleOwner").click(function(){
		if($("#example>tbody>tr .ui.checkbox.checked").length<=0){
			alertokMsg("请先选择设备","确定");
			return false;
		}
		alertMsg("是否要解除选中设备的拥有者？","取消","确定","cancelOwner");
	})
	
	$("#example_wrapper .ui.grid .row:first-child").css({
		background:"#E7E7E7",
		padding:"0.7rem 1.5rem 0rem"
	});
	$("#example_filter label input").css({
		height:"0.4rem",
		borderRadius:"100px"
	});
	
	/*去掉input标签的search文本  */
/*	var div = $("#example_wrapper .ui.grid .row:first-child label").get(0),
	    childs = div.childNodes;
	for(var i = 0; i < childs.length; i++){
	    childs[i].nodeType === 3 && (childs[i].nodeValue = "\n");
	}*/
	
	var firstRow='<div class="row column eight " id="tit" >设备列表</div>';
	$("#example_wrapper .ui.grid .row:first-child ").before(firstRow);
	$("#tit").css({
		background:"#E7E7E7",
		color:"#000"
	});
	
	
	$("#example_wrapper .ui.grid .row:first-child").css({
		"border":"1px solid #7C7C7C",
		"borderBottom":"none"
	});
	$("#example_wrapper .ui.grid .row:eq(1)").css({
		"borderLeft":"1px solid #7C7C7C",
		"borderRight":"1px solid #7C7C7C"
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

/*定义表格*/
function tableFrame(){
	var  tableStr='<table class="ui compact celled definition table"  id="example">'+
		  '<thead class="full-width">'+
		    '<tr>'+
		      '<th class="firstColumn ">'+
		      '</th>'+
		      '<th class="normalColumn">设备名称'+
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+
		      '<th class="normalColumn">拥有者名称'+
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+
		      '<th class="normalColumn">关注者名称'+
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+
		      '<th class="smallColumn">类型'+
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+
		      '<th class="smallColumn">所在项目'+
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+	
		      '<th class="smallColumn">设备详细信息'+
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+			      
		      '<th class="smallColumn">数据统计'+
		      	'<div class="sortArrow fr" >'+
		      		 '<p><i class="caret up icon"></i><i class="caret down icon"></i></p>'+
		      	'</div>'+
		      '</th>'+				      
		      '<th class="normalColumn">状态'+
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
	
	loadDeviceList(1);
	reset_selectID();
	
	/* 检查在线状态 */
	 $("body").on("click","#viewOnlineStatus",function(){
		 
		 console.log(loadListId);
		 
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
		 
		 console.log(selected_ID);
		 
		 for(var j=0;j<selected_ID.length;j++){
			 deviceNameId[selected_ID[j].name] = selected_ID[j].id;
			 checkedId.push(selected_ID[j].id);
		 }
		 
    	 if(checkedId[0]==undefined){
    		 removeLoading();
    		 alertokMsg(getLangStr("deviceList_select_one"),getLangStr("alert_ok"));
    		 // $(".main .ui.inverted.icon.menu .item").eq(0).addClass("on");
    		 //$(".main .ui.inverted.icon.menu .item").eq(0).siblings().removeClass("on");
			 $(".contentTab").eq(0).addClass("on");
		     $(".contentTab").eq(0).siblings().removeClass("on");
    	 }else if(checkedId.length!=1){
    		 removeLoading();
    		 alertokMsg(getLangStr("deviceList_select_one_msg"),getLangStr("alert_ok"));
    	 }else{
    		 localStorage.setItem("checkedId",checkedId);
    		 localStorage.setItem("deviceNameId",JSON.stringify(deviceNameId));
    		 window.location.href += "?item=view";
    	 }
	 });
	
	/* 对比数据 */
	$("body").on("click","#viewDeviceDatas",function(){
		 
		 addLoading();
		
		 var deviceNameId={};
		 var checkedId=[];
		 
		 console.log(selected_ID);
		 
		 for(var j=0;j<selected_ID.length;j++){
			 deviceNameId[selected_ID[j].name] = selected_ID[j].id;
			 checkedId.push(selected_ID[j].id);
		 }
		 
    	 if(checkedId[0]==undefined){
    		 removeLoading();
    		 alertokMsg(getLangStr("deviceList_select_more"),getLangStr("alert_ok"));
    		 //$(".main .ui.inverted.icon.menu .item").eq(0).addClass("on");
    		 // $(".main .ui.inverted.icon.menu .item").eq(0).siblings().removeClass("on");
			 $(".contentTab").eq(0).addClass("on");
		     $(".contentTab").eq(0).siblings().removeClass("on");
    	 }else if(checkedId.length < 2){
    		 removeLoading();
    		 alertokMsg(getLangStr("deviceList_select_more_msg"),getLangStr("alert_ok"));
    	 }else{
    		 localStorage.setItem("checkedId",checkedId);
    		 localStorage.setItem("deviceNameId",JSON.stringify(deviceNameId));
    		 window.location.href += "?item=compare";
    	 }
	 });
	
	 /*跳转到下载数据页面  */
	$("body").on("click","#downloadDeviceData",function(){
	 
		 addLoading();
		
		 var deviceNameId=[];
		 var checkedId=[];
		 
		 console.log(selected_ID);
		 
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
    			 // $(".main .ui.inverted.icon.menu .item").eq(0).addClass("on");
    			 // $(".main .ui.inverted.icon.menu .item").eq(0).siblings().removeClass("on");
    			 $(".contentTab").eq(0).addClass("on");
    		     $(".contentTab").eq(0).siblings().removeClass("on");
    		 },300);
    		 
			 alertMsg(getLangStr("deviceList_relieve_ts"),getLangStr("alert_no"),getLangStr("alert_yes"),"showConfirm");

    		 /*alertokMsg(getLangStr("deviceList_download_list"),getLangStr("alert_ok"));*/
    	 }else{
    		 console.log(deviceNameId)
    		 localStorage.setItem("checkedId",checkedId);
    		 localStorage.setItem("deviceNameId",JSON.stringify(deviceNameId));
    		 window.location.href += "?item=download";
    	 }
	 });         
        });


//=================添加设备=================
$("#addDeviceButton").click(function(){
	var id = $("#addDeviceId").val();
	var name = $("#addDeviceName").val();
	var mac = $("#addDeviceMac").val();
	var type = $("#addDeviceType").val();
	$("#addDeviceError").empty();
	if(id==""){
		$("#addDeviceError").html("请输入id");
		return false;
	}else if(name==""){
		$("#addDeviceError").html("请输入设备名称");
		return false;
	}else if(mac==""){
		$("#addDeviceError").html("请输入mac地址");
		return false;
	}else if(type==""){
		$("#addDeviceError").html("请选择设备类型");
		return false;
	}
	var reg = /^\d+(.\d+)?$/;
	if(!reg.test(id)){
		$("#addDeviceError").html("设备id数据非法!请输入数字");
		return false;
	}
	var dataJson = {"name":name,"deviceid":id,"type":type,"physicalId":mac};
	$.ajax({
        type:"get",
        url:"/common/loading",
        dataType:"html",
        success:function(result){
        	var ele= $("body");
			if(ele.children(".loding-panel").length==0){
				ele.prepend(result);
				var loadingheight = $(".loding-icon i.icon").height();
				var loadingwidth = $(".loding-icon i.icon").width();
				$(".loding-icon").height(loadingheight);
				$(".loding-icon").width(loadingwidth);
				$(".loding-icon").css("margin-left",-(loadingwidth/2));
				$(".loding-icon").css("margin-top",-(loadingheight/2));
			}    
			setTimeout(function(){
				$.ajax({
			 		type:"post",
			 		dataType:"json",
			 		url:"/admin/device/add",
			 		async: false,
			 		data:dataJson,
			 		success:function(data){
			 			if(data.code==200){
			 				$("#addDeviceId").val("");
			 				$("#addDeviceName").val("");
			 				$("#addDeviceMac").val("");
			 				$("#addDeviceType").val("");
			 				$('.basic.test.modal.adddevice')
							.modal('setting', 'closable', false)
							.modal('hide');
			 				var insertid = data.id;
			 				devicelist.push({"id":insertid,"name":name,"userName":"","ownerName":"","gname":"","type":type,"statue":"false"}); 				
			 				loadDeviceList(1);
			 			}else{
			 				var errorcode = data.code;
							var errormsg = data.messg;
							alertokMsg(errormsg,"确定");
			 			}
			 			removeLoading()
			 		},
			 		error:function(data){
			 			removeLoading()
			 		}
			 	});
			},100)
        },
    	error:function(){
//			alert("error!");
		}
    });
	
})
//=================设置拥有者，确定=================
$("#confirmOwner").click(function(){
	//获取选中用户
	var checkedUserId = $("#child .ui.checkbox.checked").parent().data("id");
	var checkedUserName = $("#child .ui.checkbox.checked").siblings(".fl").html();
	if(!checkedUserId){
		alertokMsg("没有选择拥有者，无法设置！","确定");
		return false;
	}
		addLoading();
		setTimeout(function(){
			var checkbox = $("#example>tbody>tr .ui.checkbox.checked");
			var selectedDataLength = checkbox.length;
			var ajaxnum = 0;
			for(var i =0;i<checkbox.length;i++){
				var deviceid = $(checkbox[i]).attr("id");
				var $thisOwnerObj = $(checkbox[i]).parent().parent().find(".owner");
				var end = (i==(selectedDataLength-1));
				ajaxnum++;
				$.ajax({
			 		type:"post",
			 		dataType:"json",
			 		url:"/admin/device/set_owner",
			 		async: false,
			 		data:{"deviceID":deviceid,"userID":checkedUserId},
			 		success:function(data){
			 			if(data.code==200){
			 				ajaxnum--;
			 				$thisOwnerObj.html(checkedUserName);
			 				if(ajaxnum==0 && end){
			 					$('.basic.test.modal.addowner')
			 					.modal('setting', 'closable', false)
			 					.modal('hide');
			 					removeLoading();
			 					alertokMsg("设置成功","确定");
			 				}
			 			}else{
			 				var errorcode = data.code;
							var errormsg = data.messg;
							$('.basic.test.modal.addowner')
		 					.modal('setting', 'closable', false)
		 					.modal('hide');
		 					removeLoading();
							alertokMsg(errormsg,"确定");
			 			}
			 		},
			 		error:function(data){
			 			$('.basic.test.modal.addowner')
	 					.modal('setting', 'closable', false)
	 					.modal('hide');
			 			removeLoading()
			 		}
			 	});
			}	
		},10);
})
	
//=================解除拥有者=================
function cancelOwner(){
		addLoading();
		setTimeout(function(){
			var checkbox = $("#example>tbody>tr .ui.checkbox.checked");
			var ajaxnum = 0;
			for(var i=0;i<checkbox.length;i++){
				var deviceid = $(checkbox[i]).attr("id");
				var $thisOwnerObj = $(checkbox[i]).parent().parent().find(".owner");
				var end = (i==(checkbox.length-1));
				ajaxnum++;
				$.ajax({
			 		type:"post",
			 		dataType:"json",
			 		url:"/admin/device/del_owner",
			 		async: false,
			 		data:{"deviceID":deviceid},
			 		success:function(data){
			 			if(data.code==200){
			 				ajaxnum--;
			 				$thisOwnerObj.html("");
			 				if(ajaxnum==0 && end){
			 					removeLoading();
			 					alertokMsg("解除成功","确定");
			 				}
			 			}else{
			 				var errorcode = data.code;
							var errormsg = data.messg;
							alertokMsg(errormsg,"确定");
							removeLoading();
			 			}
			 		},
			 		error:function(data){
			 			removeLoading()
			 		}
			 	});
			}
		},10);
		
}


//未选中下载设备时候的弹窗
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
	   url:"/admin/device/status",
	   type:"POST",
	   data:{"deviceID":id},
	   success:function(response){
		   
		   console.log(response)
		   
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