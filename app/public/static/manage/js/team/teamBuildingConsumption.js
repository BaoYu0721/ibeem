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
var consumptionID ;
//获取项目下建筑详细信息
function getBuildingConsumption(){
	var url="/project/single/building/energy";
	var json={"buildingID":buildingID};
	var successFunc = function(data){
		var consumption = data.energyConsumption;
		
		consumptionID = consumption.id;
		
		var table_1_1 = consumption.aeu;
		var table_1_2 = consumption.elecDs;
		var table_1_3 = consumption.elecComment;
		var table_2_1 = consumption.secEs;
		var table_2_2 = consumption.secAu;
		var table_2_3 = consumption.secDs;
		var table_2_4 = consumption.secComment;
		var table_3_1 = consumption.thiEs;
		var table_3_2 = consumption.thiAu;
		var table_3_3 = consumption.thiDs;
		var table_3_4 = consumption.thiCommen;
		var table_4_1 = consumption.fouEs;
		var table_4_2 = consumption.fouAu;
		var table_4_3 = consumption.fouDs;
		var table_4_4 = consumption.fouComment;
		var table_5_1 = consumption.siteSource;
		var table_5_2 = consumption.siteAu;
		var table_5_3 = consumption.siteSd;
		var table_5_4 = consumption.siteDs;
		var table_5_5 = consumption.siteComment;
		var table_6_1 = consumption.siteChpMm;
		var table_6_2 = consumption.siteChpFs;
		var table_6_3 = consumption.siteChpRp;
		var table_6_4 = consumption.siteChpAfc;
		var table_6_5 = consumption.siteChpAeg;
		var table_6_6 = consumption.siteChpAhg;
		var table_6_7 = consumption.siteChpComment;
		var table_7_1 = consumption.seuDesc;
		var table_7_2 = consumption.seuPs;
		var table_7_3 = consumption.seuAeu;
		var table_7_4 = consumption.seuComment;
		var table_8_1 = consumption.ohWd;
		var table_8_2 = consumption.nwd;
		var table_8_3 = consumption.ohHd;
		var table_8_4 = consumption.nhd;
		
		
//		将数据放到页面
		$("#1_annual_ele_usage").val(table_1_1);
		$("#1_data_source").val(table_1_2);
		$("#1_comment").val(table_1_3);
		$("#2_source").val(table_2_1);
		$("#2_annual_usage").val(table_2_2);
		$("#2_data_source").val(table_2_3);
		$("#2_comment").val(table_2_4);
		$("#3_source").val(table_3_1);
		$("#3_annual_ele_usage").val(table_3_2);
		$("#3_data_source").val(table_3_3);
		$("#3_comment").val(table_3_4);
		$("#4_source").val(table_4_1);
		$("#4_annual_ele_usage").val(table_4_2);
		$("#4_data_source").val(table_4_3);
		$("#4_comment").val(table_4_4);
		$("#5_source").val(table_5_1);
		$("#5_annual_usage").val(table_5_2);
		$("#5_sys_desc").val(table_5_3);
		$("#5_data_source").val(table_5_4);
		$("#5_comment").val(table_5_5);
		$("#6_manufacturer_model").val(table_6_1);
		$("#6_fuel_source").val(table_6_2);
		$("#6_rated_power").val(table_6_3);
		$("#6_annual_fuel_consumption").val(table_6_4);
		$("#6_annual_ele_generation").val(table_6_5);
		$("#6_annual_heat_generation").val(table_6_6);
		$("#6_comment").val(table_6_7);
		$("#7_description").val(table_7_1);
		$("#7_primary_source").val(table_7_2);
		$("#7_annual_ele_usage").val(table_7_3);
		$("#7_comment").val(table_7_4);
		$("#8_working_occ_hour").val(table_8_1);
		$("#8_working_num").val(table_8_2);
		$("#8_holiday_occ_hour").val(table_8_3);
		$("#8_holiday_num").val(table_8_4);
	}
	sentJson(url,json,successFunc);
}
getBuildingConsumption();
//项目下能耗详细信息修改
$("#commitBuildingUpdate").on("click",function(){
	
	var aeu    = $("#1_annual_ele_usage").val();
	var elecDs    = $("#1_data_source").val();
	var elecComment    = $("#1_comment").val();
	var secEs    = $("#2_source").val();
	var secAu    = $("#2_annual_usage").val();
	var secDs    = $("#2_data_source").val();
	var secComment    = $("#2_comment").val();
	var thiEs    = $("#3_source").val();
	var thiAu    = $("#3_annual_ele_usage").val();
	var thiDs    = $("#3_data_source").val();
	var thiComment    = $("#3_comment").val();
	var fouEs    = $("#4_source").val();
	var fouAu    = $("#4_annual_ele_usage").val();
	var fouDs    = $("#4_data_source").val();
	var fouComment    = $("#4_comment").val();
	var siteSource    = $("#5_source").val();
	var siteAu    = $("#5_annual_usage").val();
	var siteSd    = $("#5_sys_desc").val();
	var siteDs    = $("#5_data_source").val();
	var siteComment    = $("#5_comment").val();
	var siteChpMm    = $("#6_manufacturer_model").val();
	var siteChpFs    = $("#6_fuel_source").val();
	var siteChpRp    = $("#6_rated_power").val();
	var siteChpAfc    = $("#6_annual_fuel_consumption").val();
	var siteChpAeg    = $("#6_annual_ele_generation").val();
	var siteChpAhg    = $("#6_annual_heat_generation").val();
	var siteChpComment    = $("#6_comment").val();
	var seuDesc    = $("#7_description").val();
	var seuPs    = $("#7_primary_source").val();
	var seuAeu    = $("#7_annual_ele_usage").val();
	var seuComment    = $("#7_comment").val();
	var ohWd    = $("#8_working_occ_hour").val();
	var nwd    = $("#8_working_num").val();
	var ohHd    = $("#8_holiday_occ_hour").val();
	var nhd   = $("#8_holiday_num").val();
	
	var url="/energyConsumption/updateEC";
	var json={"id":consumptionID,"buildingID":buildingID,"aeu":aeu,"elecDs":elecDs,"elecComment":elecComment,"secEs":secEs,"secAu":secAu,"secDs":secDs,"secComment":secComment,"thiEs":thiEs,"thiAu":thiAu,"thiDs":thiDs,"thiComment":thiComment,"fouEs":fouEs,"fouAu":fouAu,"fouDs":fouDs,"fouComment":fouComment,"siteSource":siteSource,"siteAu":siteAu,"siteSd":siteSd,"siteDs":siteDs,"siteComment":siteComment,"siteChpMm":siteChpMm,"siteChpFs":siteChpFs,"siteChpRp":siteChpRp,"siteChpAfc":siteChpAfc,"siteChpAeg":siteChpAeg,"siteChpAhg":siteChpAhg,"siteChpComment":siteChpComment,"seuDesc":seuDesc,"seuPs":seuPs,"seuAeu":seuAeu,"seuComment":seuComment,"ohWd":ohWd,"nwd":nwd,"ohHd":ohHd,"nhd":nhd};
	function successFunc(data){
		changestatus();
		$(".error h4").html("");
	}
	function errorFunc(data){
		var errormsg = data.messg;
		$(".error h4").html(errormsg);
	}
	sentJson(url,json,successFunc);
})
