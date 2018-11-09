/**
 * 
 */


function loadSurveyStastics(){
	$.ajax({
        type: "post",
        dataType: "json",
        url: '/survey/stastics',
        data: {surveyID:currentSurveyID},
        success: function (data) {
            if (data.status == 0) {
            	showStastics(data.statics,data.survey);
            }
        }
      });
	
}

function showStastics(list,survey){
	var i;
	
	$("#title").html(survey.title + '&nbsp;&nbsp;<span class="label label-default">'+survey.answerCount+'</span> ');
	
	for(i = 0; i < list.length; i++){
		var q = list[i];
		var html = buildQuestionHtml(q.id, q.order,q.title);
		$("#stasticsContent").append(html);
		//根据不同题型进行图表显示
		if(q.type == 2 || q.type ==3 || q.type ==4){ //柱状图显示
			var cats = new Array();
			var numbers = new Array();
			
			for(var key in q.sta){
				cats.push(key);
				numbers.push(q.sta[key]);
			}
			
			generateColumnChart("q_"+q.id,cats,numbers);
		}else if(q.type == 1){ //填空题列表显示
			generateTextChart("q_"+q.id,q.sta);
		}else if(q.type == 5){ //滑条题
			//按照区间进行统计，然后显示结果值
			generateSliderResultChart("q_"+q.id,q.sta,JSON.parse(q.setting));
		}
		
	}
}

function generateTextChart(element,data){
	var html = "";
	for(var i = 0; i < data.length; i++){
		html += "<kbd>" + data[i] + "</kbd>&nbsp;&nbsp;";
	}
	$("#"+element).append(html);
}

function generateSliderResultChart(element,data, setting){
	var min = setting.min;
	var max = setting.max;
	var nstep = 100;   //nstep由用户进行设定
	var step = (max - min)/nstep;
	
	var cats = new Array();
	var numbers = new Array();
	
	for(var i = 0; i < nstep; i++){
		cats.push(min + step * i);
		numbers.push(0);
	}
	cats.push(max);
	numbers.push(0);
	
	var j;
	for(var i = 0; i < data.length; i++){
		var num = data[i] * 1;
		j = Math.round((num - min)/step);
		numbers[j] = numbers[j]+1;
	}
	
	generateColumnChart(element, cats,numbers);
}

function generateColumnChart(element, cats,numbers){
	
	$('#'+element).highcharts({
        chart: {
            type: 'column',
            width:400,
            height:240
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: cats,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: '数量',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: ''
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: '数量',
            data: numbers
        	}]
    });
}

function buildQuestionHtml(id, order, title){
	var html = '<div class="panel panel-default">'+
	  '<div class="panel-heading">'+order +'.'+ title+'</div>'+
	  '<div class="panel-body">'+
	  '<div id="q_'+id+'" style="width:80%;"></div>'+
	  '</div>'+
	  '</div>';
	return html;
}


var currentSurveyID = 0;
$(function(){
	var url = window.location.href;
	var params = url.split('/');
	currentSurveyID = params[5] * 1;
	
	loadSurveyStastics();

});