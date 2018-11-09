/**
 * Created by xiaohe on 16/5/17.
 */
function loadGroup(){
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/team/list',
        data: {},
        success: function (data) {
            $("#selectGroup").html("");
            var loadMembered = true;
            if (data.status == 0) {
                for (id in data.teams){
                    var team = data.teams[id];
                    $("#selectGroup").append("<option value='"+team.team_id+"'>"+team.teamname+"</option>");
                    if(loadMembered){
                        loadMember(team.team_id);
                        loadMembered = false;
                    }
                }
            }
        }
    });
}
function loadMember(teamID){
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/user/listMember',
        data: {teamID:teamID},
        success: function (data) {
            $("#selectMember").html("");
            if (data.status == 0) {
                for (id in data.teams){
                    var user = data.teams[id];
                    $("#selectMember").append("<option value='"+user.user_id+"'>"+user.username+"</option>");
                }
            }
        }
    });
}
function loadDeviceData(){
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/device/alllist',
        data: {},
        success: function (data) {
        	
        	 $("#assignDeviceButton").hide();
             $("#addNewDeviceButton").hide();
        	if(data.priviledge ==0){
        		$("#assignDeviceButton").show();
                $("#addNewDeviceButton").show();
        	}
        	else if(data.priviledge==1){
        		$("#assignDeviceButton").show();
        	}
        	else{
        		$('#groupname').addClass("hidden");
        		$('#membername').addClass("hidden");
        	}
        	
            if (data.status == 0) {

                $("#devicelist").html('');
                for (id in data.devicelist){

                    var device = data.devicelist[id];
                   
                    if(data.priviledge ==0 ){
                        $("#devicelist").append("<tr id='device_"+device.id+"'><td>"+device.id+"</td><td>"+device.name+"</td><td>"+device.describe+"</td><td><a onclick='showMap("+device.location+",\""+device.city+"\")' >"+
                            device.address+"</a></td><td>"+getBuildingType(device.buildingType1,device.buildingType2)+"</td><td>"+getRoomType(device.roomType)+"</td><td><a class='device_img' onclick='showImage(\""+device.imgUrl+"\");'>查看照片</a></td><td><a class='btn btn-primary ' style='margin-right:10px' onclick='editDevice("+device.id+")'>编辑</a><a class='btn btn-danger'  style='margin-right:10px' onclick='deleteDevice("+device.id+")'>删除</a><a href='/page/environmentdata?device_id="+device.id+"'>查看>></a></td></tr>");
                    }else if(data.priviledge ==1){
                        $("#devicelist").append("<tr id='device_"+device.id+"'><td>"+device.id+"</td><td>"+device.name+"</td><td>"+device.describe+"</td><td><a onclick='showMap("+device.location+",\""+device.city+"\")' >"+
                            device.address+"</a></td><td>"+getBuildingType(device.buildingType1,device.buildingType2)+"</td><td>"+getRoomType(device.roomType)+"</td><td><a class='device_img' onclick='showImage(\""+device.imgUrl+"\");'>查看照片</a></td><td><a class='btn btn-primary' style='margin-right:10px' onclick='editDevice("+device.id+")'>编辑</a><a href='/page/environmentdata?device_id="+device.id+"'>查看>></a></td></tr>");
                    }
                    else{
                    	 $("#devicelist").append("<tr id='device_"+device.id+"'><td>"+device.id+"</td><td>"+device.name+"</td><td>"+device.describe+"</td><td><a onclick='showMap("+device.location+",\""+device.city+"\")' >"+
                                 device.address+"</a></td><td>"+getBuildingType(device.buildingType1,device.buildingType2)+"</td><td>"+getRoomType(device.roomType)+"</td><td><a class='device_img' onclick='showImage(\""+device.imgUrl+"\");'>查看照片</a></td><td><a class='btn btn-primary' style='margin-right:10px' onclick='editDevice("+device.id+")'>编辑</a><a href='/page/environmentdata?device_id="+device.id+"'>查看>></a></td></tr>");
                         
                    }
                   
                    $("#device_"+device.id).data("device_id",device.id);
                    $("#device_"+device.id).data("device_name",device.name);
                    $("#device_"+device.id).data("description",device.describe);
                    $("#device_"+device.id).data("location",device.location);
                    $("#device_"+device.id).data("imgUrl",device.image);
                    $("#device_"+device.id).data("owner_id",device.owner.id);
                    $("#device_"+device.id).data("province",device.province);
                    $("#device_"+device.id).data("city",device.city);
                    $("#device_"+device.id).data("address",device.address);
                    $("#device_"+device.id).data("bt1",device.buildingType1);
                    $("#device_"+device.id).data("bt2",device.buildingType2);
                    $("#device_"+device.id).data("rt",device.roomType);
                    
                }
                //$("#deviceTable").DataTable();
                loadTable();
            }else{  //失败
                console.log("null data");
            }
        }});
}

var buildingTypeMap = new Map();
buildingTypeMap[0]="待补充";
buildingTypeMap[1]="办公";
buildingTypeMap[2]="酒店";
buildingTypeMap[3]="学校";
buildingTypeMap[4]="医院";
buildingTypeMap[5]="商场";
buildingTypeMap[6]="航站楼";
buildingTypeMap[7]="火车站";
buildingTypeMap[8]="展览馆";
buildingTypeMap[9]="室内乐园";
buildingTypeMap[10]="住宅";

function getBuildingType(bt1,bt2){
	return buildingTypeMap[bt2];
}

var roomTypeMap = new Array();
roomTypeMap[0]="待补充";
roomTypeMap[1]="多人办公室";
roomTypeMap[2]="单人办公室";
roomTypeMap[3]="会议室";
roomTypeMap[4]="前台";
roomTypeMap[5]="客房";
roomTypeMap[6]="前台";
roomTypeMap[7]="教室";
roomTypeMap[8]="办公室";
roomTypeMap[9]="病房";
roomTypeMap[10]="诊室";
roomTypeMap[11]="大厅";
roomTypeMap[12]="商店";
roomTypeMap[13]="超市";
roomTypeMap[14]="电影院";
roomTypeMap[15]="值机厅";
roomTypeMap[16]="安检区";
roomTypeMap[17]="候机厅";
roomTypeMap[18]="行李提起区";
roomTypeMap[19]="到站大厅";
roomTypeMap[20]="办公室";
roomTypeMap[21]="换票厅";
roomTypeMap[22]="候车室";
roomTypeMap[23]="展览馆";
roomTypeMap[24]="室内乐园";
roomTypeMap[25]="客厅";
roomTypeMap[26]="卧室";
roomTypeMap[27]="厨房";	
	
function getRoomType(rt){
	return roomTypeMap[rt];
}

function showMap(lat,lon,ci){
	$("#mapModal").modal('show');
	var map = new BMap.Map("mapDiv");    // 创建Map实例
	var point = new BMap.Point(lon, lat);
	map.centerAndZoom(point, 19);  // 初始化地图,设置中心点坐标和地图级别
	map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
	map.setCurrentCity(ci);          // 设置地图显示的城市 此项是必须设置的
	map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
	
	// 添加带有定位的导航控件
	  var navigationControl = new BMap.NavigationControl({
	    // 靠左上角位置
	    anchor: BMAP_ANCHOR_TOP_LEFT,
	    // LARGE类型
	    type: BMAP_NAVIGATION_CONTROL_LARGE,
	    // 启用显示定位
	    enableGeolocation: true
	  });
	  map.addControl(navigationControl);
	  
	  var marker = new BMap.Marker(point);// 创建标注
	  map.addOverlay(marker);             // 将标注添加到地图中
	  marker.disableDragging();           // 不可拖拽
	  
	  //全景视图
	  var stCtrl = new BMap.PanoramaControl();  
	  stCtrl.setOffset(new BMap.Size(20, 20));  
	  map.addControl(stCtrl);
	  
	  var bounds= map.getBounds();
}

function addDevice(){
    var newDeviceName = $("#newDeviceName").val();
    var newMacCode = $("#newMacCode").val();
    var newStatus = $("#newStatus").val();
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/device/add',
        data: {newDeviceName:newDeviceName,
            newMacCode:newMacCode},
        success: function (data) {
            if (data.status == 0) {
                //console.log(data);
                $('#addNewDevice').modal('hide');
                loadDeviceData();
            }else{  //失败
                console.log(data);
            }
        }});

}

function bindBuildingTypeSelect(){
	$('#bTypeContainer').cascadingDropdown({
	    selectBoxes: [
	        {
	            selector: '.step1'
	        },
	        {
	            selector: '.step2',
	            requires: ['.step1'],
	            source: function(request, response) {
	            	var data = getBuildingLevel2(request.buildingTypeLevel1 * 1);
	            	var selectOnlyOption = data.length <= 1;
	            	response($.map(data, function(item, index) {
                        return {
                            label: item[1] ,
                            value: item[0],
                            selected:selectOnlyOption  // Select if only option
                        };
                    }));
	            }
	        },
	        {
	            selector: '.step3',
	            requires: ['.step1', '.step2'],

	            source: function(request, response) {
	            	var data = getRoomTypeList(request.buildingTypeLevel2 * 1);
	            	var selectOnlyOption = data.length <= 1;
	            	response($.map(data, function(item, index) {
                        return {
                            label: item[1] ,
                            value: item[0],
                            selected:selectOnlyOption  // Select if only option
                        };
                    }));
	            }
	        }
	    ],
	    onChange: function(event, dropdownData) {
	    	if(dropdownData.roomType == undefined || dropdownData.buildingTypeLevel1 == undefined || dropdownData.buildingTypeLevel2 == undefined){
	    		return;
	    	}
	    	$("#device_"+currentDeviceId).data("bt1",dropdownData.buildingTypeLevel1 * 1);
            $("#device_"+currentDeviceId).data("bt2",dropdownData.buildingTypeLevel2 * 1);
            $("#device_"+currentDeviceId).data("rt",dropdownData.roomType * 1);
	    }
	});
}

function getBuildingLevel2(bl1){
	var map = new Array();
	map.push([0,"建筑类型"]);
	if(bl1 == 1){
		
		map.push([1,"办公"]);
		map.push([2,"酒店"]);
		map.push([3,"学校"]);
		map.push([4,"医院"]);
		map.push([5,"商场"]);
		map.push([6,"航站楼"]);
		map.push([7,"火车站"]);
		map.push([8,"展览馆"]);
		map.push([9,"室内乐园"]);
	}else if(bl1 == 2){
		map.push([10,"住宅"]);
	}
	return map;
}

function getRoomTypeList(bl2){
	var map = new Array();
	map.push([0,"房间类型"]);
	if(bl2 == 1){
		map.push([1,"多人办公室"]);
		map.push([2,"单人办公室"]);
		map.push([3,"会议室"]);
		map.push([4,"前台"]);
	}else if(bl2 == 2){
		map.push([5,"客房"]);
		map.push([6,"前台"]);
	}else if(bl2 == 3){
		map.push([7,"教室"]);
		map.push([8,"办公室"]);
	}else if(bl2 == 4){
		map.push([9,"病房"]);
		map.push([10,"诊室"]);
		map.push([11,"大厅"]);
	}else if(bl2 == 5){
		map.push([12,"商店"]);
		map.push([13,"超市"]);
		map.push([14,"电影院"]);
	}else if(bl2 == 6){
		map.push([15,"值机厅"]);
		map.push([16,"安检区"]);
		map.push([17,"候机厅"]);
		map.push([18,"行李提起区"]);
		map.push([19,"到站大厅"]);
		map.push([20,"办公室"]);
	}else if(bl2 == 7){
		map.push([21,"换票厅"]);
		map.push([22,"候车室"]);
	}else if(bl2 == 8){
		map.push([23,"展览馆"]);
	}else if(bl2 == 9){
		map.push([24,"室内乐园"]);
	}else if(bl2 == 10){
		map.push([25,"客厅"]);
		map.push([26,"卧室"]);
		map.push([27,"厨房"]);
	}
	
	return map;
}

var currentDeviceId = 0;
var currentBt1 = 0;
var currentBt2 = 0;
var currentRt = 0;
function editDevice(id){
	currentDeviceId = id;
	
    $("#deviceID").val($("#device_"+id).data("id"));
    $("#deviceName").val($("#device_"+id).data("device_name"));
    $("#description").val($("#device_"+id).data("description"));
    
    currentBt1 = $("#device_"+id).data("bt1");
    currentBt2 = $("#device_"+id).data("bt2");
    currentRt = $("#device_"+id).data("rt");
    bindBuildingTypeSelect();
    $("#editDevice").modal('show');
}
function editDeviceForm(){
    var deviceID =  $("#deviceID").val();
    var deviceName = $("#deviceName").val();
    var description = $("#description").val();
    
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/device/editinfo',
        data: {deviceID:deviceID,
            deviceName:deviceName,
            location:$("#device_"+deviceID).data("location"),
            imgUrl:$("#device_"+deviceID).data("imgUrl"),
            description:description,
            province:$("#device_"+deviceID).data("province"),
            city:$("#device_"+deviceID).data("city"),
            address:$("#device_"+deviceID).data("address"),
            btl1:$("#device_"+deviceID).data("bt1"),
            btl2:$("#device_"+deviceID).data("bt2"),
            rt:$("#device_"+deviceID).data("rt")
        },
        success: function (data) {
            if (data.status == 0) {
                //console.log(data);
                $('#editDevice').modal('hide');
                window.location.href = "/page/deviceManage";
            }else{  //失败
                console.log("更新失败");
            }
        }});
}

function deleteDevice(id){
    var r = confirm("确认删除设备："+id+"吗?");
    if (r == true) {
        $.ajax({
            type: "post",
            dataType: "json",
            url: '/device/delete',
            data: {deviceID:id},
            success: function (data) {
                if (data.status == 0) {
                    console.log(data);
                    window.location.href = "/page/deviceManage";
                }else{  //失败
                    console.log(data);
                }
            }});
    }

}

// device load

//
// Updates "Select all" control in a data table
//
function updateDataTableSelectAllCtrl(table){
    var $table             = table.table().node();
    var $chkbox_all        = $('tbody input[type="checkbox"]', $table);
    var $chkbox_checked    = $('tbody input[type="checkbox"]:checked', $table);
    var chkbox_select_all  = $('thead input[name="select_all"]', $table).get(0);

    // If none of the checkboxes are checked
    if($chkbox_checked.length === 0){
        chkbox_select_all.checked = false;
        if('indeterminate' in chkbox_select_all){
            chkbox_select_all.indeterminate = false;
        }

        // If all of the checkboxes are checked
    } else if ($chkbox_checked.length === $chkbox_all.length){
        chkbox_select_all.checked = true;
        if('indeterminate' in chkbox_select_all){
            chkbox_select_all.indeterminate = false;
        }

        // If some of the checkboxes are checked
    } else {
        chkbox_select_all.checked = true;
        if('indeterminate' in chkbox_select_all){
            chkbox_select_all.indeterminate = true;
        }
    }
}
var rows_selected = [];

var loadTable = function (){
    // Array holding selected row IDs
    
    var table = $('#deviceTable').DataTable({
        'columnDefs': [{
            'targets': 0,
            'searchable':false,
            'orderable':false,
            'className': 'dt-body-center',
            'render': function (data, type, full, meta){
                return '<input type="checkbox">';
            }
        }],
        'order': [1, 'asc'],
        'rowCallback': function(row, data, dataIndex){
            // Get row ID
            var rowId = data[0];

            // If row ID is in the list of selected row IDs
            if($.inArray(rowId, rows_selected) !== -1){
                $(row).find('input[type="checkbox"]').prop('checked', true);
                $(row).addClass('selected');
            }
        }
    });

    // Handle click on checkbox
    $('#deviceTable tbody').on('click', 'input[type="checkbox"]', function(e){
        var $row = $(this).closest('tr');

        // Get row data
        var data = table.row($row).data();

        // Get row ID
        var rowId = data[0];

        // Determine whether row ID is in the list of selected row IDs
        var index = $.inArray(rowId, rows_selected);

        // If checkbox is checked and row ID is not in list of selected row IDs
        if(this.checked && index === -1){
            rows_selected.push(rowId);

            // Otherwise, if checkbox is not checked and row ID is in list of selected row IDs
        } else if (!this.checked && index !== -1){
            rows_selected.splice(index, 1);
        }

        if(this.checked){
            $row.addClass('selected');
        } else {
            $row.removeClass('selected');
        }

        // Update state of "Select all" control
        updateDataTableSelectAllCtrl(table);

        // Prevent click event from propagating to parent
        e.stopPropagation();
    });

    // Handle click on table cells with checkboxes
    $('#deviceTable').on('click', 'tbody td, thead th:first-child', function(e){
        $(this).parent().find('input[type="checkbox"]').trigger('click');
    });

    // Handle click on "Select all" control
    $('thead input[name="select_all"]', table.table().container()).on('click', function(e){
        if(this.checked){
            $('tbody input[type="checkbox"]:not(:checked)', table.table().container()).trigger('click');
        } else {
            $('tbody input[type="checkbox"]:checked', table.table().container()).trigger('click');
        }

        // Prevent click event from propagating to parent
        e.stopPropagation();
    });

    // Handle table draw event
    table.on('draw', function(){
        // Update state of "Select all" control
        updateDataTableSelectAllCtrl(table);
    });

    // Handle form submission event
    $('#frm-example').on('submit', function(e){
        var form = this;

        // Iterate over all selected checkboxes
        $.each(rows_selected, function(index, rowId){
            // Create a hidden element
            $(form).append(
                $('<input>')
                    .attr('type', 'hidden')
                    .attr('name', 'selectedID')
                    .val(rowId)
            );
        });

        // FOR DEMONSTRATION ONLY

        // Output form data to a console
        //$('#example-console').text($(form).serialize());
        //console.log("Form submission", $(form).serialize());
        //todo

        console.log("get assign",'/device/assign?'+$(form).serialize());

        $.ajax({
            type: "get",
            dataType: "json",
            url: '/device/assign?'+$(form).serialize(),
            success: function (data) {
                //console.log("assign result",data);
                window.location.href = "/page/deviceManage";
            }
        });

        
        // Remove added elements
        $('input[name="selectedID"]', form).remove();

        // Prevent actual form submission
        e.preventDefault();
        
        alert("分配成功！");
    });
}


// end device load


function bindCompareDeviceData(){
	$("#compareDeviceDataButton").click(function(){
		//获取选中的设备id列表
		/*
		var fs = $('#frm-example').serialize();
		var formArr = fs.split("&");
		var i;
		var chkIds = [];
		
		for(i = 0; i < formArr.length; i++){
			if(formArr[i].indexOf("selectedID")>=0){
				var id = formArr[i].substr(11,formArr[i].length);
				chkIds.push(id);
			}
		}*/
		
		if(rows_selected.length != 0){
			var idList = rows_selected.join("-");
			window.location.href = "/page/compareDeviceData/"+idList;
		}
	});
}

function bindDeviceImageLink(){
	$(".device_img").unbind("click");
	$(".device_img").click(function(){
		$("#deviceImg").attr("src",$(this).attr("target"));
		$('#imgModal').modal('show');
	});
}

function showImage(url){
	$("#deviceImg").attr("src",url);
	$('#imgModal').modal('show');
}

$(function(){
    loadDeviceData();
    loadGroup();
    bindCompareDeviceData();
    
});

$("#selectGroup").change(function() {
    console.log("select group:",$("#selectGroup").val());
    loadMember($("#selectGroup").val());
});




