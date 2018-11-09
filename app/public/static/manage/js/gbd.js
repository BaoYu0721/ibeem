var page = 1; // 当前页
var $ajaxFlag = true; // false为加载到最后一页
var $loadGif = '<img src="/public/static/manage/img/loading_2.gif">'; //loading图
var $resetImg = "/public/static/manage/img/logo.png"; //列表没有图片时的默认图片

$(function () {

	// 设置下拉框最近的年份
	var dd = new Date();
	$thisYear = dd.getFullYear();
	$("#completionTime").children("option:eq(0)").after('<option value="2016-'+ $thisYear +'">2016-'+ $thisYear +'</option>');
	
	// 默认加载数据
	getData(page);

	// 下拉加载
	$(window).scroll(function(){
		if($(document).scrollTop() == $(document).height() - $(window).height()){
			page++;
			getData(page);
		}
	});

	// 切换搜索结果的显示样式
	$("#itemStyle").children("li").click(function(){
		var $this_style = $(this).data("style");
		var $this_box = $("#itemList");

		$("#itemStyle").children("li").removeClass("active");
		$(this).addClass("active");

		if($this_style == 2){
			$this_box.addClass("item_list_2").removeClass("item_list");
		}else if($this_style == 1){
			$this_box.addClass("item_list").removeClass("item_list_2");
		}
	});

	// 全部搜索
	$("#searchBtn").click(function(){
		$("#itemList").html(""); // 搜索之后先清空 
		page = 1;
		$ajaxFlag = true;
		getData(page);
	});

	// 筛选搜索
	$("#checkButton").click(function(){
		$("#itemList").html(""); // 搜索之后先清空 
		page = 1;	
		$ajaxFlag = true;
		getData(page);

	});

	// 建筑跳转
	$(document).on("click",".items",function(){
		var $loadBuildID = $(this).attr("id");
		$.cookie("building",$loadBuildID);
		$.cookie("isgbd","1");
		$("#btn_turn").trigger("click");
		$("#iframe_url").height($(window).height()*0.9);
		$("#iframe_url").attr("src","/gbd_detail");

	});
});

// ajax加载数据
function getData(page){
/* 	console.log(page);  */
		
	if($ajaxFlag == false){
		return;
	}
	
	$("#loading").html($loadGif);
	$.ajax({
		url:"/building/searchBuilding",
		type:"POST",
		data:{
				pageNo:page,
				key:$("#searchText").val(),
				buildingClass:$("#buildingClass").val(),
				climaticProvince:$("#climaticProvince").val(),
				city:$("#city").val(),
				identifying:$("#identifying").val(),
				level:$("#level").val(),
				completionTime:$("#completionTime").val(),
				buildingArea:$("#buildingArea").val(),
				buildingOrientation:$("#buildingOrientation").val(),
				cun:$("#cun").val(),
				erStandard:$("#erStandard").val()
			},
		success:function(data){
			console.log(data);
			
			if(data.code == 200){
				
				var $maxCount = data.page.amount;
				$("#maxCount").text($maxCount);
				
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
					
					if($this_data.describe==null||$this_data.describe==""||$this_data.describe=="null"){
						$this_data.describe = "暂无描述";
					}
					
					// 截取image字段的第一张图片					
					if($this_data.image==null||$this_data.image==""||$this_data.image=="null"){
						$this_data.image = $resetImg; //默认图片
					}else{
						$imgArr = $this_data.image.split(",");
						$this_data.image = $imgArr[0];
					}
					
					appendStr += '<div class="col-lg-6 col-md-12 col-sm-12 items" id="item_'+ $this_data.id +'">'+
									'<img src="'+ $this_data.image +'" class="item_pic">'+
									'<div class="item_intro">'+
										'<h4>'+ $this_data.name +'</h4>'+
										'<p>'+ $this_data.describe +'</p>'+
										'<div class="btn btn-default btn-xs btn-item">查看详情</div>'+
									'</div>' +
								'</div>'
				}
				$("#itemList").append(appendStr);
			}
			
		},
		error:function(error){
			//alert("系统出错，请刷新重试！");
			console.log(error.status);
		}
	});



}