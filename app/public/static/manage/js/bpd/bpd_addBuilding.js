var myChart = {num:10}
var globleData_send_temp;
var useMap = "mapbox";
var page = 1; // 当前页
var $ajaxFlag = true; // false为加载到最后一页
var $loadGif = '<img src="/public/static/manage/img/loading_2.gif">'; //loading图
var $resetImg = "/public/static/manage/img/logo.png"; //列表没有图片时的默认图片
var pageLock = false;//下拉刷新锁
//两个标志：地图页添加点时，加载慢阻塞页面操作。把下载数据弄成异步，加载地图在点击后再渲染。
var firstWatchMap = true;
var mapDataArr = [];
//先判断是显示建筑图文，还是显示地图	
var mode = $.cookie("buildingShowMode")==null?"list":$.cookie("buildingShowMode");
if(mode=="list"){
	$("#itemStyle>li[data-style=1]").addClass("active").siblings().removeClass("active");
	$("#list_container").removeClass("hide");
//	$this_box.addClass("item_list");
}else if(mode == "map"){
	$("#map_container").removeClass("hide");
	$("#itemStyle>li[data-style=3]").addClass("active").siblings().removeClass("active");
	if(globleData_send_temp==null || globleData_send_temp!=globleData_send){//只有第一次点击的时候执行
		globleData_send_temp = globleData_send;
		firstWatchMap = false;
		initMapMain();
	}
}
$(function () {	
   
	// 设置下拉框最近的年份
	var dd = new Date();
	$thisYear = dd.getFullYear();
	$("#completionTime").children("option:eq(0)").after('<option value="2016-'+ $thisYear +'">2016-'+ $thisYear +'</option>');
	
	// 默认加载数据
	getData();

	// 下拉加载
	$(".main_box_a").scroll(function(){
		console.log("$('.main_box_a').scrollTop():"+$(".main_box_a").scrollTop());
		console.log('$(".main_box_container").height()-$(window).height()+60:'+($(".main_box_container").height()-$(window).height()+60));
		if($(".main_box_a").scrollTop() >= ($(".main_box_container").height()-$(window).height()+60)){
			if(!pageLock){
				page++;
				pageLock = true;
				getData();
			}
		}
	});
	//顶部切换到地图
	$("#redirectToMap").click(function(){
		$("#itemStyle>li[data-style=3]").addClass("active").siblings().removeClass("active");
		$("#map_container").removeClass("hide");
		$("#list_container").addClass("hide");
		if(globleData_send_temp==null || globleData_send_temp!=globleData_send){//只有第一次点击的时候执行
			globleData_send_temp = globleData_send;
			firstWatchMap = false;
			initMapMain();
		}
	})
	// 切换搜索结果的显示样式
	$("#itemStyle").children("li").click(function(){
		var $this_style = $(this).data("style");
		var $this_box = $("#itemList");

		$("#itemStyle").children("li").removeClass("active");
		$(this).addClass("active");

		if($this_style == 2){
			$("#list_container").removeClass("hide");
			$("#map_container").addClass("hide");
			$this_box.addClass("item_list_2").removeClass("item_list item_list_3");
		}else if($this_style == 1){
			$("#list_container").removeClass("hide");
			$("#map_container").addClass("hide");
			$this_box.addClass("item_list").removeClass("item_list_2 item_list_3");
		}else if($this_style == 3){
			$("#list_container").addClass("hide");
			$("#map_container").removeClass("hide");
			if(globleData_send_temp==null || globleData_send_temp!=globleData_send){//只有第一次点击的时候执行
				globleData_send_temp = globleData_send;
				firstWatchMap = false;
				initMapMain();
			}
		}
	});

	// 全部搜索
	$("#searchBtn").click(function(){
		$("#itemList").html(""); // 搜索之后先清空 
		page = 1;
		$ajaxFlag = true;
		getData();
	});

	// 筛选搜索
	$("#checkButton").click(function(){
		$("#itemList").html(""); // 搜索之后先清空 
		page = 1;	
		$ajaxFlag = true;
		getData();

	});

	// 建筑跳转
	$(document).on("click",".items",function(){
		var $loadBuildID = $(this).attr("id");
		$.cookie("building",$loadBuildID,{ path: "/"});
		$.cookie("building-do","update",{ path: "/"});
		$.cookie("isgbd","0");
		$("#btn_turn").trigger("click");
		$("#iframe_url").height($(window).height()*0.9);
		$("#iframe_url").attr("src","/gbd_detail");
//		addLoading();
	});
	//新增建筑
	$(document).on("click","#addBuilding",function(){
		addBuilding();
	})
	$(document).on("click","#buildingclass1",function(){
		$.cookie("building","",{ path: "/"});
		$.cookie("building-do","add1",{ path: "/"});
		$("#btn_turn").trigger("click");
		$("#iframe_url").height($(window).height()*0.9);
		$("#iframe_url").attr("src","/gbd_detail");
	})
	$(document).on("click","#buildingclass2",function(){
		$.cookie("building","",{ path: "/"});
		$.cookie("building-do","add2",{ path: "/"});
		$("#btn_turn").trigger("click");
		$("#iframe_url").height($(window).height()*0.9);
		$("#iframe_url").attr("src","/gbd_detail");
	})
	
	// 上传模板 弹出隐藏层
	$(".import-building-group>.importbuilding").click(function(){
		
		if($(this).hasClass("buildingclass1")){
			$("#importBuildingType").html("公共建筑");
			$("#importBuildingType").data("type","gg");
		}else if($(this).hasClass("buildingclass2")){
			$("#importBuildingType").html("居住建筑")
			$("#importBuildingType").data("type","jz");
		}else if($(this).hasClass("buildingclass3")){
			$("#importBuildingType").html("公共建筑")
			$("#importBuildingType").data("type","gg_bjsjw");
		}else if($(this).hasClass("buildingclass4")){
			$("#importBuildingType").html("居住建筑")
			$("#importBuildingType").data("type","jz_bjsjw");
		}
		$("#buildUploadPopover").modal('show');	
		//将弹出框设置为对应的建筑类别
	});
	//上传模板中，下拉框的事件
	$("#buildUploadPopover").on("click",".dropdown-menu>li>a",function(){
		$("#importBuildingType").html($(this).html());
		$("#importBuildingType").data("type",$(this).data("type"));
	})
	// 上传模板,提交按钮事件
	$("#UpLoadFileButton").click(function(){
		var isOffice;
		var ajaxUrl = "";
		var type;
		
		if($("#importBuildingType").data("type")=="gg"){
			type = "gg_";
			ajaxUrl = "/building/gbd/importOfficeBuilding";
		}else if($("#importBuildingType").data("type")=="jz"){
			type = "jz_";
			ajaxUrl="/building/gbd/importBuilding";
		}else if($("#importBuildingType").data("type")=="gg_bjsjw"){
			type = "gg_bjsjw";
			ajaxUrl="/building/gbd/importBjsjwOfficeBuilding";
		}else if($("#importBuildingType").data("type")=="jz_bjsjw"){
			type = "jz_bjsjw";
			ajaxUrl="/building/gbd/importBjsjwBuilding";
		}else{
			console.log("类型出错！请先修改JS中的代码~ 调试专用提示！","确定");
			return;
		}
		UpLoadFile(ajaxUrl,type);
	});
	
});
//新增建筑
function addBuilding(){
	$(".buildingclass1,.buildingclass2,.buildingclass3,.buildingclass4").slideDown();
}
function redirectToAdd(){
	
}
// ajax加载数据
function getData(pageNo){
/* 	console.log(page);  */
	if(pageNo!=null) page = pageNo;
	if(pageNo ==1){$("#itemList").empty();}
	$ajaxFlag = true;
	if(!$ajaxFlag){
		return;
	}
	if(globleData_send==null)globleData_send = "";
	$("#loading").html($loadGif);
	$.ajax({
		url:"/building/gbd/searchBuilding",
		type:"POST",
		data:{
				pageNo:page,
				conditions:globleData_send
//				key:$("#searchText").val(),
//				buildingClass:$("#buildingClass").val(),
//				climaticProvince:$("#climaticProvince").val(),
//				city:$("#city").val(),
//				identifying:$("#identifying").val(),
//				level:$("#level").val(),
//				completionTime:$("#completionTime").val(),
//				buildingArea:$("#buildingArea").val(),
//				buildingOrientation:$("#buildingOrientation").val(),
//				cun:$("#cun").val(),
//				erStandard:$("#erStandard").val()
			},
		success:function(data){
			$("#num>span").html(data.page.amount);
			console.log(data);
			
			if(data.code == 200){
				showListData(data);
			}
			//下拉刷新解锁			
			pageLock = false;
		},
		error:function(error){
			//alert("系统出错，请刷新重试！");
			console.log(error.status);
		}
	});
}
function showListData(data){
	//	如果是第一页，清空数据
	if(page==1){
		$("#itemList").html("");
	}
	var $maxCount = data.page.amount;
	$("#maxCount").text($maxCount);
	$("#num>span").html($maxCount);
	
	if(data.page.list.length==0){
		$("#loading").html("<p>没有更多数据</p>");
		$ajaxFlag = false;
		return;
	}else{
		$("#loading").html("");
	}
	
	var appendStr = '';
	for(var i=0;i<data.page.list.length;i++){
		var $this_data = data.page.list[i];
		appendStr += getOneBuildingHtml($this_data);
	}
	$("#itemList").append(appendStr);
}
function UpLoadFile(ajaxUrl,type) {
	
	var formData = new FormData($("#fileUpLoad")[0]);
	var this_val = $("#building_file").val();
	var $thisStr = this_val.split("\\");
	$thisStr = $thisStr[$thisStr.length-1].substring(0,3);
	
	if(this_val.length==""){
		alert("请先选择文件");
		return;		
	}
//	else if($thisStr != type){
//		alert("文件名格式不对");
//		return;
//	}
	addLoading();
	$.ajax({
		url: ajaxUrl,
		type: "POST",
		data: formData,
		async: false,
		cache: false,
		contentType: false,
		processData: false,
		success: function(data) {
			//alert("导入成功");
			//location.reload();
			if(data.code == 200) {
				alert("导入模板建筑成功！");
				window.location.href="/buildings";
				
			} else if(data.code == 1005)  {
				alert("导入失败！模板信息格式不对");
				//alertokMsg(getLangStr("import_building_messg3"),getLangStr("determine"));
			} else if(data.code == 1001){
				alert("件类型不对，请重试");
				//alertokMsg(getLangStr("import_building_messg4"),getLangStr("determine"));
			}else if(data.code == 1007){
				alert("文件格式不对");
				//alertokMsg(getLangStr("import_building_messg5"),getLangStr("determine"));
		}
			removeLoading();
		},
		error: function(e) { 
			removeLoading();
			alert("网络繁忙！");
		}
	});
	
}
function getOneBuildingHtml($this_data){
	var building = {};
	building.id = $this_data[0];
//	if($this_data[2]==null||$this_data[2]==""||$this_data[2]=="null"){
		building.describe = "暂无描述";
//	}
	
	// 截取image字段的第一张图片					
	if($this_data[3]==null||$this_data[3]==""||$this_data[3]=="null"){
		building.image = $resetImg; //默认图片
	}else{
		$imgArr = $this_data[3].split(",");
		building.image = $imgArr[0];
	}
	building.name = $this_data[1];
	return '<div class="col-lg-6 col-md-12 col-sm-12 items" id="item_'+ building.id +'">'+
					'<img src="'+ building.image +'" class="item_pic">'+
					'<div class="item_intro">'+
						'<h4>'+ building.name +'</h4>'+
						'<p>'+ building.describe +'</p>'+
						'<div class="btn btn-default btn-xs btn-item">查看详情</div>'+
					'</div>' +
				'</div>'
}
function addOneBuilding($this_data){
	var appendStr = getOneBuildingHtml($this_data);
	$("#itemList").prepend(appendStr);
}

function initMapMain(){
	if(useMap=="mapbox"){
		mapboxMap.initMapbox();
	}else if(useMap=="highmaps"){
		myMap.initMap();
	}	
}
