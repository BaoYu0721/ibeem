var deviceMsg = eval('(' + localStorage.getItem("deviceNameId") + ')');
var deviceId = deviceMsg[0].id;
var deviceName = deviceMsg[0].name;

$(function(){
	$(".ui.checkbox").checkbox();
	$("#save").click(saveData);
	
	$("#deviceName").html(deviceName);
	initData();
})
//获取json数据，放到页面上
function initData(){
	var returnDataJson = {};
	var url="/device/assessment";
	var json={
		deviceId: deviceId
	};
	var successFunc = function(data){
		if(data.code=="200"){
			if(data.content == null || data.content=="")return;
			returnDataJson = eval('(' + data.content + ')');
			if(returnDataJson["part1"] == null || returnDataJson["part1"] == "" )return;
//			var ieqSeries = returnDataJson["part1"]["data"]["series"];
			var dblSeries = returnDataJson["part1"]["data"]["seriesDBL"];
			var mydSeries = returnDataJson["part2"]["data"]["series"];
			
//			for(var i=0;i<ieqSeries.length;i++){
//				var thisItem = ieqSeries[i];
//				if(thisItem.name == "本建筑"){
//					var thidData = thisItem.data;
//					$("#ieq_dqjz_rssd").val(thidData[0]);
//					$("#ieq_dqjz_iaq").val(thidData[1]);
//					$("#ieq_dqjz_ghj").val(thidData[2]);
//					$("#ieq_dqjz_shj").val(thidData[3]);
//					$("#ieq_dqjz_ztpj").val(thidData[4]);
//				}else if(thisItem.name == "同气候区建筑"){
//					var thidData = thisItem.data;
//					$("#ieq_bsjz_rssd").val(thidData[0]);
//					$("#ieq_bsjz_iaq").val(thidData[1]);
//					$("#ieq_bsjz_ghj").val(thidData[2]);
//					$("#ieq_bsjz_shj").val(thidData[3]);
//					$("#ieq_bsjz_ztpj").val(thidData[4]);
//				}else if(thisItem.name == "全国建筑"){
//					var thidData = thisItem.data;
//					$("#ieq_qgjz_rssd").val(thidData[0]);
//					$("#ieq_qgjz_iaq").val(thidData[1]);
//					$("#ieq_qgjz_ghj").val(thidData[2]);
//					$("#ieq_qgjz_shj").val(thidData[3]);
//					$("#ieq_qgjz_ztpj").val(thidData[4]);
//				}
//			}
			for(var i=0;i<mydSeries.length;i++){
				var thisItem = mydSeries[i];
				if(thisItem.name == "本建筑"){
					var thidData = thisItem.data;
					$("#myd_dqjz_ztpj").val(thidData[0]);
					$("#myd_dqjz_rssd").val(thidData[1]);
					$("#myd_dqjz_iaq").val(thidData[2]);
					$("#myd_dqjz_ghj").val(thidData[3]);
					$("#myd_dqjz_shj").val(thidData[4]);
					
				}else if(thisItem.name == "同气候区建筑"){
					var thidData = thisItem.data;
					$("#myd_bsjz_ztpj").val(thidData[0]);
					$("#myd_bsjz_rssd").val(thidData[1]);
					$("#myd_bsjz_iaq").val(thidData[2]);
					$("#myd_bsjz_ghj").val(thidData[3]);
					$("#myd_bsjz_shj").val(thidData[4]);
					
				}else if(thisItem.name == "全国建筑"){
					var thidData = thisItem.data;
					$("#myd_qgjz_ztpj").val(thidData[0]);
					$("#myd_qgjz_rssd").val(thidData[1]);
					$("#myd_qgjz_iaq").val(thidData[2]);
					$("#myd_qgjz_ghj").val(thidData[3]);
					$("#myd_qgjz_shj").val(thidData[4]);
				}
			}
			//达标率			
			$("#dbl_dqjz_rssd").val(dblSeries[0]["dataPer"][0]);
			$("#dbl_dqjz_iaq").val(dblSeries[1]["dataPer"][0]);
			$("#dbl_dqjz_ghj").val(dblSeries[2]["dataPer"][0]);
			$("#dbl_dqjz_shj").val(dblSeries[3]["dataPer"][0]);
			$("#dbl_bsjz_rssd").val(dblSeries[4]["dataPer"][0]);
			$("#dbl_bsjz_iaq").val(dblSeries[5]["dataPer"][0]);
			$("#dbl_bsjz_ghj").val(dblSeries[6]["dataPer"][0]);
			$("#dbl_bsjz_shj").val(dblSeries[7]["dataPer"][0]);
			$("#dbl_qgjz_rssd").val(dblSeries[8]["dataPer"][0]);
			$("#dbl_qgjz_iaq").val(dblSeries[9]["dataPer"][0]);
			$("#dbl_qgjz_ghj").val(dblSeries[10]["dataPer"][0]);
			$("#dbl_qgjz_shj").val(dblSeries[11]["dataPer"][0]);
		}else{
			alertokMsg("系统繁忙请重试","确定");
		}
	}
	var errorFunc = function(data){
		alert("error");
	}
	sentJson(url,json,successFunc,errorFunc);
}
//保存修改后的数据
function saveData(){
	var returnDataJson = {
			"part1":{
				"name":"IEQ",
				"data":{
					"series":[{
						
					}],
					"seriesDBL":[{
						
					}]
				}
			},
			"part2":{
				"name":"MYD",
				"data":{
					"series":[{
						
					}]
				}
			}
	};
	
//	//==========获取IEQ数据=============
//	var ieqSeries = [];
//	//====IEQ数据==本建筑
//	var ieq_dqjz=[];
//	var ieq_dqjz_rssd = $("#ieq_dqjz_rssd").val();
//	var ieq_dqjz_iaq = $("#ieq_dqjz_iaq").val();
//	var ieq_dqjz_ghj = $("#ieq_dqjz_ghj").val();
//	var ieq_dqjz_shj = $("#ieq_dqjz_shj").val();
//	var ieq_dqjz_ztpj = $("#ieq_dqjz_ztpj").val();
//	if(!verification(ieq_dqjz_rssd,"IEQ本建筑热环境"))return;
//	if(!verification(ieq_dqjz_iaq,"IEQ本建筑空气品质"))return;
//	if(!verification(ieq_dqjz_ghj,"IEQ本建筑光环境"))return;
//	if(!verification(ieq_dqjz_shj,"IEQ本建筑声环境"))return;
//	if(!verification(ieq_dqjz_ztpj,"IEQ本建筑综合评价"))return;
//	ieq_dqjz.push(parseFloat(ieq_dqjz_rssd));
//	ieq_dqjz.push(parseFloat(ieq_dqjz_iaq));
//	ieq_dqjz.push(parseFloat(ieq_dqjz_ghj));
//	ieq_dqjz.push(parseFloat(ieq_dqjz_shj));
//	ieq_dqjz.push(parseFloat(ieq_dqjz_ztpj));
//	ieqSeries.push({
//		"name":"本建筑",
//		"pointPlacement":"on",
//		"data":ieq_dqjz
//	});
//	//====IEQ数据==同气候区建筑
//	var ieq_bsjz=[];
//	var ieq_bsjz_rssd = $("#ieq_bsjz_rssd").val();
//	var ieq_bsjz_iaq = $("#ieq_bsjz_iaq").val();
//	var ieq_bsjz_ghj = $("#ieq_bsjz_ghj").val();
//	var ieq_bsjz_shj = $("#ieq_bsjz_shj").val();
//	var ieq_bsjz_ztpj = $("#ieq_bsjz_ztpj").val();
//	if(!verification(ieq_bsjz_rssd,"IEQ同气候区建筑热环境"))return;
//	if(!verification(ieq_bsjz_iaq,"IEQ同气候区建筑空气品质"))return;
//	if(!verification(ieq_bsjz_ghj,"IEQ同气候区建筑光环境"))return;
//	if(!verification(ieq_bsjz_shj,"IEQ同气候区建筑声环境"))return;
//	if(!verification(ieq_bsjz_ztpj,"IEQ同气候区建筑综合评价"))return;
//	ieq_bsjz.push(parseFloat(ieq_bsjz_rssd));
//	ieq_bsjz.push(parseFloat(ieq_bsjz_iaq));
//	ieq_bsjz.push(parseFloat(ieq_bsjz_ghj));
//	ieq_bsjz.push(parseFloat(ieq_bsjz_shj));
//	ieq_bsjz.push(parseFloat(ieq_bsjz_ztpj));
//	ieqSeries.push({
//		"name":"同气候区建筑",
//		"pointPlacement":"on",
//		"data":ieq_bsjz
//	});
//	//====IEQ数据==全国建筑
//	var ieq_qgjz=[];
//	var ieq_qgjz_rssd = $("#ieq_qgjz_rssd").val();
//	var ieq_qgjz_iaq = $("#ieq_qgjz_iaq").val();
//	var ieq_qgjz_ghj = $("#ieq_qgjz_ghj").val();
//	var ieq_qgjz_shj = $("#ieq_qgjz_shj").val();
//	var ieq_qgjz_ztpj = $("#ieq_qgjz_ztpj").val();
//	if(!verification(ieq_qgjz_rssd,"IEQ全国建筑热环境"))return;
//	if(!verification(ieq_qgjz_iaq,"IEQ全国建筑空气品质"))return;
//	if(!verification(ieq_qgjz_ghj,"IEQ全国建筑光环境"))return;
//	if(!verification(ieq_qgjz_shj,"IEQ全国建筑声环境"))return;
//	if(!verification(ieq_qgjz_ztpj,"IEQ全国建筑综合评价"))return;
//	ieq_qgjz.push(parseFloat(ieq_qgjz_rssd));
//	ieq_qgjz.push(parseFloat(ieq_qgjz_iaq));
//	ieq_qgjz.push(parseFloat(ieq_qgjz_ghj));
//	ieq_qgjz.push(parseFloat(ieq_qgjz_shj));
//	ieq_qgjz.push(parseFloat(ieq_qgjz_ztpj));
//	ieqSeries.push({
//		"name":"全国建筑",
//		"pointPlacement":"on",
//		"data":ieq_qgjz
//	});
	//==========获取IEQ达标率数据==========
	var dblSeries = [];
	//====IEQ数据==本建筑
	var dbl_dqjz=[];
	var reg = /^\d+(.\d+)?$/;
	var dbl_dqjz_rssd = $("#dbl_dqjz_rssd").val();
	var dbl_dqjz_iaq = $("#dbl_dqjz_iaq").val();
	var dbl_dqjz_ghj = $("#dbl_dqjz_ghj").val();
	var dbl_dqjz_shj = $("#dbl_dqjz_shj").val();
	if((!reg.test(dbl_dqjz_rssd) && dbl_dqjz_rssd))alertokMsg(getLangStr("evaluate_msg1"),getLangStr("alert_ok"));
	if((!reg.test(dbl_dqjz_iaq) && dbl_dqjz_iaq))alertokMsg(getLangStr("evaluate_msg2"),getLangStr("alert_ok"));
	if((!reg.test(dbl_dqjz_ghj) && dbl_dqjz_ghj))alertokMsg(getLangStr("evaluate_msg3"),getLangStr("alert_ok"));
	if((!reg.test(dbl_dqjz_shj) && dbl_dqjz_shj))alertokMsg(getLangStr("evaluate_msg4"),getLangStr("alert_ok"));
	if(!verification(dbl_dqjz_rssd,"本建筑热达标"))return;
	if(!verification(dbl_dqjz_iaq,"本建筑PM2.5达标"))return;
	if(!verification(dbl_dqjz_ghj,"本建筑CO2达标"))return;
	if(!verification(dbl_dqjz_shj,"本建筑照度达标"))return;
	dblSeries.push({
		"titleText":"热达标",
		"dataPer":[parseFloat(dbl_dqjz_rssd)]
	})
	dblSeries.push({
		"titleText":"PM2.5达标",
		"dataPer":[parseFloat(dbl_dqjz_iaq)]
	})
	dblSeries.push({
		"titleText":"CO2达标",
		"dataPer":[parseFloat(dbl_dqjz_ghj)]
	})
	dblSeries.push({
		"titleText":"照度达标",
		"dataPer":[parseFloat(dbl_dqjz_shj)]
	})
	//====IEQ数据==同气候区建筑
	var dbl_bsjz=[];
	var dbl_bsjz_rssd = $("#dbl_bsjz_rssd").val();
	var dbl_bsjz_iaq = $("#dbl_bsjz_iaq").val();
	var dbl_bsjz_ghj = $("#dbl_bsjz_ghj").val();
	var dbl_bsjz_shj = $("#dbl_bsjz_shj").val();
	if((!reg.test(dbl_bsjz_rssd) && dbl_bsjz_rssd)) alertokMsg(getLangStr("evaluate_msg5"),getLangStr("alert_ok"));
	if((!reg.test(dbl_bsjz_iaq) && dbl_bsjz_iaq)) alertokMsg(getLangStr("evaluate_msg6"),getLangStr("alert_ok"));
	if((!reg.test(dbl_bsjz_ghj) && dbl_bsjz_ghj)) alertokMsg(getLangStr("evaluate_msg7"),getLangStr("alert_ok"));
	if((!reg.test(dbl_bsjz_shj) && dbl_bsjz_shj)) alertokMsg(getLangStr("evaluate_msg8"),getLangStr("alert_ok"));
	if(!verification(dbl_bsjz_rssd,"同气候区建筑热达标"))return;
	if(!verification(dbl_bsjz_iaq,"同气候区建筑PM2.5达标"))return;
	if(!verification(dbl_bsjz_ghj,"同气候区建筑CO2达标"))return;
	if(!verification(dbl_bsjz_shj,"同气候区建筑照度达标"))return;
	dblSeries.push({
		"titleText":"热达标",
		"dataPer":[parseFloat(dbl_bsjz_rssd)]
	})
	dblSeries.push({
		"titleText":"PM2.5达标",
		"dataPer":[parseFloat(dbl_bsjz_iaq)]
	})
	dblSeries.push({
		"titleText":"CO2达标",
		"dataPer":[parseFloat(dbl_bsjz_ghj)]
	})
	dblSeries.push({
		"titleText":"照度达标",
		"dataPer":[parseFloat(dbl_bsjz_shj)]
	})
	//====IEQ数据==全国建筑
	var dbl_qgjz=[];
	var dbl_qgjz_rssd = $("#dbl_qgjz_rssd").val();
	var dbl_qgjz_iaq = $("#dbl_qgjz_iaq").val();
	var dbl_qgjz_ghj = $("#dbl_qgjz_ghj").val();
	var dbl_qgjz_shj = $("#dbl_qgjz_shj").val();
	if((!reg.test(dbl_qgjz_rssd) && dbl_qgjz_rssd)) alertokMsg(getLangStr("evaluate_msg9"),getLangStr("alert_ok"));
	if((!reg.test(dbl_qgjz_iaq) && dbl_qgjz_iaq)) alertokMsg(getLangStr("evaluate_msg10"),getLangStr("alert_ok"));
	if((!reg.test(dbl_qgjz_ghj) && dbl_qgjz_ghj)) alertokMsg(getLangStr("evaluate_msg11"),getLangStr("alert_ok"));
	if((!reg.test(dbl_qgjz_shj) && dbl_qgjz_shj)) alertokMsg(getLangStr("evaluate_msg12"),getLangStr("alert_ok"));
	if(!verification(dbl_qgjz_rssd,"全国建筑热达标"))return;
	if(!verification(dbl_qgjz_iaq,"全国建筑PM2.5达标"))return;
	if(!verification(dbl_qgjz_ghj,"全国建筑CO2达标"))return;
	if(!verification(dbl_qgjz_shj,"全国建筑照度达标"))return;
	dblSeries.push({
		"titleText":"热达标",
		"dataPer":[parseFloat(dbl_qgjz_rssd)]
	})
	dblSeries.push({
		"titleText":"PM2.5达标",
		"dataPer":[parseFloat(dbl_qgjz_iaq)]
	})
	dblSeries.push({
		"titleText":"CO2达标",
		"dataPer":[parseFloat(dbl_qgjz_ghj)]
	})
	dblSeries.push({
		"titleText":"照度达标",
		"dataPer":[parseFloat(dbl_qgjz_shj)]
	})
	//==========获取满意度数据==========
	var mydSeries = [];
	//====IEQ数据==本建筑
	var myd_dqjz=[];
	var myd_dqjz_rssd = $("#myd_dqjz_rssd").val();
	var myd_dqjz_iaq = $("#myd_dqjz_iaq").val();
	var myd_dqjz_ghj = $("#myd_dqjz_ghj").val();
	var myd_dqjz_shj = $("#myd_dqjz_shj").val();
	var myd_dqjz_ztpj = $("#myd_dqjz_ztpj").val();
	if((!reg.test(myd_dqjz_rssd) && myd_dqjz_rssd)) alertokMsg(getLangStr("evaluate_msg13"),getLangStr("alert_ok"));
	if((!reg.test(myd_dqjz_iaq) && myd_dqjz_iaq)) alertokMsg(getLangStr("evaluate_msg14"),getLangStr("alert_ok"));
	if((!reg.test(myd_dqjz_ghj) && myd_dqjz_ghj)) alertokMsg(getLangStr("evaluate_msg15"),getLangStr("alert_ok"));
	if((!reg.test(myd_dqjz_shj) && myd_dqjz_shj)) alertokMsg(getLangStr("evaluate_msg16"),getLangStr("alert_ok"));
	if((!reg.test(myd_dqjz_ztpj) && myd_dqjz_ztpj)) alertokMsg(getLangStr("evaluate_msg17"),getLangStr("alert_ok"));
	if(!verification(myd_dqjz_rssd,"本建筑热环境满意度"))return;
	if(!verification(myd_dqjz_iaq,"本建筑空气品质满意度"))return;
	if(!verification(myd_dqjz_ghj,"本建筑光环境满意度"))return;
	if(!verification(myd_dqjz_shj,"本建筑声环境满意度"))return;
	if(!verification(myd_dqjz_ztpj,"本建筑综合评价满意度"))return;
	myd_dqjz.push(parseFloat(myd_dqjz_ztpj));
	myd_dqjz.push(parseFloat(myd_dqjz_rssd));
	myd_dqjz.push(parseFloat(myd_dqjz_iaq));
	myd_dqjz.push(parseFloat(myd_dqjz_ghj));
	myd_dqjz.push(parseFloat(myd_dqjz_shj));
	mydSeries.push({
		"name":"本建筑",
		"pointPlacement":"on",
		"data":myd_dqjz
	});
	//====IEQ数据==同气候区建筑
	var myd_bsjz=[];
	var myd_bsjz_rssd = $("#myd_bsjz_rssd").val();
	var myd_bsjz_iaq = $("#myd_bsjz_iaq").val();
	var myd_bsjz_ghj = $("#myd_bsjz_ghj").val();
	var myd_bsjz_shj = $("#myd_bsjz_shj").val();
	var myd_bsjz_ztpj = $("#myd_bsjz_ztpj").val();
	if((!reg.test(myd_bsjz_rssd) && myd_bsjz_rssd)) alertokMsg(getLangStr("evaluate_msg18"),getLangStr("alert_ok"));
	if((!reg.test(myd_bsjz_iaq) && myd_bsjz_iaq)) alertokMsg(getLangStr("evaluate_msg19"),getLangStr("alert_ok"));
	if((!reg.test(myd_bsjz_ghj) && myd_bsjz_ghj)) alertokMsg(getLangStr("evaluate_msg20"),getLangStr("alert_ok"));
	if((!reg.test(myd_bsjz_shj) && myd_bsjz_shj)) alertokMsg(getLangStr("evaluate_msg21"),getLangStr("alert_ok"));
	if((!reg.test(myd_bsjz_ztpj) && myd_bsjz_ztpj)) alertokMsg(getLangStr("evaluate_msg22"),getLangStr("alert_ok"));
	if(!verification(myd_bsjz_rssd,"同气候区建筑热环境满意度"))return;
	if(!verification(myd_bsjz_iaq,"同气候区建筑空气品质满意度"))return;
	if(!verification(myd_bsjz_ghj,"同气候区建筑光环境满意度"))return;
	if(!verification(myd_bsjz_shj,"同气候区建筑声环境满意度"))return;
	if(!verification(myd_bsjz_ztpj,"同气候区建筑综合评价满意度"))return;
	myd_bsjz.push(parseFloat(myd_bsjz_ztpj));
	myd_bsjz.push(parseFloat(myd_bsjz_rssd));
	myd_bsjz.push(parseFloat(myd_bsjz_iaq));
	myd_bsjz.push(parseFloat(myd_bsjz_ghj));
	myd_bsjz.push(parseFloat(myd_bsjz_shj));
	mydSeries.push({
		"name":"同气候区建筑",
		"pointPlacement":"on",
		"data":myd_bsjz
	});
	//====IEQ数据==全国建筑
	var myd_qgjz=[];
	var myd_qgjz_rssd = $("#myd_qgjz_rssd").val();
	var myd_qgjz_iaq = $("#myd_qgjz_iaq").val();
	var myd_qgjz_ghj = $("#myd_qgjz_ghj").val();
	var myd_qgjz_shj = $("#myd_qgjz_shj").val();
	var myd_qgjz_ztpj = $("#myd_qgjz_ztpj").val();
	if((!reg.test(myd_qgjz_rssd) && myd_qgjz_rssd)) alertokMsg(getLangStr("evaluate_msg23"),getLangStr("alert_ok"));
	if((!reg.test(myd_qgjz_iaq) && myd_qgjz_iaq)) alertokMsg(getLangStr("evaluate_msg24"),getLangStr("alert_ok"));
	if((!reg.test(myd_qgjz_ghj) && myd_qgjz_ghj)) alertokMsg(getLangStr("evaluate_msg25"),getLangStr("alert_ok"));
	if((!reg.test(myd_qgjz_shj) && myd_qgjz_shj)) alertokMsg(getLangStr("evaluate_msg26"),getLangStr("alert_ok"));
	if((!reg.test(myd_qgjz_ztpj) && myd_qgjz_ztpj)) alertokMsg(getLangStr("evaluate_msg27"),getLangStr("alert_ok"));
	if(!verification(myd_qgjz_rssd,"全国建筑热环境满意度"))return;
	if(!verification(myd_qgjz_iaq,"全国建筑空气品质满意度"))return;
	if(!verification(myd_qgjz_ghj,"全国建筑光环境满意度"))return;
	if(!verification(myd_qgjz_shj,"全国建筑声环境满意度"))return;
	if(!verification(myd_qgjz_ztpj,"全国建筑综合评价满意度"))return;
	myd_qgjz.push(parseFloat(myd_qgjz_ztpj));
	myd_qgjz.push(parseFloat(myd_qgjz_rssd));
	myd_qgjz.push(parseFloat(myd_qgjz_iaq));
	myd_qgjz.push(parseFloat(myd_qgjz_ghj));
	myd_qgjz.push(parseFloat(myd_qgjz_shj));
	mydSeries.push({
		"name":"全国建筑",
		"pointPlacement":"on",
		"data":myd_qgjz
	});
//	returnDataJson["part1"]["data"]["series"] = ieqSeries;
	returnDataJson["part1"]["data"]["seriesDBL"] = dblSeries;
	returnDataJson["part2"]["data"]["series"] = mydSeries;
	
	var url="/device/assessment/save";
	var json={"deviceID":deviceId,"content":JSON.stringify(returnDataJson)};
	var successFunc = function(data){
		if(data.code=="200"){
			alertokMsg("保存成功","确定");
		}else{
			alertokMsg("系统繁忙请重试","确定");
		}
	}
	var errorFunc = function(data){
		alert("error");
	}
	sentJson(url,json,successFunc,errorFunc);
}
function verification(value,name){
	if(value==undefined || value==null || value==""){
		alertokMsg(name+"不能为空","确定");
		return false;
	}else{
		return true;
	}
}
