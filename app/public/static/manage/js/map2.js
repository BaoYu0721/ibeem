function setMap(obj,pointData){
	
    Highcharts.setOptions({
        lang:{
            drillUpText:"返回 > {series.name}"
        }
    });
    var data = Highcharts.geojson(Highcharts.maps['countries/cn/custom/cn-all-china']),small = $('#container').width() < 400;
    // 给城市设置随机数据
    $.each(data, function (i) {
        this.drilldown = this.properties['drill-key'];
        this.value = i;
    });
    //初始化地图
    
   $(obj).highcharts('Map', {
        chart : {
            events: {
                drilldown: function (e) {
                    if (!e.seriesOptions) {
                        var chart = this;                             
                        var cname=e.point.properties["cn-name"];
                        chart.showLoading('<i class="icon-spinner icon-spin icon-3x"></i>');
                        // 加载城市数据
                        $.ajax({
                            type: "GET",
                            url: "http://data.hcharts.cn/jsonp.php?filename=GeoMap/json/"+ e.point.drilldown+".geo.json",
                            contentType: "application/json; charset=utf-8",
                            dataType:'jsonp',
                            crossDomain: true,
                            success: function(json) {
                                data = Highcharts.geojson(json);
                                $.each(data, function (i) {
                                    this.value = i;
                                });
                                chart.hideLoading();

                                chart.addSeriesAsDrilldown(e.point, {
                                    // Use the gb-all map with no data as a basemap
                                    mapData: Highcharts.maps['countries/cn/custom/cn-all-china'],
                                    name: 'Basemap',
                                    borderColor: '#A0A0A0',
                                    nullColor: '#47b391',
                                    showInLegend: false
                                }, {
                                    name: 'Separators',
                                    type: 'mapline',
                                    data: Highcharts.geojson(Highcharts.maps['countries/cn/custom/cn-all-china'], 'mapline'),
                                    color: '#47b391',
                                    showInLegend: false,
                                    enableMouseTracking: false
                                },
                                {
                                    type: 'mappoint',
                                    name: '设备位置',
                                    color: '#47b391',
                                    data: pointData
                                }
                                );
                                
                                console.log(pointData);
                                /*$(".highcharts-legend-item").css("display","none");
    	         				$(".highcharts-credits").remove();
    	         				$(".highcharts-contextbutton").remove();
    	         				$(".highcharts-title").remove();*/
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                            	
                            }
                        });
                    }


                    this.setTitle(null, { text: cname });
                },
                drillup: function () {
                    this.setTitle(null, { text: '' });
                }
            }
        },
        credits:{
        	enabled:false,
        	text:"",
        	mapText:""
        },
        title : {
            text : ''
        },
        exporting:{
        	enabled:false,
        },
        legend: {
            enabled: true,
            align: 'left',
            floating: true
        },
        subtitle: {
            text: '',
            floating: true,
            align: 'right',
            y: 50,
            style: {
                fontSize: '12px'
            }
        },
       
        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom'
            }
        },
        plotOptions: {
            map: {
                states: {
                    hover: {
                        color: '#EEDD66'
                    }
                }
            },
            series:{
            	showInLegend:false
            }
        },
        series : [{
            // Use the gb-all map with no data as a basemap
            mapData: Highcharts.maps['countries/cn/custom/cn-all-china'],
            name: 'Basemap',
            borderColor: '#A0A0A0',
            nullColor: 'rgba(200, 200, 200, 0.3)',
            showInLegend: false
        }, {
            name: 'Separators',
            type: 'mapline',
            data: Highcharts.geojson(Highcharts.maps['countries/cn/custom/cn-all-china'], 'mapline'),
            color: '#707070',
            
            showInLegend: false,
            enableMouseTracking: false
        }, /*{
        	name: '全国地图',
            mapData: data,
            //mapData : mapData,
            showInLegend: false,
            borderColor: '#A0A0A0',
            nullColor: 'rgba(200, 200, 200, 0.3)',
            dataLabels: {
                enabled: true,
                color: 'grey',
                format: '{point.properties.cn-name}'
            }
        },*/
        {
            // Specify points using lat/lon
            type: 'mappoint',
            name: '',
            color: "#47b391",
            tooltip: {
                enabled: true,
                headerFormat: '',
                //pointFormat: '<b>{point.name}</b><br>纬度: {point.lat}, 经度: {point.lon}'
                pointFormat: '<br>纬度: {point.lat}, 经度: {point.lon}'
            },
            data:pointData
        } 
        ],
        drilldown: {
            activeDataLabelStyle: {
                color: '#FFFFFF',                
                textDecoration: 'none',                
                textShadow: '0 0 3px #000000'            
            },            
            drillUpButton: {                
            	relativeTo: 'spacingBox',                
            	position: {                    
            		x: 0,                    
            		y: 60                
            	}         
            }        
        }    
     });
   
//   设备信息页地图
   /*$('#container2').highcharts('Map', {
       chart : {
           events: {
               drilldown: function (e) {
                   if (!e.seriesOptions) {
                       var chart = this;                             
                       var cname=e.point.properties["cn-name"];
                       chart.showLoading('<i class="icon-spinner icon-spin icon-3x"></i>');
                       // 加载城市数据
                       $.ajax({
                           type: "GET",
                           url: "http://data.hcharts.cn/jsonp.php?filename=GeoMap/json/"+ e.point.drilldown+".geo.json",
                           contentType: "application/json; charset=utf-8",
                           dataType:'jsonp',
                           crossDomain: true,
                           success: function(json) {
                           	alert(111);
                               data = Highcharts.geojson(json);
                               $.each(data, function (i) {
                                   this.value = i;
                               });
                               chart.hideLoading();

                               chart.addSeriesAsDrilldown(e.point, {
                                   // Use the gb-all map with no data as a basemap
                                   mapData: Highcharts.maps['countries/cn/custom/cn-all-china'],
                                   name: 'Basemap',
                                   borderColor: '#A0A0A0',
                                   nullColor: '#47b391',
                                   showInLegend: false
                               }, {
                                   name: 'Separators',
                                   type: 'mapline',
                                   data: Highcharts.geojson(Highcharts.maps['countries/cn/custom/cn-all-china'], 'mapline'),
                                   color: '#47b391',
                                   showInLegend: false,
                                   enableMouseTracking: false
                               },
                               {
                                   type: 'mappoint',
                                   name: '设备位置',
                                   color: '#47b391',
                                   data: pointData
                               }
                               );
                               
                               console.log(pointData);
                               $(".highcharts-legend-item").css("display","none");
   	         				$(".highcharts-credits").remove();
   	         				$(".highcharts-contextbutton").remove();
   	         				$(".highcharts-title").remove();
                           },
                           error: function (XMLHttpRequest, textStatus, errorThrown) {

                           }
                       });
                   }


                   this.setTitle(null, { text: cname });
               },
               drillup: function () {
                   this.setTitle(null, { text: '' });
               }
           }
       },
       title : {
           text : '设备分布'
       },
    
       legend: {
           enabled: true,
           align: 'left',
           floating: true
       },
       subtitle: {
           text: '',
           floating: true,
           align: 'right',
           y: 50,
           style: {
               fontSize: '12px'
           }
       },
      
       mapNavigation: {
           enabled: true,
           buttonOptions: {
               verticalAlign: 'bottom'
           }
       },
       plotOptions: {
           map: {
               states: {
                   hover: {
                       color: '#EEDD66'
                   }
               }
           }
       },
     //the color when mouse move on
    

       series : [{
           // Use the gb-all map with no data as a basemap
           mapData: Highcharts.maps['countries/cn/custom/cn-all-china'],
           name: 'Basemap',
           borderColor: '#A0A0A0',
           nullColor: 'rgba(200, 200, 200, 0.3)',
           showInLegend: false
       }, {
           name: 'Separators',
           type: 'mapline',
           data: Highcharts.geojson(Highcharts.maps['countries/cn/custom/cn-all-china'], 'mapline'),
           color: '#707070',
           
           showInLegend: false,
           enableMouseTracking: false
       }, {
       	name: '全国地图',
           mapData: data,
           //mapData : mapData,
           showInLegend: false,
           borderColor: '#A0A0A0',
           nullColor: 'rgba(200, 200, 200, 0.3)',
           dataLabels: {
               enabled: true,
               color: 'grey',
               format: '{point.properties.cn-name}'
           }
       },
       {
           // Specify points using lat/lon
           type: 'mappoint',
           name: '设备分布',
           color: "#F0F",
           tooltip: {
               enabled: true,
               headerFormat: '',
               pointFormat: '<b>{point.name}</b><br>纬度: {point.lat}, 经度: {point.lon}'
           },
           data:pointData
       } 
       ],
       drilldown: {
           activeDataLabelStyle: {
               color: '#FFFFFF',                
               textDecoration: 'none',                
               textShadow: '0 0 3px #000000'            
           },            
           drillUpButton: {                
           	relativeTo: 'spacingBox',                
           	position: {                    
           		x: 0,                    
           		y: 60                
           	}         
           }        
       }    
    });*/
}