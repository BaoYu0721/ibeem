//require.config({
//	paths:{
//		"jquery":"/static/common/js/jquery.min",
//		"highcharts":"/static/common/js/highcharts"
//	}
//});
//define(['jquery','highcharts'],function(jquery,highcharts){
	console.log("init chart!");
	function newZzt(id,title,data){
	    $("#"+id).highcharts({
	        chart: {
	        	backgroundColor: '#234566',
	            type: 'column'
	        },
	        title: {
	            text: title
	        },
	        credits:{
	        	enabled:false
	        },
	        navigations :{
	        	buttonOptions:{
	        		enabled:false
	        	}
	        },
	        xAxis: {
	        	type: 'category'
	        },
	        yAxis: {
	            min: 0,
	            title: {
	                text: ''
	            }
	        },
	        tooltip: {
	            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
	            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
	            '<td style="padding:0"><b>{point.y}</b></td></tr>',
	            footerFormat: '</table>',
	            shared: true,
	            useHTML: true
	        },
	        plotOptions: {
	            column: {
	                pointPadding: 0.2,
	                borderWidth: 0
	            },
	            series: {
	                colorByPoint: true
	            }
	        },
	        series: data 
	    });
	    
	}

	function newBzt(id,title,data){
		    $("#"+id).highcharts({
		        chart: {
		            plotBackgroundColor: null,
		            plotBorderWidth: null,
		            plotShadow: false
		        },
		        title: {
		            text: '2014 某网站各浏览器浏览量占比'
		        },
		        tooltip: {
		            headerFormat: '{series.name}<br>',
		            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
		        },
		        plotOptions: {
		            pie: {
		                allowPointSelect: true,
		                cursor: 'pointer',
		                dataLabels: {
		                    enabled: true,
		                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
		                    style: {
		                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
		                    }
		                }
		            }
		        },
		        series: [{
		            type: 'pie',
		            name: '浏览器访问量占比',
		            data: [
		                ['Firefox',   45.0],
		                ['IE',       26.8],
		                {
		                    name: 'Chrome',
		                    y: 12.8,
		                    sliced: true,
		                    selected: true
		                },
		                ['Safari',    8.5],
		                ['Opera',     6.2],
		                ['其他',   0.7]
		            ]
		        }]
		    });

//	}  
//	function initChart1(json,divID,title){
//		var xaxis1 = [];
//		var data = [];
//		var n=0;
//		for(var y in json){
//			var x_obj = json[y];
//			var x_axis = [];
//			var y_axis = [];
//			for(var x in x_obj){
//				x_axis.push(x);
//				y_axis.push(x_obj[x]);
//			}
//			var trace = {
//					x:x_axis,
//					y:y_axis,
//					name:y,
//					type:'bar',
//					marker: {
//					    color: colorArr[n],
//					    opacity: 0.6}
//			};
//			data.push(trace);
//			n++;
//		}
//		if(!title)title="";
//		var layout = {barmode: 'group',title: title,};
//		Plotly.newPlot(divID, data, layout);
//	}
}