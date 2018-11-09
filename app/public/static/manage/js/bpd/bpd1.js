// 每次点击之后保存数据到对应的数组，最后转换成字符串发送给后台
var globleData_1 = [];
var globleData_2 = [];
var globleData_3 = [];
var globleData_4 = [];
var globleData_5 = [];
var globleData_6 = [];
var globleData_send = "";
// 是否有筛选条件
var $data_yes = "<h5>已筛选条件：</h5>";
var $data_no = "<h5>请点击导航进行条件筛选！</h5>";

$(function(){
	
	// 模态框隐藏的时候更新图表
	$(".modal").on('hide.bs.modal', function () {
		var $this_modal = $(this).attr("id");
		updataDatas($this_modal);
	});
	
	// bootstrap单选框、多选框插件
	$('input').iCheck({
		checkboxClass: 'icheckbox_flat-green',
		radioClass: 'iradio_flat-green'
	});
	
	// 更新筛选条件
	$(".iCheck-helper").on("mouseup",function(e){
		// 方法重定义
		if($(this).parents(".col-box").find(".col-float").length != 0){ 
			if($(this).parents(".col-box").find(".col-float").length !=2){ // 只有两个的时候为单选
				if($(this).parents(".iradio_flat-green").hasClass("checked")){
					$(this).parents(".iradio_flat-green").removeClass("checked");
				}else{
					$(this).parents(".iradio_flat-green").addClass("checked");
				}			
			}
		}		
	});
	  
	// 条件筛选	
	$("#res_check .list_nav").click(function(){
		var num = Number($(this).parents("li").index() + 1);
		var $mod = $('#myModal_'+num);
		$mod.modal();
	});
	
	// 跳转到指定的条件
	$(".glyphicon_select").on("click",".label-color",function(e){
		if(e.target.closest("i")==null){
			var $mod = $(this).data("target");
			var $offset = $(this).data("offset");
			var $this_item = $("#" + $mod);
			$this_item.modal();
			
			var $check_id = $("#" + $offset);
			setTimeout(function(){
				$this_item.find(".modal-content").animate({"scrollTop":0},10);
				
				setTimeout(function(){
					$check_id.removeClass("line_change_h").addClass("line_change");
					$this_item.find(".modal-content").animate({"scrollTop":$check_id.offset().top - 40});					
				},20);

				setTimeout(function(){
					$check_id.addClass("line_change_h");
				},3000);
			},500);
		}	
	});

	// 删除已经删选的条件
	$(".glyphicon_select").on("click","i",function(){

		var $delect_id = $(this).parents(".label-color").data("offset");
		var $this_modal = $(this).parents(".label-color").data("target");
		
		$(this).parents(".label-color").hide();
		$("#"+$delect_id).find(".icheckbox_flat-green").removeClass("checked");
		$("#"+$delect_id).find(".iradio_flat-green").removeClass("checked");
		
		setTimeout(function(){
			updataDatas($this_modal);
		},400);
		
	});
	
	// 导航切换已选中的参数 
	$("#res_check li").hover(function(){
		$(this).find(".glyphicon_select").show();
	},function(){
		$(".glyphicon_select").hide();
	});
	
	//跳转到地图
	$("#redirectToMap").click(function(){
		$.cookie("buildingShowMode","map");
	})
	//跳转到新增建筑
	$("#redirectToBuildings").click(function(){
		$.cookie("buildingShowMode","list");
	})
	
});

// 更新左侧导航的已选项
function setHtml(id,globleData){
	$list_str = "";
	var $length = globleData.length;
	if($length==0){
		$("#glyphicon_select_"+id).html($data_no);
		$("#glyphicon_select_"+id).parents("li").find(".glyphicon_l").css("visibility","hidden");
	}else{
		$("#glyphicon_select_"+id).parents("li").find(".glyphicon_l").css("visibility","visible");
		
		for(var i=0;i<$length;i++){
			$list_str += '<span class="label label-color" data-target="myModal_'+ id +'" data-offset="'+ globleData[i].id +'">'+ globleData[i].key + globleData[i].val +'<i>&times;</i></span>';
		}
		$("#glyphicon_select_"+id).html($data_yes + $list_str);
	}	
}



// 合并数据并进行整理
function updataDatas($this_modal){
	
		var addData = [];
		var $mod_box = $("#" + $this_modal).find(".icheckbox_flat-green.checked");
		var $col_len = $mod_box.length;
		
		for(var i=0;i<$col_len;i++){
			var $id = $mod_box.eq(i).parents(".row").attr("id");
			var $key = $mod_box.eq(i).next("label").text();
			var $select_list = $("#"+$id).find(".col-box").find(".col-float").length;
			var $select_list_checked = $("#"+$id).find(".col-box").find(".iradio_flat-green.checked");
			var $select_val = [];
			var $select_length = $select_list_checked.length;
			
			if($select_list==0){ //滑条
				if($("#"+$id).data("min")!=undefined && $("#"+$id).data("max")!=undefined){
					var min = $("#"+$id).data("min");
					var max = $("#"+$id).data("max");
					addData.push({id:$id,key:$key,val:min + "-" + max});
				}
			}else{ //选择
				if($select_length!=0&&$select_length!=undefined){
					for(var k=0;k<$select_length;k++){
						$select_val.push($select_list_checked.eq(k).next("label").text());
					}		
					addData.push({id:$id,key:$key,val:$select_val});
				}
			}
		}
		
		if($this_modal=="myModal_1"){
			globleData_1 = addData;
			setHtml(1,globleData_1);
		}else if($this_modal=="myModal_2"){
			globleData_2 = addData;
			setHtml(2,globleData_2);
		}else if($this_modal=="myModal_3"){
			globleData_3 = addData;
			setHtml(3,globleData_3);
		}else if($this_modal=="myModal_4"){
			globleData_4 = addData;
			setHtml(4,globleData_4);
		}else if($this_modal=="myModal_5"){
			globleData_5 = addData;
			setHtml(5,globleData_5);
		}else if($this_modal=="myModal_6"){
			globleData_6 = addData;
			setHtml(6,globleData_6);
		}
	
		var globleData = {};
		var resetData = globleData_1.concat(globleData_2,globleData_3,globleData_4,globleData_5,globleData_6);

		for (var i in resetData){
			globleData[resetData[i].id] = resetData[i].val;
		}
		
		globleData = JSON.stringify(globleData);
		updateCharts(globleData);
}

// 更新页面数据
function updateCharts(globleData,globleNumber){
	if(globleData_send == globleData){
		console.log("数据相同，不发送请求~~~~~~");
		return;
	}else{
		globleData_send = globleData;
	}
	console.log("发送数据，更新图表~~~~~~");
	globleData_send = globleData;
	getData(1);
	//更新地图
	if(!firstWatchMap){
		mapboxMap.getData();
	}
	
//	$.ajax({
//		url:"/building/gbd/searchBuilding",
//		type:"POST",
//		data:sendAjaxData,
//		success:function(data){
//			console.log("返回数据成功————————————");
//			console.log(data);
//			if(data.code==200){
//				//判断当前是图文，列表，地图哪个模式				
//				showChart(data);
//			}
//		},
//		error:function(error){
//			console.log("返回数据失败");
//		}
//	});

}
