addLoading();

var $building = $.cookie("building");

$building = $building.slice(5);
console.log($building);

$(function(){
	
	$('input').attr('readonly','readonly')
	
	// 导航切换
	$("#build-menu .item").tab();	
	
	// 获取建筑信息
	getBuildingInfo($building);
	
	// 建筑信息下拉选项卡
	$(".dropdown").dropdown();
	
});

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

			console.log(response)
			removeLoading();
			
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
									  		/*'<a class="ui left red corner label b-pic-img-list"><i class="remove icon"></i></a>'+*/
									  		'<img src="'+ image_list[i] +'">'+
									'</div>';
					}
					
					$("#b-pic").prepend(html_strs);
				}
				
				
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
				$("#a10").val(sheet_1.time);
				$("#a11").val(sheet_1.adoptionStandard);
				$("#a12").html(sheet_1.level);	
				$("#a12_hide").val(sheet_1.level);
				$("#a13").html(sheet_1.identifying);
				$("#a13_hide").val(sheet_1.identifying);
				$("#a14").val(sheet_1.projectTime);
				$("#a15").val(sheet_1.completionTime);
				$("#a16").val(sheet_1.serviceTime);
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
				}
				
				// 节能措施
				if(sheet_3!=null){
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
				}
				
				// 室内环境措施
				if(sheet_4!=null){
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
				}
				
				// 室内环境参数
				if(sheet_5!=null){
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
				}
				
				// 节水设计
				if(sheet_6!=null){

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
				}
				
				
			}
		},
		error:function(msg){
			
		}
	});
}

