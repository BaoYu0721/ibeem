//window.parent.addLoading();
var building_do = $.cookie("building-do")==undefined?"update":$.cookie("building-do");
var bid = $.cookie("building")==undefined?"item_305":$.cookie("building");//
console.log('$.cookie("building"):'+$.cookie("building"));
if(!bid==""){
	bid = bid.slice(5);
	bid = parseInt(bid);
}else{
	bid = 0;
}
//保存原始数据
var responseData ;
//定义flag 避免重复提交
var citySelectFlag = "false";
// 定义更新各个sheet的ID
var b_id=0;
var c_id=0;
var d_id=0;
var e_id=0;
var f_id=0;

function canInput(isCanInput){
	if(isCanInput){
		//地区修改按钮	
		$("#open_select_box1").css("display","inline");
		//显示保存按钮	
		$("#data_save").removeClass("hide");
		//显示取消按钮
		$("#data_cancel").removeClass("hide");
		//下拉可以编辑
		$(".dropdown").removeClass("disabled");
		//文本框可以编辑
		$('input').removeAttr('readonly');
		//隐藏编辑按钮
		$("#data_edit").addClass("hide");
	}else{
		//地区修改按钮	
		$("#open_select_box1").css("display","none");
		//隐藏保存按钮	
		$("#data_save").addClass("hide");
		//隐藏取消按钮
		$("#data_cancel").addClass("hide");
		//下拉不可以编辑
		$(".dropdown").addClass("disabled");
		//文本框不可以编辑
		$('input').attr('readonly',"");
		//显示编辑按钮
		$("#data_edit").removeClass("hide");
		//地区不可编辑
		$('#open_select_box2').css("display","none");
		citySelectFlag = "false";
		
		// 清空下拉菜单选择的城市
		$("#selectCity option[value=-1]").attr("selected", true); 
		$("#selectCity option[value!=-1]").removeAttr("selected"); 
		$("#selectProvince option[value=-1]").attr("selected", true);
		$("#selectProvince option[value!=-1]").removeAttr("selected");
		
		$("#open_select_box1").show();
		$("#box_select,#open_select_box2").hide();
	}
}

$(function(){
	// 导航切换
	$("#build-menu .item").tab();	
	
	// 获取建筑信息
	if(building_do=="update"){
		getBuildingInfo(bid);
		canInput(false);
	}else{
		window.parent.removeLoading();
		canInput(true);
		$("#data_cancel").html("清空");
		buildingClass = building_do.substr(3);
		$("#tit").css("display","block");
		console.log("buildingClass:"+buildingClass);
		// 公共建筑只显示公共建筑的信息、居住建筑只显示居住建筑的信息
		if(buildingClass == 1){
			$(".list_jz").hide();
			$(".list_gg").show();
		}else if(buildingClass == 2){
			$(".list_gg").hide();
			$(".list_jz").show();
		}
	}
	
	
	// 建筑信息下拉选项卡
	$(".dropdown").dropdown();
	
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
	//编辑按钮事件
	$("#data_edit").click(function(){
		canInput(true);
	})	
	//取消按钮事件
	$("#data_cancel").click(function(){
		if(building_do != "update"){
			location.reload();
		}else{
			setData(responseData);
		}
		
		canInput(false);
	})
	//保存按钮事件	
	$("#data_save").click(function(){
		if(validFormat()){
			$("#tit").css("display","none");
			updateData();
		}
	})
	//修改联动事件
	changeBind();
	
});
function validFormat(){
	var tabArr ={
			"first":"基本信息",
			"second":"关键设计指标",
			"third":"节能措施",
			"four":"室内环境措施",
			"five":"室内环境参数设计",
			"six":"节水设计"
	}; 
	returnFlag = true;  
	$(".required-input").each(function(){
		var val = $(this).val();
		var text;
		var tab = tabArr[$(this).parents('.ui.tab.segment').data("tab")];;
		if($(this)[0].id=="selectProvince"){
			if(val=="-1")val ="";
			text = "省份";
		}else if($(this)[0].id=="selectCity"){
			if(val=="-1")val ="";
			text = "城市";
		}else if($(this).hasClass("dropdown")){
			val = $(this).children("input").val();
			text = $(this).prev().html();
		}else{
			text = $(this).prev().html();
		}
		if ($.trim(val)=="")
		{
			$("#tit").css("display","block");
			$("#tit").html("【"+tab+"】中的字段【"+text+"】为必填项");
			returnFlag = false;
			return returnFlag;
		}
	})
	$("input.num-input").each(function(){
		var val = $(this).val();
		var text = $(this).prev().html();
		var tab = tabArr[$(this).parents('.ui.tab.segment').data("tab")];
		if (val!="" && isNaN(parseInt(val)))
		{
			$("#tit").css("display","block");
			$("#tit").html("【"+tab+"】中的字段【"+text+"】必须是数字格式");
			returnFlag = false;
			return returnFlag;
		}
	})
	return returnFlag;
}
function changeBind(){
	//基本信息：建筑名称修改==>P2，3，4，6页对应字段修改	
	$("#a5").change(function(){
		  $("#b1").val($(this).val());
		  $("#c1").val($(this).val());
		  $("#d17").val($(this).val());
		  $("#f1").val($(this).val());
	});
	//基本信息：星级修改==>P3，4，6页对应字段修改	
	$("#a12_hide").parent().dropdown({
		onChange:function(value, text, $choice){
			$("#c3_hide").val(value);
			$("#d1_hide").val(value);
			$("#f2_hide").val(value);
		}
	});
	//基本信息：标识类别修改==>P6页对应字段修改	
	$("#a13_hide").parent().dropdown({
		onChange:function(value, text, $choice){
			$("#f3_hide").val(value);
		}
	});
}
// 导出模板 
/*$("#buildTempOut").click(function(){
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
	window.location.href= "/building/exportBuilding?buildingID=" + bid; 
}*/

// 默认数据加载
function getBuildingInfo(bid){
	$.ajax({
		url:"/building/getBuildingInfo?buildingID=" + bid,
		type:"GET",
		datatype:"JSON",
		success:function(response){
			responseData = response;
			console.log(response)
			//window.parent.removeLoading();
			
			if(response.code == 200){
				setData(response);
			}
		},
		error:function(msg){
			
		}
	});
}
//显示数据
function setData(response){
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
	
	
		// 显示图片库的图片
		var image_list_sheet = [];
		var imageSheet = imageAll; // 图片库
		var image_string = '';
		
		if(imageSheet==''||imageSheet == null){
			image_string += '<div class="swiper-slide" style="padding-top:100px;padding-bottom:100px;">没有图片</div>';
		}else{
			image_list_sheet = imageSheet.split(",");
			console.log(image_list_sheet);
			for(var i=0;i<image_list_sheet.length;i++){
				image_string += '<div class="swiper-slide"><img src="'+ image_list_sheet[i] +'"></div>';
			}
		}
		$("#swiper-wrapper-1").html(image_string);
		
	  var mySwiper = new Swiper ('.swiper-container', {
		    loop: false,
		    pagination: '.swiper-pagination',
		    nextButton: '.swiper-button-next',
		    prevButton: '.swiper-button-prev',
		    observer:true,
		    observeParents:true,
	  });
	  
	/****************  打印数据  *************/
	
	// 显示图片
//	var image_list = [];
//	var html_strs = '';
//	
//	if(imageAll==''||imageAll == null){
//		// alert(123)
//	}else{
//		image_list = imageAll.split(",");
//		
//		console.log(image_list);
//		
//		for(var i=0;i<image_list.length;i++){
//			html_strs += '<div class="ui left floated image b-pic-img">'+
//						  		/*'<a class="ui left red corner label b-pic-img-list"><i class="remove icon"></i></a>'+*/
//						  		'<img src="'+ image_list[i] +'">'+
//						'</div>';
//		}
//		
//		$("#b-pic").prepend(html_strs);
//	}
	
	
	/*isPicFull();*/
	
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
	$("#a8").val(sheet_1.applicationUnit);
	$("#a9").val(sheet_1.participantOrganization);
	$("#a10").val(sheet_1.time==null?"":getLocalTime(sheet_1.time));
	$("#a11").val(sheet_1.adoptionStandard);
	$("#a12").html(sheet_1.level);	
	$("#a12_hide").val(sheet_1.level);
	$("#a13").html(sheet_1.identifying);
	$("#a13_hide").val(sheet_1.identifying);
	$("#a14").val(sheet_1.projectTime==null?"":getLocalTime(sheet_1.projectTime));
	$("#a15").val(sheet_1.completionTime==null?"":getLocalTime(sheet_1.completionTime));
	$("#a16").val(sheet_1.serviceTime==null?"":getLocalTime(sheet_1.serviceTime));
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
}
//更新建筑数据
function updateData(){
	var city = $("#selectCity option:selected").val();
	var log = $("#selectCity option:selected").data("log");
	var lat = $("#selectCity option:selected").data("lat");
	var provincename = $("#selectProvince option:selected").html();
	console.log(provincename);
	var cityname = $("#selectCity option:selected").html();
	
	
	if(citySelectFlag == "true"){
		if(city==-1 || $.trim(cityname)==""){
			alertokMsg(getLangStr("teamBdate_msg_8"),getLangStr("alert_ok"));
			return;
		}
	}else{ // 如果没有修改 则传页面原来的经纬度和城市名
		cityname = $("#a7").val();
		log = a_longitude;
		lat = a_latitude;
	}
	
	window.parent.addLoading();
	var sendJson;
	//============基础数据===============
	var json1 = {
			"climaticProvince":$("#a26_hide").val(),
			"image":"",
			"province":provincename,
			"city":cityname,
			"latitude":lat,
			"longitude":log,
			"buildingClass":buildingClass,
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
	if(bid!=0){
		json1["id"] =bid ;
	}
	//============designIndicators===============
	var json2 = {
		"designIndicators.landArea":$("#b2").val(),
		"designIndicators.buildingArea":$("#b3").val(),
		"designIndicators.subsurfaceArea":$("#b4").val(),
		"designIndicators.groundFloorArea":$("#b5").val(),
		"designIndicators.gas":$("#b6").val(),
		"designIndicators.municipalHeating":$("#b7").val(),
		"designIndicators.electricPower":$("#b8").val(),
		"designIndicators.coal":$("#b9").val(),
		"designIndicators.ubadtec":$("#b10").val(),
		"designIndicators.deer":$("#b11").val(),
		"designIndicators.tpi":$("#b12").val(),
		"designIndicators.hvaacsdec":$("#b13").val(),
		"designIndicators.hvaacsdectr":$("#b14").val(),
		"designIndicators.totalWater":$("#b15").val(),
		"designIndicators.ncw":$("#b16").val(),
		"designIndicators.ntwa":$("#b17").val(),
		"designIndicators.blhw":$("#b18").val(),
		"designIndicators.rhc":$("#b19").val(),
		"designIndicators.tpohwgbre":$("#b20").val(),
		"designIndicators.bec":$("#b21").val(),
		"designIndicators.renewableCapacity":$("#b22").val(),
		"designIndicators.rege":$("#b23").val()
	};
	if(b_id!=0){
		json2["designIndicators.id"] =b_id ;
	}
	sendJson = $.extend({}, json1, json2);
	//============ecm===============
	
	var	json3 = {
				"ecm.owccbo":$("#c4_hide").val(),
				"ecm.ehr":$("#c5_hide").val(),
				"ecm.awr":$("#c6_hide").val(),
				"ecm.pces":$("#c7_hide").val(),
				"ecm.erStandard":$("#c8_hide").val(),
				"ecm.wsStandard":$("#c9_hide").val(),
				"ecm.whwhu":$("#c10_hide").val(),
				"ecm.itemizedMetering":	$("#c11_hide").val(),				
				"ecm.cchp":$("#c12_hide").val(),			
				"ecm.reu":$("#c13_hide").val(),		
				"ecm.ltv":$("#c14_hide").val(),
				"ecm.lightingControl":$("#c15_hide").val(),
				"ecm.egceas":$("#c16_hide").val(),
				"ecm.esee":$("#c17_hide").val(),
				"ecm.csh":$("#c18_hide").val(),	
				"ecm.vvf":$("#c19").val(),
				"ecm.csf":$("#c20").val(),
				"ecm.tfotds":$("#c21").val(),
				"ecm.endSystem":$("#c22").val(),
				"ecm.totalCapacity":$("#c23").val(),
				"ecm.rqi":$("#c24").val(),
				"ecm.totalHeat":$("#c25").val(),
				"ecm.ci":$("#c26").val(),
				"ecm.cop":$("#c27").val(),
				"ecm.eer":$("#c28").val(),
				"ecm.iplv":$("#c29").val(),
				"ecm.bte":$("#c30").val(),
				"ecm.ws":$("#c31").val(),
				"ecm.ewK":$("#c32").val(),
				"ecm.rk":$("#c33").val(),
				"ecm.exteriorWindowK":$("#c34").val(),
				"ecm.exteriorWindowSC":$("#c35").val(),
				"ecm.buildingOrientation":$("#c36").val(),
				"ecm.owcoar":$("#c37").val(),
				"ecm.tcwcoar":$("#c38").val(),
				"ecm.dohss":$("#c39").val(),
				"ecm.ehrf":$("#c40").val(),
				"ecm.nwats":$("#c41").val(),
				"ecm.potwcesm":$("#c42").val(),
				"ecm.whwhsd":$("#c43").val(),
				"ecm.cchpSystemDesign":$("#c44").val(),
				"ecm.reuf":$("#c45").val(),
				"ecm.sk":$("#c46").val(),
				"ecm.ssc":$("#c47").val(),
				"ecm.wwr":$("#c48").val(),
				"ecm.sp":$("#c49").val(),
				"ecm.acscwst":$("#c50").val(),
				"ecm.accwrt":$("#c51").val(),
				"ecm.achawst":$("#c52").val(),
				"ecm.achwrt":$("#c53").val()
		};
	if(c_id!=0){
		json3["ecm.id"] = c_id;
	}
	sendJson = $.extend({}, sendJson, json3);
	//============indoorEnvironment===============
	
	var	json4 = {
				"indoorEnvironment.naturalVentilation":$("#d3").val(),
				"indoorEnvironment.naturalLighting":$("#d4").val(),
				"indoorEnvironment.shade":$("#d5").val(),
				"indoorEnvironment.improvedNaturalLighting":$("#d6").val(),
				"indoorEnvironment.aeoa":$("#d7").val(),
				"indoorEnvironment.airQualityControl":$("#d8").val(),
				"indoorEnvironment.accessibilityFacilities":$("#d9").val(),
				"indoorEnvironment.nvm":$("#d10").val(),
				"indoorEnvironment.voaarfar":$("#d11").val(),
				"indoorEnvironment.nlsar":$("#d12").val(),
				"indoorEnvironment.shadingForm":$("#d13").val(),
				"indoorEnvironment.inlm":$("#d14").val(),
				"indoorEnvironment.actcm":$("#d15").val(),
				"indoorEnvironment.aqcd":$("#d16").val()
		};
	if(d_id!=0){
		json4["indoorEnvironment.id"] = d_id;
	}
	sendJson = $.extend({}, sendJson, json4);
	//============iepd===============
	
	var	json5 = {
				"iepd.functionRoom":$("#e1").val(),
				"iepd.st":$("#e2").val(),
				"iepd.sh":$("#e3").val(),
				"iepd.wt":$("#e4").val(),
				"iepd.wh":$("#e5").val(),
				"iepd.fav":$("#e6").val(),
				"iepd.svoi":$("#e7").val(),
				"iepd.ugr":$("#e8").val(),
				"iepd.u0":$("#e9").val(),
				"iepd.ra":$("#e10").val()
		};
	if(e_id!=0){
		json5["iepd.id"] = e_id;
	}
	sendJson = $.extend({}, sendJson, json5);
	//============waterSavingDesign===============
	
	var	json6 = {
				"waterSavingDesign.rainWaterSavings":$("#f4").val(),
				"waterSavingDesign.rainwaterRecycling":$("#f5").val(),
				"waterSavingDesign.municipalWater":$("#f6").val(),
				"waterSavingDesign.homemadeWater":$("#f7").val(),
				"waterSavingDesign.com":$("#f8").val(),
				"waterSavingDesign.waterSavingIrrigation":$("#f9").val(),
				"waterSavingDesign.coolingWaterConservation":$("#f10").val(),
				"waterSavingDesign.rainwaterSavingMeasure":$("#f11").val(),
				"waterSavingDesign.uorfr":$("#f12").val(),
				"waterSavingDesign.usow":$("#f13").val(),
				"waterSavingDesign.ntsowu":$("#f14").val(),
				"waterSavingDesign.fowsi":$("#f15").val(),
				"waterSavingDesign.rainWaterReturn":$("#f16").val(),
				"waterSavingDesign.wawc":$("#f17").val(),
				"waterSavingDesign.ntwa":$("#f18").val()
		};
	if(f_id!=0){
		json6["waterSavingDesign.id"] = f_id;
	}
	sendJson = $.extend({}, sendJson, json6);
	$.ajax({
		url:"building/saveOrUpdate",
		type:"POST",
		datatype:"JSON",
		data:sendJson,
		success:function(response){
			alert("修改成功！");
			bid = response.buildingID;
			$.cookie("building-do","update");
			$.cookie("building","item_"+bid);
			location.reload();
			//列表添加点			
			window.parent.addOneBuilding({
				id:bid,
				name:sendJson.name,
				image:sendJson.image,
				describe:""
			});
			//地图添加点
			window.parent.myMap.addPoint({
				type: 'mappoint',
				name: '建筑',
				data:[{
					name:sendJson.name,
					lat:sendJson.latitude,
					lon:sendJson.longitude,
					city:sendJson.city,
					province:sendJson.province
				}],
				turboThreshold:5000,
			})
//			:function(param){
//				this.myChartObj.addSeries({
//					type: 'mappoint',
//					name: '建筑',
//					data:buildingList,
//					turboThreshold:5000,
//				});
//				this.myChartObj.addSeries(param);
//			}
		},
		error:function(msg){
			alert("网络繁忙请重试！");
			window.parent.removeLoading();
		}
	});
}
function getLocalTime(nS) {     
	   var date = new Date(parseInt(nS));
	   return dateFtt("yyyy-MM-dd",date);
	} 
function dateFtt(fmt,date)   
{ //author: meizz   
var o = {   
 "M+" : date.getMonth()+1,                 //月份   
 "d+" : date.getDate(),                    //日   
 "h+" : date.getHours(),                   //小时   
 "m+" : date.getMinutes(),                 //分   
 "s+" : date.getSeconds(),                 //秒   
 "q+" : Math.floor((date.getMonth()+3)/3), //季度   
 "S"  : date.getMilliseconds()             //毫秒   
};   
if(/(y+)/.test(fmt))   
 fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
for(var k in o)   
 if(new RegExp("("+ k +")").test(fmt))   
fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
return fmt;   
} 