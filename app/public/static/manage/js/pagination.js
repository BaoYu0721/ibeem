var app = angular.module("app", []);
//设备列表
app.controller("appController", function ($scope, $window) {
	/*设备总数*/
	$scope.deviceListArr=[];
	/*拆分成几个小数组后的二维数组*/
	$scope.result=[];
    //总页数
    $scope.pageCount = 0;
    /*要渲染哪一组数据*/
    $scope.device_list_arr=[];
    $scope.getDeiveList=function(){
    	$scope.newArr=[];
	 	$.ajax({
	 		type:"post",
	 		dataType:"json",
	 		url:"/device/finfDeviceListByUserID",
	 		data:{},
	 		success:function(data){
	 			if(data.code==200){
	 				var deviceList=data.list;
	 				$scope.deviceListArr=data.list;
	 				console.log(data);
	 				var deviceListLength=deviceList.length;
	 				$scope.pageCount=Math.floor(deviceListLength/13);
	 				$scope.$apply();
	 				console.log($scope.pageCount);
	 				/*父子控制器数据交互,向子控制器发送数据*/
	 				 $scope.$broadcast('transfer.pageCount', $scope.pageCount); 
	 				 $scope.$broadcast('transfer.deviceListArr', $scope.deviceListArr); 
	 				var str="";
	 				if(deviceListLength<11){
	 					$scope.device_list_arr=deviceList;
	 					$scope.$apply();
	 				}else{
	 					for(var i=0;i<11;i++){
	 						$scope.newArr.push(deviceList[i]);
	 						$scope.device_list_arr=$scope.newArr;
	 						$scope.$apply();
	 					}
	 				}
	 				console.log($scope.device_list_arr);
	 			}else{
	 				alert(data.code);
	 			}
	 		},
	 		error:function(){}
	 		
	 	});
    };
   
   
});

//分页
app.controller("PaginationController", function ($scope) {
    //当前页索引
    $scope.currentPage = 0;
    //总页数
    $scope.pageCount=0;
    //每页显示条数
    $scope.items_per_page = 10;
    ///连续分页主体部分分页条目数
    $scope.num_display_entries = 6;
    //两侧首尾分页条目数
    $scope.num_edge_entries = 2;
    
    $scope.items = [];
    
    //总设备列表
    $scope.deviceListArr=[];
    
    //接收父控制器发送的数据
    $scope.$on('transfer.deviceListArr', function(event, data) {  
        $scope.deviceListArr = data;  
        console.log($scope.pageCount);
     }); 
    
    $scope.init = function () {
        $scope.currentPage = 0;
        /*子控制器接收数据*/
        $scope.$on('transfer.pageCount', function(e, data) {  
            $scope.pageCount = data;  
            console.log($scope.pageCount);
         }); 
        $scope.items = $scope.getRange($scope.currentPage, $scope.pageCount);
    }
    
    //拆分设备数组为几个小数组
    $scope.sliceArr=function(arr,size){
        var result = [];
        for (var x = 0; x < Math.ceil(arr.length/size); x++) {
            var start = x * size;
            var end = start + size;
            $scope.result.push(array.slice(start, end));
            console.log( $scope.result);
        }
    };
    
    $scope.sliceArr($scope.deviceListArr,"11");
    
    /*获取某页数据*/
    $scope.getByPage=function(page){
    	$scope.device_list_arr=$scope.result[page];
    };
    
    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pageCount - 1) {
            $scope.currentPage++;
        }
    };

    $scope.setPage = function (n) {
        if (n >= 0) {
            $scope.currentPage = n;
        }
        $scope.getByPage(n);
        
    };

    $scope.$watch('pageCount', function () {
        if ($scope.currentPage == 0) {
            $scope.items = $scope.getRange($scope.currentPage, $scope.pageCount);
        }
        else {
            $scope.currentPage = 0;
        }
    });

    $scope.$watch('currentPage', function () {
        $scope.items = $scope.getRange($scope.currentPage, $scope.pageCount);
       
    });

    $scope.getRange = function (currentPage, pageCount) {
        var ret = [];
        var np = pageCount;
        var interval = $scope.getInterval(currentPage, pageCount);

        // Generate starting points
        if (interval[0] > 0 && $scope.num_edge_entries > 0) {
            var end = Math.min($scope.num_edge_entries, interval[0]);
            for (var i = 0; i < end; i++) {
                ret.push(i);
            }
            if ($scope.num_edge_entries < interval[0]) {
                ret.push(-1);
            }
        }
        // Generate interval links
        for (var i = interval[0]; i < interval[1]; i++) {
            ret.push(i);
        }
        // Generate ending points
        if (interval[1] < np && $scope.num_edge_entries > 0) {
            if (np - $scope.num_edge_entries > interval[1]) {
                ret.push(-1);
            }
            var begin = Math.max(np - $scope.num_edge_entries, interval[1]);
            for (var i = begin; i < np; i++) {
                ret.push(i);
            }
        }
        return ret;
    };

    /**
    * Calculate start and end point of pagination links depending on
    * currentPage and num_display_entries.
    * @return {Array}
    */
    $scope.getInterval = function (currentPage, pageCount) {
        var ne_half = Math.ceil($scope.num_display_entries / 2);
        var np = pageCount;
        var upper_limit = np - $scope.num_display_entries;
        var start = currentPage > ne_half ? Math.max(Math.min(currentPage - ne_half, upper_limit), 0) : 0;
        var end = currentPage > ne_half ? Math.min(currentPage + ne_half, np) : Math.min($scope.num_display_entries, np);
        return [start, end];
    }
});