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
$("#buildingname").html(buildingName)

// 定义flag 避免重复提交
var downloadFlag = "true";
var citySelectFlag = "false";

// 定义更新各个sheet的ID
var b_id;
var c_id;
var d_id;
var e_id;
var f_id;

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

$(function(){
	
	addLoading();
	
	// 导航切换
	$("#build-menu .item").tab();
	
	// 导航中英文样式
	 var $this_language = localStorage.getItem("language");
  	 console.log($this_language);
  	 if($this_language=="en"){
  		 $(".ui.secondary.pointing.menu>.item, .ui.secondary.pointing.menu>.menu>.item").css("display","block");
  		 $(".ui.secondary.pointing.menu").css("border-bottom","none");
  		 $(".building-box .b-list .ui.labeled.input").css("width","100%");
  	 }
	
	
	// 获取建筑信息
	getBuildingInfo(buildingID);
	
	// 建筑信息下拉选项卡
	$(".dropdown").dropdown();
	
	/* 编辑 以及 取消编辑模式
	 * 	$(".building-box .b-list .ui.labeled.input input").attr("disabled","true"); // 退出编辑模式
	 *	$(".building-box .b-list .ui.labeled.input input").removeAttr("disabled"); // 编辑模式
	 *
	*/
	
	// 选择城市隐藏层
	$("#open_select_box1").click(function(){
		citySelectFlag = "true";
		$(this).hide();
		$("#box_select,#open_select_box2").show();
	});

	$("#open_select_box2").click(function(){
		citySelectFlag = "false";
		
		// 清空下拉菜单选择的城市
		$("#selectCity option[value=-1]").attr("selected", true); 
		$("#selectCity option[value!=-1]").removeAttr("selected"); 
		$("#selectProvince option[value=-1]").attr("selected", true);
		$("#selectProvince option[value!=-1]").removeAttr("selected");
		
		$("#open_select_box1").show();
		$("#box_select,#open_select_box2").hide();
	});
	
	// 时间选择器
	$(".form_datetime_choice").datetimepicker({
			lang:'ch',
			timepicker:false,
			todayButton:false,
			format:'Y-m-d',
			formatDate:'Y-m-d',
	});
	
	// 上传图片
	$("body").on("click","#b-pic-add",function(){
		$("#picUploadPopover").modal('show');	
	});
	
	$("#UpLoadFileButton").click(function(){
		var formData = new FormData($("#fileUpLoad")[0]);

		$.ajax({
			url: "/imageupload",
			type: "POST",
			data: formData,
			async: false,
			cache: false,
			contentType: false,
			processData: false,
			success: function(data) {
				console.log(data);
				console.log(data.imageList[0].imageurl);
									
				if(data.code == 200) {
					
					/*if(imageAll!=''||imageAll==null){
						imageAll = data.imageList[0].imageurl;
					}else{
						imageAll = imageAll + "," + data.imageList[0].imageurl;
					}*/
					
					if(imageAll==''||imageAll == null){
						imageAll = data.imageList[0].imageurl;
					}else{
						imageAll = imageAll + "," + data.imageList[0].imageurl;
					}
					
					var image_box = [];
					var html_str = "";
					image_box = imageAll.split(",");
					
					console.log(image_box);
					
					for(var i=0;i<image_box.length;i++){
						console.log(image_box[i])
						
						if(image_box[i]!=""){
							html_str += '<div class="ui left floated image b-pic-img">'+
										  		'<a class="ui left red corner label b-pic-img-list"><i class="remove icon"></i></a>'+
										  		'<img src="'+ image_box[i] +'">'+
										'</div>';
						}
						
					}
					
					$("#b-pic").html("");
					
					html_str = html_str + '<div class="ui left floated image b-pic-img b-pic-add" id="b-pic-add">'+
								  				'<i class="add icon" style="font-size:48px;"></i>'+
								  		  '</div>';
					
					$("#b-pic").html(html_str);
					isPicFull();
					console.log(imageAll);
					
					alertokMsg(getLangStr("teamBdate_msg_1"),getLangStr("alert_ok"));
				}
			},
			error: function(e) { // 
				
			}
		});
	});
	
	// 删除图片
	$("body").on("click",".b-pic-img-list",function(){

		var del_index = $(this).parent(".b-pic-img").index();
		
		var image_box_del = [];
		var html_str_del = '';
		
		
		image_box_del = imageAll.split(",");
		image_box_del.splice(del_index,1);
		
		console.log(image_box_del);
		
		for(var i=0;i<image_box_del.length;i++){
			html_str_del += '<div class="ui left floated image b-pic-img">'+
						  		'<a class="ui left red corner label b-pic-img-list"><i class="remove icon"></i></a>'+
						  		'<img src="'+ image_box_del[i] +'">'+
						'</div>';
		}
		
		imageAll = '';
		imageAll = image_box_del.join(",");
		console.log(imageAll);
		
		$("#b-pic").html("");
		
		html_str_del = html_str_del + '<div class="ui left floated image b-pic-img b-pic-add" id="b-pic-add">'+
							  				'<i class="add icon" style="font-size:48px;"></i>'+
							  		  '</div>';
		
		$("#b-pic").prepend(html_str_del);
		isPicFull();
		alertokMsg(getLangStr("teamBdate_msg_2"),getLangStr("alert_ok"));
	})
});

// 判断图片数量
function isPicFull(){
	if($(".b-pic-img-list").length>2){
		$("#b-pic-add").hide();
	}else{
		$("#b-pic-add").show();
	}
}

// 导出模板 
$("#buildTempOut").click(function(){
	if(downloadFlag == "true"){
//		addLoading();
		downloadFlag = "false";
		downLoadBuilding(buildingID);
	}else{
		return;
	}
	
	setTimeout(function(){ // 避免重复提交
		downloadFlag = "true";
	},1000);

});

// 导出模板方法
function downLoadBuilding(bid){
	window.location.href= "/admin/exportBuilding?buildingID=" + bid; 
	/*$.ajax({
		url:"/admin/exportBuilding",
		type:"POST",
		datatype:"JSON",
		data:{"buildingID": bid },
		success:function(response){

			console.log(response);
			
			if(response.code == 200){
				//window.location.href= response.url
			}else{
				alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
			}
			
			removeLoading();
			
		},
		error:function(msg){
			removeLoading();
		}
	});*/
}

// 默认数据加载
function getBuildingInfo(bid){
	
	$.ajax({
		url:"/admin/getBuildingInfo?buildingID=" + bid, // buildingID=221;220;
		type:"GET",
		datatype:"JSON",
		success:function(response){

			console.log(response)
			
			if(response.code == 200){
				var sheet_1 = response.building; // 基本信息
				var sheet_2 = response.building.designIndicators; // 关键设计评价指标
				var sheet_3 = response.building.ecm; // 节能措施
				var sheet_4 = response.building.indoorEnvironment; // 室内环境措施
				var sheet_5 = response.building.iepd; // 室内环境参数
				var sheet_6 = response.building.waterSavingDesign; // 节水设计

				// 定义全局变量 
				buildingClass = sheet_1.buildingClass; 
				a_longitude = sheet_1.longitude; 
				a_latitude = sheet_1.latitude;
				imageAll = sheet_1.image;
				console.log(imageAll);
				
				/****************  打印数据  *************/
				console.log(sheet_1);
				console.log(sheet_2);
				console.log(sheet_3);
				console.log(sheet_4);
				console.log(sheet_5);
				console.log(sheet_6);
				
				// 显示图片
				var image_list = [];
				var html_strs = '';
				
				if(imageAll==''||imageAll == null){
					// alert(123)
				}else{
					image_list = imageAll.split(",");
					
					console.log(image_list);
					
					for(var i=0;i<image_list.length;i++){
						html_strs += '<div class="ui left floated image b-pic-img">'+
									  		'<a class="ui left red corner label b-pic-img-list"><i class="remove icon"></i></a>'+
									  		'<img src="'+ image_list[i] +'">'+
									'</div>';
					}
					
					$("#b-pic").prepend(html_strs);
				}
				
				
				isPicFull();
				
				// 公共建筑只显示公共建筑的信息、居住建筑只显示居住建筑的信息
				if(sheet_1.buildingClass == 1){
					$(".list_jz").hide();
					$(".list_gg").show();
				}else if(sheet_1.buildingClass == 2){
					$(".list_gg").hide();
					$(".list_jz").show();
				}
				
				// 基本信息
				$("#a1").val(sheet_1.unit);
				$("#a2").val(sheet_1.subject);
				$("#a3").val(sheet_1.people);
				$("#a4").val(sheet_1.contact);
				$("#a5").val(sheet_1.name);
				$("#a6").html(sheet_1.type);
				$("#a6_hide").val(sheet_1.type);
				$("#a7").val(sheet_1.address);
				$("#a7_pro").val(sheet_1.province);
				$("#a8").val(sheet_1.applicationUnit);
				$("#a9").val(sheet_1.participantOrganization);
				$("#a10").val(sheet_1.time);
				$("#a11").val(sheet_1.adoptionStandard);
				$("#a12").html(sheet_1.level);	
				$("#a12_hide").val(sheet_1.level);
				$("#a13").html(sheet_1.identifying);
				$("#a13_hide").val(sheet_1.identifying);
				
				var $a14 = new Date();
				$a14.setTime(sheet_1.projectTime);
				$("#a14").val($a14.Format("yyyy-MM-dd"));
				
				var $a15 = new Date();
				$a15.setTime(sheet_1.completionTime);
				$("#a15").val($a15.Format("yyyy-MM-dd"));
				
				var $a16 = new Date();
				$a16.setTime(sheet_1.serviceTime);
				$("#a16").val($a16.Format("yyyy-MM-dd"));
				
				$("#a17").val(sheet_1.buildingArea);
				$("#a18").val(sheet_1.buildingOrientation);
				$("#a19").val(sheet_1.remark);
				$("#a20").val(sheet_1.aca);
				$("#a21").val(sheet_1.height);
				$("#a22").val(sheet_1.buildingProperty);
				$("#a23").val(sheet_1.cun);
				$("#a24").val(sheet_1.countNumber);
				$("#a25").val(sheet_1.number);
				
				// 气候区
				$("#a26").html(sheet_1.climaticProvince);
				$("#a26_hide").val(sheet_1.climaticProvince);

				// 关键设计评价指标
				if(sheet_2!=null){
					b_id = sheet_2.id;
					$("#b1").val(sheet_1.name);
					$("#b2").val(sheet_2.landArea);
					$("#b3").val(sheet_2.buildingArea);
					$("#b4").val(sheet_2.subsurfaceArea);
					$("#b5").val(sheet_2.groundFloorArea);
					$("#b6").val(sheet_2.gas);
					$("#b7").val(sheet_2.municipalHeating);
					$("#b8").val(sheet_2.electricPower);
					$("#b9").val(sheet_2.coal);
					$("#b10").val(sheet_2.ubadtec);
					$("#b11").val(sheet_2.deer);
					$("#b12").val(sheet_2.tpi);
					$("#b13").val(sheet_2.hvaacsdec);
					$("#b14").val(sheet_2.hvaacsdectr);
					$("#b15").val(sheet_2.totalWater);
					$("#b16").val(sheet_2.ncw);
					$("#b17").val(sheet_2.ntwa);
					$("#b18").val(sheet_2.blhw);
					$("#b19").val(sheet_2.rhc);
					$("#b20").val(sheet_2.tpohwgbre);
					$("#b21").val(sheet_2.bec);
					$("#b22").val(sheet_2.renewableCapacity);
					$("#b23").val(sheet_2.rege);
				}else{
					b_id = 0;
				}
				
				// 节能措施
				if(sheet_3!=null){
					c_id = sheet_3.id;
					$("#c1").val(sheet_1.name);
					$("#c2").html(sheet_1.identifying);
					$("#c2_hide").val(sheet_1.identifying);
					$("#c3").html(sheet_1.level);
					$("#c3_hide").val(sheet_1.level);
					
					if(sheet_3.owccbo == 1){
						var owccbo_3 = getLangStr("teamBdate_msg_4");
					}else{
						var owccbo_3 = getLangStr("teamBdate_msg_5");
					}
					$("#c4").html(owccbo_3);
					$("#c4_hide").val(sheet_3.owccbo);
					
					if(sheet_3.ehr == 1){
						var ehr_3 = getLangStr("teamBdate_msg_6");
					}else{
						var ehr_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c5").html(ehr_3);
					$("#c5_hide").val(sheet_3.ehr);
					
					if(sheet_3.awr == 1){
						var awr_3 = getLangStr("teamBdate_msg_6");
					}else{
						var awr_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c6").html(awr_3);
					$("#c6_hide").val(sheet_3.awr);
					
					if(sheet_3.pces == 1){
						var pces_3 = getLangStr("teamBdate_msg_6");
					}else{
						var pces_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c7").html(pces_3);
					$("#c7_hide").val(sheet_3.pces);
					
					if(sheet_3.erStandard == 1){
						var erStandard_3 = getLangStr("teamBdate_msg_6");
					}else{
						var erStandard_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c8").html(erStandard_3);
					$("#c8_hide").val(sheet_3.erStandard);
					
					if(sheet_3.wsStandard == 1){
						var wsStandard_3 = getLangStr("teamBdate_msg_6");
					}else{
						var wsStandard_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c9").html(wsStandard_3);
					$("#c9_hide").val(sheet_3.wsStandard);
					
					if(sheet_3.whwhu == 1){
						var whwhu_3 = getLangStr("teamBdate_msg_6");
					}else{
						var whwhu_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c10").html(whwhu_3);
					$("#c10_hide").val(sheet_3.whwhu);
					
					if(sheet_3.itemizedMetering == 1){
						var itemizedMetering_3 = getLangStr("teamBdate_msg_6");
					}else{
						var itemizedMetering_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c11").html(itemizedMetering_3);
					$("#c11_hide").val(sheet_3.itemizedMetering);
					
					if(sheet_3.cchp == 1){
						var cchp_3 = getLangStr("teamBdate_msg_6");
					}else{
						var cchp_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c12").html(cchp_3);
					$("#c12_hide").val(sheet_3.cchp);
					
					if(sheet_3.reu == 1){
						var reu_3 = getLangStr("teamBdate_msg_6");
					}else{
						var reu_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c13").html(reu_3);
					$("#c13_hide").val(sheet_3.reu);
					
					if(sheet_3.ltv == 1){
						var ltv_3 = getLangStr("teamBdate_msg_6");
					}else{
						var ltv_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c14").html(ltv_3);
					$("#c14_hide").val(sheet_3.ltv);
					
					if(sheet_3.lightingControl == 1){
						var lightingControl_3 = getLangStr("teamBdate_msg_6");
					}else{
						var lightingControl_3 = getLangStr("teamBdate_msg_7");
					}
					$("#c15").html(lightingControl_3);
					$("#c15_hide").val(sheet_3.lightingControl);
					
					if(sheet_3.egceas == 1){
						var egceas_3 = getLangStr("teamBdate_msg_4");
					}else{
						var egceas_3 = getLangStr("teamBdate_msg_5");
					}
					$("#c16").html(egceas_3);
					$("#c16_hide").val(sheet_3.egceas);
					
					if(sheet_3.esee == 1){
						var esee_3 = getLangStr("teamBdate_msg_4");
					}else{
						var esee_3 = getLangStr("teamBdate_msg_5");
					}
					$("#c17").html(esee_3);
					$("#c17_hide").val(sheet_3.esee);
					
					if(sheet_3.csh == 1){
						var csh_3 = getLangStr("teamBdate_msg_4");
					}else{
						var csh_3 = getLangStr("teamBdate_msg_5");
					}
					$("#c18").html(csh_3);
					$("#c18_hide").val(sheet_3.csh);
					
					$("#c19").val(sheet_3.vvf);
					$("#c20").val(sheet_3.csf);
					$("#c21").val(sheet_3.tfotds);
					$("#c22").val(sheet_3.endSystem);
					$("#c23").val(sheet_3.totalCapacity);
					$("#c24").val(sheet_3.rqi);
					$("#c25").val(sheet_3.totalHeat);
					$("#c26").val(sheet_3.ci);
					$("#c27").val(sheet_3.cop);
					$("#c28").val(sheet_3.eer);
					$("#c29").val(sheet_3.iplv);
					$("#c30").val(sheet_3.bte);
					$("#c31").val(sheet_3.ws);
					$("#c32").val(sheet_3.ewK);
					$("#c33").val(sheet_3.rk);
					$("#c34").val(sheet_3.exteriorWindowK);
					$("#c35").val(sheet_3.exteriorWindowSC);
					$("#c36").val(sheet_3.buildingOrientation);
					$("#c37").val(sheet_3.owcoar);
					$("#c38").val(sheet_3.tcwcoar);
					$("#c39").val(sheet_3.dohss);
					$("#c40").val(sheet_3.ehrf);
					$("#c41").val(sheet_3.nwats);
					$("#c42").val(sheet_3.potwcesm);
					$("#c43").val(sheet_3.whwhsd);
					$("#c44").val(sheet_3.cchpSystemDesign);
					$("#c45").val(sheet_3.reuf);
					$("#c46").val(sheet_3.sk);
					$("#c47").val(sheet_3.ssc);
					$("#c48").val(sheet_3.wwr);
					$("#c49").val(sheet_3.sp);
					$("#c50").val(sheet_3.acscwst);
					$("#c51").val(sheet_3.accwrt);
					$("#c52").val(sheet_3.achawst);
					$("#c53").val(sheet_3.achwrt);
				}else{
					c_id = 0;
				}
				
				// 室内环境措施
				if(sheet_4!=null){
					d_id = sheet_4.id;
					$("#d17").val(sheet_1.name);
					$("#d1").html(sheet_1.level);
					$("#d1_hide").val(sheet_1.level);
					$("#d2").html(sheet_1.identifying);
					$("#d2_hide").val(sheet_1.identifying);
					$("#d3").val(sheet_4.naturalVentilation);
					$("#d4").val(sheet_4.naturalLighting);
					$("#d5").val(sheet_4.shade);
					$("#d6").val(sheet_4.improvedNaturalLighting);
					$("#d7").val(sheet_4.aeoa);
					$("#d8").val(sheet_4.airQualityControl);
					$("#d9").val(sheet_4.accessibilityFacilities);
					$("#d10").val(sheet_4.nvm);
					$("#d11").val(sheet_4.voaarfar);
					$("#d12").val(sheet_4.nlsar);
					$("#d13").val(sheet_4.shadingForm);
					$("#d14").val(sheet_4.inlm);
					$("#d15").val(sheet_4.actcm);
					$("#d16").val(sheet_4.aqcd);
				}else{
					d_id = 0;
				}
				
				// 室内环境参数
				if(sheet_5!=null){
					e_id = sheet_5.id;
					$("#e1").val(sheet_5.functionRoom);
					$("#e2").val(sheet_5.st);
					$("#e3").val(sheet_5.sh);
					$("#e4").val(sheet_5.wt);
					$("#e5").val(sheet_5.wh);
					$("#e6").val(sheet_5.fav);
					$("#e7").val(sheet_5.svoi);
					$("#e8").val(sheet_5.ugr);
					$("#e9").val(sheet_5.u0);
					$("#e10").val(sheet_5.ra);
				}else{
					e_id = 0;
				}
				
				// 节水设计
				if(sheet_6!=null){
					f_id = sheet_6.id;
					$("#f1").val(sheet_1.name);
					$("#f2").html(sheet_1.level);
					$("#f2_hide").val(sheet_1.level);
					$("#f3").html(sheet_1.identifying);
					$("#f3_hide").val(sheet_1.identifying);
					$("#f4").val(sheet_6.rainWaterSavings);
					$("#f5").val(sheet_6.rainwaterRecycling);
					$("#f6").val(sheet_6.municipalWater);
					$("#f7").val(sheet_6.homemadeWater);
					$("#f8").val(sheet_6.com);
					$("#f9").val(sheet_6.waterSavingIrrigation);
					$("#f10").val(sheet_6.coolingWaterConservation);
					$("#f11").val(sheet_6.rainwaterSavingMeasure);
					$("#f12").val(sheet_6.uorfr);
					$("#f13").val(sheet_6.usow);
					$("#f14").val(sheet_6.ntsowu);
					$("#f15").val(sheet_6.fowsi);
					$("#f16").val(sheet_6.rainWaterReturn);
					$("#f17").val(sheet_6.wawc);
					$("#f18").val(sheet_6.ntwa);
				}else{
					f_id = 0;
				}
				
				removeLoading();
				
			}
		},
		error:function(msg){
			removeLoading();
		}
	});
}



// 基本信息数据保存
$("#submit_sheet_1").click(function(){
	
	var city = $("#selectCity option:selected").val();
	var log = $("#selectCity option:selected").data("log");
	var lat = $("#selectCity option:selected").data("lat");
	var cityname = $("#selectCity option:selected").html();
	var provincename = $("#selectProvince option:selected").html();
	
	if(citySelectFlag == "true"){
		if(city==-1 || $.trim(cityname)==""){
			alertokMsg(getLangStr("teamBdate_msg_8"),getLangStr("alert_ok"));
			return;
		}
	}else{ // 如果没有修改 则传页面原来的经纬度和城市名
		cityname = $("#a7").val();
		provincename = $("#a7_pro").val();
		log = a_longitude;
		lat = a_latitude;
	}
	
	addLoading();
	
/*	console.log(cityname);
	console.log(city);
	console.log(log);
	console.log(lat);	
	console.log(imageAll);
	return;*/
	
	
	var json = {
			"climaticProvince":$("#a26_hide").val(),
			"image":imageAll,
			"city":cityname,
			"latitude":lat,
			"longitude":log,
			"buildingClass":buildingClass,
			"id":buildingID,
			"unit":$("#a1").val(),
			"subject":$("#a2").val(),
			"people":$("#a3").val(),
			"contact":$("#a4").val(),
			"name":$("#a5").val(),
			"type":$("#a6_hide").val(),
			"address":cityname,
			"applicationUnit":$("#a8").val(),
			"participantOrganization":$("#a9").val(),
			"time":$("#a10").val(),
			"adoptionStandard":$("#a11").val(),
			"level":$("#a12_hide").val(),
			"identifying":$("#a13_hide").val(),
			"projectTime":$("#a14").val(),
			"completionTime":$("#a15").val(),
			"serviceTime":$("#a16").val(),
			"buildingArea":$("#a17").val(),
			"buildingOrientation":$("#a18").val(),
			"remark":$("#a19").val(),
			"aca":$("#a20").val(),
			"height":$("#a21").val(),
			"buildingProperty":$("#a22").val(),
			"cun":$("#a23").val(),
			"countNumber":$("#a24").val(),
			"number":$("#a25").val()
	};
	
	$.ajax({
		url:"/admin/saveBasicInformation",
		type:"POST",
		datatype:"JSON",
		data:json,
		success:function(response){
			
			if(response.code==200){
				window.location.reload();
			}else{
				alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
				removeLoading();
			}
		},
		error:function(msg){
			alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
			removeLoading();
		}
	});
});


// 关键设计评价指标
$("#submit_sheet_2").click(function(){
	var json = {};
	addLoading();
	
	if(b_id==0){
		json = {
				"buildingID":buildingID,
				"landArea":$("#b2").val(),
				"buildingArea":$("#b3").val(),
				"subsurfaceArea":$("#b4").val(),
				"groundFloorArea":$("#b5").val(),
				"gas":$("#b6").val(),
				"municipalHeating":$("#b7").val(),
				"electricPower":$("#b8").val(),
				"coal":$("#b9").val(),
				"ubadtec":$("#b10").val(),
				"deer":$("#b11").val(),
				"tpi":$("#b12").val(),
				"hvaacsdec":$("#b13").val(),
				"hvaacsdectr":$("#b14").val(),
				"totalWater":$("#b15").val(),
				"ncw":$("#b16").val(),
				"ntwa":$("#b17").val(),
				"blhw":$("#b18").val(),
				"rhc":$("#b19").val(),
				"tpohwgbre":$("#b20").val(),
				"bec":$("#b21").val(),
				"renewableCapacity":$("#b22").val(),
				"rege":$("#b23").val()
		};
	}else{
		json = {
				"id":b_id,
				"buildingID":buildingID,
				"landArea":$("#b2").val(),
				"buildingArea":$("#b3").val(),
				"subsurfaceArea":$("#b4").val(),
				"groundFloorArea":$("#b5").val(),
				"gas":$("#b6").val(),
				"municipalHeating":$("#b7").val(),
				"electricPower":$("#b8").val(),
				"coal":$("#b9").val(),
				"ubadtec":$("#b10").val(),
				"deer":$("#b11").val(),
				"tpi":$("#b12").val(),
				"hvaacsdec":$("#b13").val(),
				"hvaacsdectr":$("#b14").val(),
				"totalWater":$("#b15").val(),
				"ncw":$("#b16").val(),
				"ntwa":$("#b17").val(),
				"blhw":$("#b18").val(),
				"rhc":$("#b19").val(),
				"tpohwgbre":$("#b20").val(),
				"bec":$("#b21").val(),
				"renewableCapacity":$("#b22").val(),
				"rege":$("#b23").val()
		};		
	}
	
	$.ajax({
		url:"/admin/saveDesignIndicators",
		type:"POST",
		datatype:"JSON",
		data:json,
		success:function(response){
			
			if(response.code==200){
				window.location.reload();
			}else{
				alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
				removeLoading();
			}
		},
		error:function(msg){
			alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
			removeLoading();
		}
	});
});

//节能措施
$("#submit_sheet_3").click(function(){
	var json = {};
	addLoading();	
	
	if(c_id==0){
		json = {
				"buildingID":buildingID,
				"owccbo":$("#c4_hide").val(),
				"ehr":$("#c5_hide").val(),
				"awr":$("#c6_hide").val(),
				"pces":$("#c7_hide").val(),
				"erStandard":$("#c8_hide").val(),
				"wsStandard":$("#c9_hide").val(),
				"whwhu":$("#c10_hide").val(),
				"itemizedMetering":	$("#c11_hide").val(),				
				"cchp":$("#c12_hide").val(),			
				"reu":$("#c13_hide").val(),		
				"ltv":$("#c14_hide").val(),
				"lightingControl":$("#c15_hide").val(),
				"egceas":$("#c16_hide").val(),
				"esee":$("#c17_hide").val(),
				"csh":$("#c18_hide").val(),	
				"vvf":$("#c19").val(),
				"csf":$("#c20").val(),
				"tfotds":$("#c21").val(),
				"endSystem":$("#c22").val(),
				"totalCapacity":$("#c23").val(),
				"rqi":$("#c24").val(),
				"totalHeat":$("#c25").val(),
				"ci":$("#c26").val(),
				"cop":$("#c27").val(),
				"eer":$("#c28").val(),
				"iplv":$("#c29").val(),
				"bte":$("#c30").val(),
				"ws":$("#c31").val(),
				"ewK":$("#c32").val(),
				"rk":$("#c33").val(),
				"exteriorWindowK":$("#c34").val(),
				"exteriorWindowSC":$("#c35").val(),
				"buildingOrientation":$("#c36").val(),
				"owcoar":$("#c37").val(),
				"tcwcoar":$("#c38").val(),
				"dohss":$("#c39").val(),
				"ehrf":$("#c40").val(),
				"nwats":$("#c41").val(),
				"potwcesm":$("#c42").val(),
				"whwhsd":$("#c43").val(),
				"cchpSystemDesign":$("#c44").val(),
				"reuf":$("#c45").val(),
				"sk":$("#c46").val(),
				"ssc":$("#c47").val(),
				"wwr":$("#c48").val(),
				"sp":$("#c49").val(),
				"acscwst":$("#c50").val(),
				"accwrt":$("#c51").val(),
				"achawst":$("#c52").val(),
				"achwrt":$("#c53").val()
		};
	}else{
		json = {
				"id":c_id,
				"buildingID":buildingID,
				"owccbo":$("#c4_hide").val(),
				"ehr":$("#c5_hide").val(),
				"awr":$("#c6_hide").val(),
				"pces":$("#c7_hide").val(),
				"erStandard":$("#c8_hide").val(),
				"wsStandard":$("#c9_hide").val(),
				"whwhu":$("#c10_hide").val(),
				"itemizedMetering":	$("#c11_hide").val(),				
				"cchp":$("#c12_hide").val(),			
				"reu":$("#c13_hide").val(),		
				"ltv":$("#c14_hide").val(),
				"lightingControl":$("#c15_hide").val(),
				"egceas":$("#c16_hide").val(),
				"esee":$("#c17_hide").val(),
				"csh":$("#c18_hide").val(),	
				"vvf":$("#c19").val(),
				"csf":$("#c20").val(),
				"tfotds":$("#c21").val(),
				"endSystem":$("#c22").val(),
				"totalCapacity":$("#c23").val(),
				"rqi":$("#c24").val(),
				"totalHeat":$("#c25").val(),
				"ci":$("#c26").val(),
				"cop":$("#c27").val(),
				"eer":$("#c28").val(),
				"iplv":$("#c29").val(),
				"bte":$("#c30").val(),
				"ws":$("#c31").val(),
				"ewK":$("#c32").val(),
				"rk":$("#c33").val(),
				"exteriorWindowK":$("#c34").val(),
				"exteriorWindowSC":$("#c35").val(),
				"buildingOrientation":$("#c36").val(),
				"owcoar":$("#c37").val(),
				"tcwcoar":$("#c38").val(),
				"dohss":$("#c39").val(),
				"ehrf":$("#c40").val(),
				"nwats":$("#c41").val(),
				"potwcesm":$("#c42").val(),
				"whwhsd":$("#c43").val(),
				"cchpSystemDesign":$("#c44").val(),
				"reuf":$("#c45").val(),
				"sk":$("#c46").val(),
				"ssc":$("#c47").val(),
				"wwr":$("#c48").val(),
				"sp":$("#c49").val(),
				"acscwst":$("#c50").val(),
				"accwrt":$("#c51").val(),
				"achawst":$("#c52").val(),
				"achwrt":$("#c53").val()
		};		
	}
	
	$.ajax({
		url:"/admin/saveEcm",
		type:"POST",
		datatype:"JSON",
		data:json,
		success:function(response){
			
			if(response.code==200){
				window.location.reload();
			}else{
				alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
				removeLoading();
			}
		},
		error:function(msg){
			alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
			removeLoading();
		}
	});
});

//室内环境措施
$("#submit_sheet_4").click(function(){
	var json = {};
	addLoading();
	
	if(d_id==0){
		json = {
				"buildingID":buildingID,
				"naturalVentilation":$("#d3").val(),
				"naturalLighting":$("#d4").val(),
				"shade":$("#d5").val(),
				"improvedNaturalLighting":$("#d6").val(),
				"aeoa":$("#d7").val(),
				"airQualityControl":$("#d8").val(),
				"accessibilityFacilities":$("#d9").val(),
				"nvm":$("#d10").val(),
				"voaarfar":$("#d11").val(),
				"nlsar":$("#d12").val(),
				"shadingForm":$("#d13").val(),
				"inlm":$("#d14").val(),
				"actcm":$("#d15").val(),
				"aqcd":$("#d16").val()
		};
	}else{
		json = {
				"id":d_id,
				"buildingID":buildingID,
				"naturalVentilation":$("#d3").val(),
				"naturalLighting":$("#d4").val(),
				"shade":$("#d5").val(),
				"improvedNaturalLighting":$("#d6").val(),
				"aeoa":$("#d7").val(),
				"airQualityControl":$("#d8").val(),
				"accessibilityFacilities":$("#d9").val(),
				"nvm":$("#d10").val(),
				"voaarfar":$("#d11").val(),
				"nlsar":$("#d12").val(),
				"shadingForm":$("#d13").val(),
				"inlm":$("#d14").val(),
				"actcm":$("#d15").val(),
				"aqcd":$("#d16").val()
		};		
	}
	
	$.ajax({
		url:"/admin/saveIndoorEnvironment",
		type:"POST",
		datatype:"JSON",
		data:json,
		success:function(response){
			
			if(response.code==200){
				window.location.reload();
			}else{
				alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
				removeLoading();
			}
		},
		error:function(msg){
			alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
			removeLoading();
		}
	});
});

//室内环境参数设计
$("#submit_sheet_5").click(function(){
	var json = {};
	addLoading();
	
	if(e_id==0){
		json = {
				"buildingID":buildingID,
				"functionRoom":$("#e1").val(),
				"st":$("#e2").val(),
				"sh":$("#e3").val(),
				"wt":$("#e4").val(),
				"wh":$("#e5").val(),
				"fav":$("#e6").val(),
				"svoi":$("#e7").val(),
				"ugr":$("#e8").val(),
				"u0":$("#e9").val(),
				"ra":$("#e10").val()
		};
	}else{
		json = {
				"id":e_id,
				"buildingID":buildingID,
				"functionRoom":$("#e1").val(),
				"st":$("#e2").val(),
				"sh":$("#e3").val(),
				"wt":$("#e4").val(),
				"wh":$("#e5").val(),
				"fav":$("#e6").val(),
				"svoi":$("#e7").val(),
				"ugr":$("#e8").val(),
				"u0":$("#e9").val(),
				"ra":$("#e10").val()
		};		
	}
	
	$.ajax({
		url:"/admin/saveIepd",
		type:"POST",
		datatype:"JSON",
		data:json,
		success:function(response){
			
			if(response.code==200){
				window.location.reload();
			}else{
				alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
				removeLoading();
			}
		},
		error:function(msg){
			alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
			removeLoading();
		}
	});
});

// 节水设计
$("#submit_sheet_6").click(function(){
	var json = {};
	addLoading();
	
	if(f_id==0){
		json = {
				"buildingID":buildingID,
				"rainWaterSavings":$("#f4").val(),
				"rainwaterRecycling":$("#f5").val(),
				"municipalWater":$("#f6").val(),
				"homemadeWater":$("#f7").val(),
				"com":$("#f8").val(),
				"waterSavingIrrigation":$("#f9").val(),
				"coolingWaterConservation":$("#f10").val(),
				"rainwaterSavingMeasure":$("#f11").val(),
				"uorfr":$("#f12").val(),
				"usow":$("#f13").val(),
				"ntsowu":$("#f14").val(),
				"fowsi":$("#f15").val(),
				"rainWaterReturn":$("#f16").val(),
				"wawc":$("#f17").val(),
				"ntwa":$("#f18").val()
		};
	}else{
		json = {
				"id":f_id,
				"buildingID":buildingID,
				"rainWaterSavings":$("#f4").val(),
				"rainwaterRecycling":$("#f5").val(),
				"municipalWater":$("#f6").val(),
				"homemadeWater":$("#f7").val(),
				"com":$("#f8").val(),
				"waterSavingIrrigation":$("#f9").val(),
				"coolingWaterConservation":$("#f10").val(),
				"rainwaterSavingMeasure":$("#f11").val(),
				"uorfr":$("#f12").val(),
				"usow":$("#f13").val(),
				"ntsowu":$("#f14").val(),
				"fowsi":$("#f15").val(),
				"rainWaterReturn":$("#f16").val(),
				"wawc":$("#f17").val(),
				"ntwa":$("#f18").val()
		};		
	}
	
	$.ajax({
		url:"/admin/saveWaterSavingDesign",
		type:"POST",
		datatype:"JSON",
		data:json,
		success:function(response){
			
			if(response.code==200){
				window.location.reload();
			}else{
				alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
				removeLoading();
			}
		},
		error:function(msg){
			alertokMsg(getLangStr("teamBdate_msg_3"),getLangStr("alert_ok"));
			removeLoading();
		}
	});
});