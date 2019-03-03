/*存放缓存中的，项目id*/
var teamID = $.cookie("teamid");
/*存放缓存中的，项目name*/
var teamName = $.cookie("teamname");
/*存放缓存中的，建筑id*/
var buildingID = $.cookie("buildingid");

var name = $.cookie("buildingname");

$("#buildingname").html(name);
$(".tit-teamname").html(teamName.length>8?teamName.substring(0,8)+"..":teamName);
$(".tit-buildingname").html(name.length>8?name.substring(0,8)+"..":name);


/*存放缓存中的，建筑name*/
//var buildingName = $.cookie("buildingname");
//$(".tit-buildingname").html(buildingName.length>8?buildingName.substring(0,8)+"..":buildingName);
//$(".tit-teamname").html(teamName.length>8?teamName.substring(0,8)+"..":teamName);
//$("#buildingname").html(buildingName);

// 定义flag 避免重复提交
var downloadFlag = "true";
var citySelectFlag = "false";

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
	
	// addLoading();
	
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
	showRoom(buildingID);
	
	// 建筑信息下拉选项卡
	$(".dropdown").dropdown();
});


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
	window.location.href= "/admin/project/single/topBuilding/export?topBuildingID=" + bid; 
}

// 默认数据加载
function getBuildingInfo(bid){
	
	// 默认数据添加
	$.ajax({
		url:"/admin/project/single/topBuilding", // bid
		type:"POST",
		datatype:"JSON",
		data: {buildingId: bid},
		success:function(response){

			console.log(response)
			
			if(response.code == 200){
				showData(response);	
				removeLoading();
				
			}
		},
		error:function(msg){
			removeLoading();
		}
	});
	
}

// 加载room
function showRoom(bid){
	$("#roomList").html("");
	// ROOM 和 Element
	$.ajax({
		url:"/admin/project/single/topBuilding/room_info", // bid
		type:"POST",
		datatype:"JSON",
		data: {buildingId: bid},
		success:function(response){

			//console.log(response)
			if(response.code == 200){
				
				for(var i=0;i<response.result.length;i++){
					var roomStr = '';
					var eleStr = '';
					var r = response.result[i];

					if(response.result[i].topElementList.length==0){
						eleStr = '<tr><td colspan="4">'+ getLangStr("surveyRep_empty") +'</td></tr>'
					}else{
						for(var j=0;j<response.result[i].topElementList.length;j++){
							var k = response.result[i].topElementList[j];
							eleStr += '<tr>'+
											'<td>'+ k.elementType +'</td>'+
											'<td>'+ k.elementArea +'</td>'+
											'<td>'+ k.elementUValue +'</td>'+
											'<td><a data-type="delElement" data-id="'+ k.eid +'">'+ getLangStr("top_del") +'</a> / <a data-type="updateElement" data-id="'+ k.eid +'" data-v1="'+ k.elementType +'" data-v2="'+ k.elementArea +'" data-v3="'+ k.elementUValue +'">'+ getLangStr("top_update") +'</a></td>'+
										'</tr>';
						}
					}
					
					roomStr += '<tr>'+
									'<td class="tr_click">+</td>'+
									'<td>'+ r.roomType +'</td>'+
									'<td>'+ r.floorLocation +'</td>'+
									'<td>'+ r.grossInternalArea +'</td>'+
									'<td><a data-type="delRoom" data-id="'+ r.rid +'">'+ getLangStr("top_del") +'</a> / <a data-type="updateRoom" data-id="'+ r.rid +'" data-v1="'+ r.roomType +'" data-v2="'+ r.floorLocation +'" data-v3="'+ r.grossInternalArea +'">'+ getLangStr("top_update") +'</a></td>'+
								'</tr>'+
								'<tr class="tr_more">'+
									'<td></td>'+
									'<td colspan="4" style="border-left:none;">'+
										'<table class="ui table celled">'+
											'<thead>'+
												'<tr>'+
													'<th>'+ getLangStr("top_etype") +'</th>'+
													'<th>'+ getLangStr("top_earea") +'</th>'+
													'<th>'+ getLangStr("top_evalue") +'</th>'+
													'<th><a data-type="addElement" data-id="'+ r.rid +'">'+ getLangStr("top_add") +'</a></th>'+
												'</tr>'+
											'</thead>'+
											'<tbody id="element_'+ i +'">'+ eleStr +'</tbody>'+
										'</table>'+
									'</td>'+
								'</tr>';
					
					$("#roomList").append(roomStr);
				}
				
				
				removeLoading();
				
			}
		},
		error:function(msg){
			removeLoading();
		}
	});
}

// 判断是否为空
function isNull(s){
	if(s==null){
		s = '';
	}
	return s;
}

// 显示默认数据
function showData(data){
	var data = data.topBuilding;
	
	buildingIDs = data.buildingID;
	energyIDs = data.energyID;
	equipmentIDs = data.equipmentID;
	organisationIDs = data.organisationID;
	siteIDs = data.siteID;

	$("#a1").val(isNull(data.organisationName));
	$("#a2").val(isNull(data.organisationAddressline1));
	$("#a3").html(isNull(data.organisationCity));
	$("#a3_hide").val(isNull(data.organisationCity));
	$("#a4").val(isNull(data.organisationPostcode));
	$("#a5").html(isNull(data.organisationCountry));
	$("#a5_hide").val(isNull(data.organisationCountry));
	$("#a6").html(isNull(data.sectorType));
	$("#a6_hide").val(isNull(data.sectorType));
	$("#a7").html(isNull(data.siteNumber));
	$("#a7_hide").val(isNull(data.siteNumber));
	$("#a8").val(isNull(data.organisationAddressline2));
	$("#a9").val(isNull(data.organisationAddressline3));
	$("#a10").val(isNull(data.organisationAddressline4));
	
	$("#b1").val(isNull(data.siteAddressline1));
	$("#b2").html(isNull(data.siteCity));
	$("#b2_hide").val(isNull(data.siteCity));
	$("#b3").val(isNull(data.sitePostcode));
	$("#b4").html(isNull(data.siteCountry));
	$("#b4_hide").val(isNull(data.siteCountry));
	$("#b5").val(isNull(data.numberOfBuildings));
	$("#b6").html(isNull(data.urbanContext));
	$("#b6_hide").val(isNull(data.urbanContext));
	$("#b7").html(isNull(data.swimmingPool));
	$("#b7_hide").val(isNull(data.swimmingPool));
	$("#b8").html(isNull(data.poolType));
	$("#b8_hide").val(isNull(data.poolType));
	$("#b9").val(isNull(data.siteAddressline2));
	$("#b10").val(isNull(data.siteAddressline3));
	$("#b11").val(isNull(data.siteAddressline4));
	
	$("#c1").html(isNull(data.primaryActivityType));
	$("#c1_hide").val(isNull(data.primaryActivityType));
	$("#c2").html(isNull(data.tenancyType));
	$("#c2_hide").val(isNull(data.tenancyType));
	$("#c3").html(isNull(data.architecturalDrawingAvailability));
	$("#c3_hide").val(isNull(data.architecturalDrawingAvailability));
	$("#c4").html(isNull(data.constructionPhase));
	$("#c4_hide").val(isNull(data.constructionPhase));
	$("#c5").val(isNull(data.constructionDate));
	$("#c6").val(isNull(data.refurbishmentDate));
	$("#c7").val(isNull(data.refurbishmentDetails));
	$("#c8").html(isNull(data.structureType));
	$("#c8_hide").val(isNull(data.structureType));
	$("#c9").val(isNull(data.grossInternalArea));
	$("#c10").val(isNull(data.buildingFootprintArea));
	$("#c11").val(isNull(data.averageHeight));
	$("#c12").val(isNull(data.numberOfStoreys));	
	$("#c13").val(isNull(data.perimeterLengths));
	$("#c14").val(isNull(data.exposedPerimeterLengths));
	$("#c15").val(isNull(data.airPermeability));
	$("#c16").val(isNull(data.glazingToExternalWallPercentage));
	$("#c17").val(isNull(data.doorToExternalWallPercentage));
	$("#c18").html(isNull(data.roofType));
	$("#c18_hide").val(isNull(data.roofType));
	$("#c19").html(isNull(data.primaryVentilationStrategy));
	$("#c19_hide").val(isNull(data.primaryVentilationStrategy));
	$("#c20").html(isNull(data.primaryHeatingType));
	$("#c20_hide").val(isNull(data.primaryHeatingType));
	$("#c21").html(isNull(data.mainHeatingFuel));
	$("#c21_hide").val(isNull(data.mainHeatingFuel));
	$("#c22").val(isNull(data.mainHeatingSystemEfficiency));
	$("#c23").val(isNull(data.lightingCapacity));
	$("#c24").html(isNull(data.lightingControlType));
	$("#c24_hide").val(isNull(data.lightingControlType));

	$("#c25").val(isNull(data.chillers));
	$("#c26").html(isNull(data.coolingType));
	$("#c26_hide").val(isNull(data.coolingType));
	$("#c27").val(isNull(data.annualOccupancyHours));
	$("#c28").val(isNull(data.numberOfOccupants));
	$("#c29").html(isNull(data.activityType1));
	$("#c29_hide").val(isNull(data.activityType1));
	$("#c30").val(isNull(data.activityType1FloorArea));
	$("#c31").val(isNull(data.serverRoom));
	$("#c32").html(isNull(data.sustainabilityCertificationType));
	$("#c32_hide").val(isNull(data.sustainabilityCertificationType));
	$("#c33").html(isNull(data.sustainabilityCertificationRating));
	$("#c33_hide").val(isNull(data.sustainabilityCertificationRating));
	$("#c34").html(isNull(data.cateringKitchen));
	$("#c34_hide").val(isNull(data.cateringKitchen));
	$("#c35").val(isNull(data.numberOfMealsServed));
	$("#c36").val(isNull(data.numberOfLifts));
	$("#c37").html(isNull(data.liftType));
	$("#c37_hide").val(isNull(data.liftType));
	$("#c38").html(isNull(data.activityType2));
	$("#c38_hide").val(isNull(data.activityType2));
	$("#c39").val(isNull(data.activityType2FloorArea));
	$("#c40").val(isNull(data.chillerCapacity));
	$("#c41").val(isNull(data.subMetering));
	$("#c42").val(isNull(data.deleted)),
	
	$("#f1").html(isNull(data.parameterType));
	$("#f1_hide").val(isNull(data.parameterType));
	$("#f2").val(isNull(data.supplier));
	
	$("#g1").html(isNull(data.recordType));
	$("#g1_hide").val(isNull(data.recordType));
	$("#g2").html(isNull(data.meteringLevel));
	$("#g2_hide").val(isNull(data.meteringLevel));
	$("#g3").html(isNull(data.monitoringPeriod));
	$("#g3_hide").val(isNull(data.monitoringPeriod));
	$("#g4").val(isNull(data.monitoringStartDate));
	$("#g5").val(isNull(data.monitoringEndDate));
	$("#g6").html(isNull(data.fuelType));
	$("#g6_hide").val(isNull(data.fuelType));
	$("#g7").html(isNull(data.fuelTypeUnit));
	$("#g7_hide").val(isNull(data.fuelTypeUnit));
	$("#g8").val(isNull(data.fuelTypeConsumption));
	$("#g9").html(isNull(data.endUseType));
	$("#g9_hide").val(isNull(data.endUseType));
	$("#g10").html(isNull(data.bms));
	$("#g10_hide").val(isNull(data.bms));
}

// Room & Element 增删改查
$("body").on("click","#roomBox a",function(){
	var $tag = $(this).data('type');
	var $thisID = $(this).data('id');
	var $v1 = $(this).data('v1');
	var $v2 = $(this).data('v2');
	var $v3 = $(this).data('v3');
	
	if($tag=="addRoom"){
		$thisID = buildingID;
		$('#roomContent').modal('show');
		nameRoom($tag,$thisID,getLangStr("top_add"),"roomType","floorLocation","grossInternalArea","","","");
	}else if($tag=="delRoom"){
		
		$('#delRoomOk').modal('show');
		$("#removeRoom").click(function(){
			$.ajax({
				url:"/admin/project/single/topBuilding/room_del",
				data:{topRoomID:$thisID},
				type:"POST",
				success:function(e){
					console.log(e);
					showRoom(buildingID);
				}
			});
			return false;
		});
	}else if($tag=="updateRoom"){
		$('#roomContent').modal('show');
		nameRoom($tag,$thisID,getLangStr("top_update"),"roomType","floorLocation","grossInternalArea",$v1,$v2,$v3);
	}else if($tag=="addElement"){
		$('#roomContent').modal('show');
		nameRoom($tag,$thisID,getLangStr("top_add"),"Element Type","Element Area","Element U Value","","","");
	}else if($tag=="delElement"){
		$.ajax({
			url:"/building/deleteTopElement",
			data:{topElementID:$thisID},
			type:"POST",
			success:function(e){
				console.log(e);
				showRoom(buildingID);
			}
		});
	}else if($tag=="updateElement"){
		$('#roomContent').modal('show');
		nameRoom($tag,$thisID,getLangStr("top_update"),"Element Type","Element Area","Element U Value",$v1,$v2,$v3);
	}
	
	return false;
});


// room弹出层文字
function nameRoom($tag,id,a,b,c,d,e,f,g){
	$("#rid").val(id);
	$("#rtype").val($tag);
	$("#r_0").text(a);
	$("#r_1").text(b);
	$("#r_2").text(c);
	$("#r_3").text(d);
	$("#r_1_v").val(e);
	$("#r_2_v").val(f);
	$("#r_3_v").val(g);
}

// 修改room
$("#subRoom").click(function(){
	var id = $("#rid").val();
	var type = $("#rtype").val();
	var v_1 = $("#r_1_v").val();
	var v_2 = $("#r_2_v").val();
	var v_3 = $("#r_3_v").val();
	
	if(type=="addRoom"){
		$.ajax({
			url:"/admin/project/single/topBuilding/room_add",
			data:{topBuildingID:id,roomType:v_1,floorLocation:v_2,grossInternalArea:v_3},
			type:"POST",
			success:function(e){
				console.log(e);
				if(e.code==200){
					showRoom(buildingID);
				}else{
					alertokMsg(getLangStr("top_err"),getLangStr("alert_ok")); 
				}
			},
			error:function(){
				alertokMsg(getLangStr("top_err"),getLangStr("alert_ok")); 
			}
		});
	}else if(type=="addElement"){
		$.ajax({
			url:"/building/addTopElement",
			data:{topRoomID:id,elementType:v_1,elementArea:v_2,elementUValue:v_3},
			type:"POST",
			success:function(e){
				console.log(e);
				if(e.code==200){
					showRoom(buildingID);
				}else{
					alertokMsg(getLangStr("top_err"),getLangStr("alert_ok")); 
				}
			},
			error:function(){
				alertokMsg(getLangStr("top_err"),getLangStr("alert_ok")); 
			}
		});
	}else if(type=="updateElement"){
		$.ajax({
			url:"/building/updateTopElement",
			data:{topElementID:id,elementType:v_1,elementArea:v_2,elementUValue:v_3},
			type:"POST",
			success:function(e){
				console.log(e);
				if(e.code==200){
					showRoom(buildingID);
				}else{
					alertokMsg(getLangStr("top_err"),getLangStr("alert_ok")); 
				}
			},
			error:function(){
				alertokMsg(getLangStr("top_err"),getLangStr("alert_ok")); 
			}
		});
	}else if(type=="updateRoom"){
		$.ajax({
			url:"/admin/project/single/topBuilding/room_edit",
			data:{topRoomID:id,roomType:v_1,floorLocation:v_2,grossInternalArea:v_3},
			type:"POST",
			success:function(e){
				console.log(e);
				if(e.code==200){
					showRoom(buildingID);
				}else{
					alertokMsg(getLangStr("top_err"),getLangStr("alert_ok")); 
				}
			},
			error:function(){
				alertokMsg(getLangStr("top_err"),getLangStr("alert_ok")); 
			}
		});
	}
})

$("#submit_sheet_1,#submit_sheet_2,#submit_sheet_3,#submit_sheet_6,#submit_sheet_7").click(function(){
	addLoading();
	///building/updateTopBuilding
	//参数：Long projectID
	//projectID = teamID;
	var reg = /^\d+(.\d+)?$/;
	if(!reg.test($("#a7_hide").val()) && $("#a7_hide").val())  {alertokMsg(getLangStr("top_building_base_msg_1"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#b5").val()) && $("#b5").val())  {alertokMsg(getLangStr("top_building_base_msg_2"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c5").val()) && $("#c5").val())  {alertokMsg(getLangStr("top_building_base_msg_3"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c6").val()) && $("#c6").val())  {alertokMsg(getLangStr("top_building_base_msg_4"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c9").val()) && $("#c9").val())  {alertokMsg(getLangStr("top_building_base_msg_5"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c10").val()) && $("#c10").val())  {alertokMsg(getLangStr("top_building_base_msg_6"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c11").val()) && $("#c11").val())  {alertokMsg(getLangStr("top_building_base_msg_7"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c12").val()) && $("#c12").val())  {alertokMsg(getLangStr("top_building_base_msg_8"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c13").val()) && $("#c13").val())  {alertokMsg(getLangStr("top_building_base_msg_9"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c14").val()) && $("#c14").val())  {alertokMsg(getLangStr("top_building_base_msg_23"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c15").val()) && $("#c15").val())  {alertokMsg(getLangStr("top_building_base_msg_10"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c16").val()) && $("#c16").val())  {alertokMsg(getLangStr("top_building_base_msg_11"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c17").val()) && $("#c17").val())  {alertokMsg(getLangStr("top_building_base_msg_12"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c22").val()) && $("#c22").val())  {alertokMsg(getLangStr("top_building_base_msg_13"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c23").val()) && $("#c23").val())  {alertokMsg(getLangStr("top_building_base_msg_14"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c25").val()) && $("#c25").val())  {alertokMsg(getLangStr("top_building_base_msg_15"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c27").val()) && $("#c27").val())  {alertokMsg(getLangStr("top_building_base_msg_16"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c28").val()) && $("#c28").val())  {alertokMsg(getLangStr("top_building_base_msg_17"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c30").val()) && $("#c30").val())  {alertokMsg(getLangStr("top_building_base_msg_18"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c39").val()) && $("#c39").val())  {alertokMsg(getLangStr("top_building_base_msg_19"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c35").val()) && $("#c35").val())  {alertokMsg(getLangStr("top_building_base_msg_20"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#c36").val()) && $("#c36").val())  {alertokMsg(getLangStr("top_building_base_msg_21"),getLangStr("alert_ok"));removeLoading(); return;}
	if(!reg.test($("#g8").val()) && $("#g8").val())  {alertokMsg(getLangStr("top_building_base_msg_22"),getLangStr("alert_ok"));removeLoading(); return;}
	var jsonPost = {
			buildingID:buildingIDs,
			energyID:energyIDs,
			equipmentID:equipmentIDs,
			organisationID:organisationIDs,
			siteID:siteIDs,
			name:name,
			id:buildingID,
			projectID:teamID,
			organisationName:$("#a1").val(),
			organisationAddressline1:$("#a2").val(),
			organisationCity:$("#a3_hide").val(),
			organisationPostcode:$("#a4").val(),
			organisationCountry:$("#a5_hide").val(),
			sectorType:$("#a6_hide").val(),
			siteNumber:$("#a7_hide").val(),
			organisationAddressline2:$("#a8").val(),
			organisationAddressline3:$("#a9").val(),
			organisationAddressline4:$("#a10").val(),
			siteAddressline1:$("#b1").val(),
			siteAddressline2:$("#b9").val(),
			siteAddressline3:$("#b10").val(),
			siteAddressline4:$("#b11").val(),
			siteCity:$("#b2_hide").val(),
			sitePostcode:$("#b3").val(),
			siteCountry:$("#b4_hide").val(),
			numberOfBuildings:$("#b5").val(),
			urbanContext:$("#b6_hide").val(),
			swimmingPool:$("#b7_hide").val(),
			poolType:$("#b8_hide").val(),
			primaryActivityType:$("#c1_hide").val(),
			tenancyType:$("#c2_hide").val(),
			architecturalDrawingAvailability:$("#c3_hide").val(),
			constructionPhase:$("#c4_hide").val(),
			constructionDate:$("#c5").val(),
			refurbishmentDate:$("#c6").val(),
			refurbishmentDetails:$("#c7").val(),
			structureType:$("#c8_hide").val(),
			grossInternalArea:$("#c9").val(),
			buildingFootprintArea:$("#c10").val(),
			averageHeight:$("#c11").val(),
			numberOfStoreys:$("#c12").val(),	
			perimeterLengths:$("#c13").val(),
			exposedPerimeterLengths:$("#c14").val(),
			airPermeability:$("#c15").val(),
			glazingToExternalWallPercentage:$("#c16").val(),
			doorToExternalWallPercentage:$("#c17").val(),
			roofType:$("#c18_hide").val(),
			primaryVentilationStrategy:$("#c19_hide").val(),
			primaryHeatingType:$("#c20_hide").val(),
			mainHeatingFuel:$("#c21_hide").val(),
			mainHeatingSystemEfficiency:$("#c22").val(),
			lightingCapacity:$("#c23").val(),
			lightingControlType:$("#c24_hide").val(),
			chillers:$("#c25").val(),
			coolingType:$("#c26_hide").val(),
			annualOccupancyHours:$("#c27").val(),
			numberOfOccupants:$("#c28").val(),
			activityType1:$("#c29_hide").val(),
			activityType1FloorArea:$("#c30").val(),
			activityType2:$("#c38_hide").val(),
			activityType2FloorArea:$("#c39").val(),
			serverRoom:$("#c31").val(),
			sustainabilityCertificationType:$("#c32_hide").val(),
			sustainabilityCertificationRating:$("#c33_hide").val(),
			cateringKitchen:$("#c34_hide").val(),
			numberOfMealsServed:$("#c35").val(),
			numberOfLifts:$("#c36").val(),
			liftType:$("#c37_hide").val(),
			chillerCapacity:$("#c40").val(),
			subMetering:$("#c41").val(),
			deleted:$("#c42").val(),
			parameterType:$("#f1_hide").val(),
			supplier:$("#f2").val(),
			recordType:$("#g1_hide").val(),
			meteringLevel:$("#g2_hide").val(),
			monitoringPeriod:$("#g3_hide").val(),
			monitoringStartDate:$("#g4").val(),
			monitoringEndDate:$("#g5").val(),
			fuelType:$("#g6_hide").val(),
			fuelTypeUnit:$("#g7_hide").val(),
			fuelTypeConsumption:$("#g8").val(),
			endUseType:$("#g9_hide").val(),
			bms:$("#g10_hide").val()
	}
	
	$.ajax({
		url:"/admin/project/single/topBuilding/update",
		data:jsonPost,
		type:"POST",
		success:function(e){
			console.log(e);
			removeLoading();
			if(e.code==200){
				getBuildingInfo(buildingID);
			}else{
				alertokMsg(getLangStr("top_err"),getLangStr("alert_ok"));
			}
		},
		error:function(){
			alertokMsg(getLangStr("top_err"),getLangStr("alert_ok")); 
			removeLoading();
		}
	});
});


// 展开 收缩
$("body").on("click",".tr_click",function(){
	var $flag = $(this).text();
	if($flag=="+"){
		$(this).parent().next(".tr_more").show();
		$(this).text("-");
	}else{
		$(this).parent().next(".tr_more").hide();
		$(this).text("+");
	}
	
});



