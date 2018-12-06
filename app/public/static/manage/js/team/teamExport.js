$(function(){
	$('.ui.checkbox').checkbox();
	
	// 获取设备列表
	var d_list = '';
	$.ajax({
		url:'/admin/export/device_list',
		type:'post',
		dataType:'JSON',
		success:function(data){
			if(data.code==200){
				for(var i=0;i<data.arrayList.length;i++){
					var $dd = data.arrayList[i];
					d_list += '<div class="ui checkbox item" data-id="'+ $dd.id +'" data-name="'+ $dd.name +'"><input type="checkbox"><label>'+ $dd.name +'</label></div>';
				}
				
				$("#list_item").html(d_list);
				$('#list_item .ui.checkbox').checkbox();
				
				// 设备列表获取成功之后加载滚动条
				$("#list_item,.list_box").perfectScrollbar({
					cursorcolor: "#47b391",
					cursorwidth: 8,
				});
			}else{
				alertokMsg("系统繁忙，请刷新重试~","确定");
			}
		},
		error:function(err){
			alertokMsg("系统繁忙，请刷新重试~","确定");
		}
	});
	
	// 历史工单
	updateHistory();
	
	// 全选
	$("#check_all").click(function(){
		if($(this).hasClass("checked")){
			$("#list_item .item").checkbox("check");
		}else{
			$("#list_item .item").checkbox("uncheck");
		}
	});
	
	// 获取下载列表宽度
	var $list_width = $(".main").width() - $(".list_name").width() - 80;
	$(".list_result").width($list_width);
	
	var $time = new Date();
	$time = $time.getTime();
	$time = $time - 1000 * 60 * 60 * 24 * 365;
	
	var $mintime = new Date($time);
	// 时间选择插件
	$('.form_datetime').datetimepicker({
		lang:'ch',
		timepicker:false,
		todayButton:false,
		format:'Y-m-d',
		formatDate:'Y-m-d',
		minDate:$time,
		maxDate:$("#endTime").val()
    });
	
	// 确认下载
	$("#download").click(function(){
		// 判断时间是否正确
		var startTime = new Date($("#startTime").val());
		var endTime = new Date($("#endTime").val());
		startTimeStamp = startTime.getTime();
		endTimeStamp = endTime.getTime();
		
		if(isNaN(startTimeStamp)||isNaN(endTimeStamp)){
			alertokMsg("开始时间和结束时间不能为空","确定");
			return;			
		}
		
		if(startTimeStamp>endTimeStamp){
			alertokMsg("开始时间不能大于结束时间","确定");
			return;
		}
		
		// 遍历已经筛选的设备
		var arr_id = [];
		var arr_name = [];
		for(var i=0,len=$("#list_item .item").length;i<len;i++){
			var $this = $("#list_item .item").eq(i);
			if($this.hasClass("checked")){
				arr_id.push($this.data("id"));
				arr_name.push($this.data("name"));
			}
		}
		
		if(arr_id.length==0){
			alertokMsg("请先选择设备","确定");
			return;
		}
		
		var str_id = arr_id.join(",");
		var str_name = arr_name.join(",");
		var time_start = $("#startTime").val();
		var time_end = $("#endTime").val();
		
		// 添加工单
		$.ajax({
			url:'/admin/addPretreatmentWorkOrder',
			type:'post',
			dataType:'JSON',
			data:{
				deviceName:str_name,
				ids:str_id,
				startTime:time_start,
				endTime:time_end
			},
			success:function(data){
				//console.log(data);
				updateHistory();
			},
			error:function(err){
				alertokMsg("添加工单失败，请刷新重试~","确定");
			}
		});
	});
	
	// 搜索
	$("#search_button").click(function(){
		var $value = $("#search_keywords").val();
		var visibleFlag = 0;
		$("#list_item .item").hide();
		for(var i=0,len=$("#list_item .item").length;i<len;i++){
			var $this = $("#list_item .item").eq(i);
			var name = String($this.data("name"));
			if(name.indexOf($value)!=-1){
				$this.show();
				visibleFlag++
			}
		}
		
		if(visibleFlag==0){
			$("#list_item").append('<div id="list_msg" style="text-align:center;font-size:14px;color:#666666;">没有相关设备</div>');
			$("#list_msg").show();
		}else{
			$("#list_msg").hide();
		}
		
	});
	
	// 查看更多设备
	$("body").on("click",".readMore",function(){
		var thisID = $(this).data("id");
		var thisHtml = total[thisID].res;
		$("#td_" + thisID).html(thisHtml);
		$(this).hide();
		$("#list_item,.list_box").perfectScrollbar("update");
	});
	
});

// 下载历史工单
function updateHistory(){
	$.ajax({
		url:'/admin/export/work_order',
		type:'post',
		dataType:'JSON',
		success:function(data){
			if(data.code==200){
				var tab_str = "";
				var status = "";
				var s_time = "";
				var e_time = "";
				var action = "";
				total = [];
				
				for(var i=0,len=data.list.length;i<len;i++){
					var $this_item = data.list[i];

					if($this_item.status==0){
						status = "等待执行";
						action = "无法进行其他操作"
					}else if($this_item.status==1){
						status = "已完成";
						action = "<a href='"+ $this_item.url +"' target='_blank'>下载</a>";
					}else if($this_item.status==2){
						status = "创建失败";
						action = "无法进行其他操作"
					}else if($this_item.status==3){
						status = "正在执行";
						action = "无法进行其他操作"
					}
					
					var nameStr = $this_item.deviceName;
					var nameArr = nameStr.split(",");
					var nameRes = '';
					var nameResSmall = '';
					var list = {};
					var readMore = '';
					var this_index = len - i - 1;
					
					for(var k=0;k<nameArr.length;k++){		
						
						if(k < 10){
							if(k!=0 && k%4 == 0 ){
								nameResSmall += "<br />" + nameArr[k] + ",";
							}else if(k == nameArr.length - 1){
								nameResSmall += nameArr[k];
							}else{
								nameResSmall += nameArr[k] + ",";
							}							
						}else{
							readMore = "&nbsp;&nbsp;&nbsp;<a class='readMore' data-id='"+ this_index +"'>查看所有</a>"
						}
						
						if(k!=0 && k%4 == 0 ){
							nameRes += "<br />" + nameArr[k] + ",";
						}else if(k == nameArr.length - 1){
							nameRes += nameArr[k];
						}else{
							nameRes += nameArr[k] + ",";
						}
						
						list.resSmall = nameResSmall;
						list.res = nameRes;
						list.id = "td_" + this_index;
					}
					total.unshift(list);
					
					console.log(total);
					
					s_time = $this_item.startTime.substring(0,10);
					e_time = $this_item.endTime.substring(0,10);
					
					var per = $this_item.percentage * 100;
					per = per.toFixed(1);
					
					tab_str = "<tr><td>"+ $this_item.id + "</td>"+
									"<td id='td_" + this_index +"'>"+ nameResSmall + readMore +"（共"+ nameArr.length +"个）</td>"+
									"<td>"+ s_time +"<br />"+ e_time +"</td>"+
									"<td>"+ $this_item.createdTime +"</td>"+
									"<td>"+ status +"</td>"+
									"<td>"+ per +"%</td>"+
									"<td>"+ action +"</td></tr>" + tab_str;
				}
				
				
				
				
				$("#list_result tbody").html(tab_str);
				table = $('#list_result').DataTable( {
				     	 retrieve: true,
		           		 searching: false,
		           		 ordering:  false,
		           		 info:false,
		           		 aLengthMenu: [20],
		           		 lengthChange:false,
	           		 	 oLanguage: {
	           				"oPaginate": {
	           				"sFirst":  "第一页",
	           				"sPrevious": " 上一页 ",
	           				"sNext":   " 下一页 ",
	           				"sLast":   " 最后一页 "
           					}
	           		 	}
					});

			}else{
				alertokMsg("查询历史工单失败，请刷新重试~","确定");
			}
		},
		error:function(err){
			alertokMsg("查询历史工单失败，请刷新重试~","确定");
		}
	});
}