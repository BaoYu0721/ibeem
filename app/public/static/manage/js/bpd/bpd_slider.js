$(function(){
	
	var $sliderHtml_common = '<div class="price-range-slider">'+
								'<div class="bg-darkgrey"></div>'+
								'<div class="bg-darkgrey-hand"></div>'+
								'<ul class="slider-ul">'+
										'<li class="slider-ul-first"><i class="icon-dian"></i></li>'+
										'<li><i class="icon-dian"></i></li>'+
										'<li><i class="icon-dian"></i></li>'+
										'<li><i class="icon-dian"></i></li>'+
										'<li><i class="icon-dian"></i></li>'+
										'<li><i class="icon-dian"></i></li>'+
										'<li><i class="icon-dian"></i></li>'+
										'<li><i class="icon-dian"></i></li>'+
										'<li><i class="icon-dian"></i></li>'+
										'<li><i class="icon-dian"></i></li>'+
								'</ul>'+
						'</div>'+
						'<div class="slide-selected"></div>'+
						'<i class="btn-price btn-left"></i>'+
						'<i class="btn-price btn-right"></i>'+
						'<div class="tip">'+
								'<div class="tip-content"></div>'+
								'<span class="tip-top tip-arrow"></span>'+ 
						'</div>';

	/**** 数值为0-100 ****/
	var $sliderHtml_1 = $sliderHtml_common +
						'<div class="price-range-text">'+ 
								'<span class="number number-first">0</span>'+
								'<span class="number">10</span>'+
								'<span class="number">20</span>'+
								'<span class="number">30</span>'+
								'<span class="number">40</span>'+
								'<span class="number">50</span>'+
								'<span class="number">60</span>'+
								'<span class="number">70</span>'+
								'<span class="number">80</span>'+
								'<span class="number">90</span>'+
								'<span class="number">100</span> '+
						'</div>';


	var $sliderArr_1 = [];
	for(var i=0;i<10;i++){ // [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		$sliderArr_1.push(1);
	}

	var $sliderData_1 = [
							{key: 0,  value: $sliderArr_1},
							{key: 10, value: $sliderArr_1},
							{key: 20, value: $sliderArr_1},
							{key: 30, value: $sliderArr_1},
							{key: 40, value: $sliderArr_1},
							{key: 50, value: $sliderArr_1},
							{key: 60, value: $sliderArr_1},
							{key: 70, value: $sliderArr_1},
							{key: 80, value: $sliderArr_1},
							{key: 90, value: $sliderArr_1},
							{key: 100,value: 0.5},
							{key: 101}
						]

	/**** 数值为0-1000 ****/
	var $sliderHtml_2 = $sliderHtml_common +
						'<div class="price-range-text">'+ 
								'<span class="number number-first">0</span>'+
								'<span class="number">100</span>'+
								'<span class="number">200</span>'+
								'<span class="number">300</span>'+
								'<span class="number">400</span>'+
								'<span class="number">500</span>'+
								'<span class="number">600</span>'+
								'<span class="number">700</span>'+
								'<span class="number">800</span>'+
								'<span class="number">900</span>'+
								'<span class="number">1000</span> '+
						'</div>';

	var $sliderArr_2 = [];
	for(var i=0;i<10;i++){ // [10, 10,... ]  10个
		$sliderArr_2.push(10);
	}

	var $sliderData_2 = [
							{key: 0,   value: $sliderArr_2},
							{key: 100, value: $sliderArr_2},
							{key: 200, value: $sliderArr_2},
							{key: 300, value: $sliderArr_2},
							{key: 400, value: $sliderArr_2},
							{key: 500, value: $sliderArr_2},
							{key: 600, value: $sliderArr_2},
							{key: 700, value: $sliderArr_2},
							{key: 800, value: $sliderArr_2},
							{key: 900, value: $sliderArr_2},
							{key: 1000,value: 0.5},
							{key: 1001}
						]

	/**** 数值为0-1 ****/
	var $sliderHtml_3 = $sliderHtml_common +
						'<div class="price-range-text">'+ 
								'<span class="number number-first">0</span>'+
								'<span class="number">0.1</span>'+
								'<span class="number">0.2</span>'+
								'<span class="number">0.3</span>'+
								'<span class="number">0.4</span>'+
								'<span class="number">0.5</span>'+
								'<span class="number">0.6</span>'+
								'<span class="number">0.7</span>'+
								'<span class="number">0.8</span>'+
								'<span class="number">0.9</span>'+
								'<span class="number">1</span> '+
						'</div>';

	var $sliderArr_3 = [0.1];
	var $sliderData_3 = [
							{key: 0,   value: $sliderArr_3},
							{key: 0.1, value: $sliderArr_3},
							{key: 0.2, value: $sliderArr_3},
							{key: 0.3, value: $sliderArr_3},
							{key: 0.4, value: $sliderArr_3},
							{key: 0.5, value: $sliderArr_3},
							{key: 0.6, value: $sliderArr_3},
							{key: 0.7, value: $sliderArr_3},
							{key: 0.8, value: $sliderArr_3},
							{key: 0.9, value: $sliderArr_3},
							{key: 1,   value: 0.5},
							{key: 1.1}
						]

	/**** 数值为0-40 ****/
	var $sliderHtml_4 = $sliderHtml_common +
						'<div class="price-range-text">'+ 
								'<span class="number number-first">0</span>'+
								'<span class="number">4</span>'+
								'<span class="number">8</span>'+
								'<span class="number">12</span>'+
								'<span class="number">16</span>'+
								'<span class="number">20</span>'+
								'<span class="number">24</span>'+
								'<span class="number">28</span>'+
								'<span class="number">32</span>'+
								'<span class="number">36</span>'+
								'<span class="number">40</span> '+
						'</div>';


	var $sliderArr_4 = [];
	for(var i=0;i<4;i++){ // [1, 1, 1, 1]
		$sliderArr_4.push(1);
	}

	var $sliderData_4 = [
							{key: 0,  value: $sliderArr_4},
							{key: 4, value: $sliderArr_4},
							{key: 8, value: $sliderArr_4},
							{key: 12, value: $sliderArr_4},
							{key: 16, value: $sliderArr_4},
							{key: 20, value: $sliderArr_4},
							{key: 24, value: $sliderArr_4},
							{key: 28, value: $sliderArr_4},
							{key: 32, value: $sliderArr_4},
							{key: 36, value: $sliderArr_4},
							{key: 40,value: 0.5},
							{key: 41}
						]

	/**** 数值为-30-100 ****/
	var $sliderHtml_5 = $sliderHtml_common +
						'<div class="price-range-text">'+ 
								'<span class="number number-first">-30</span>'+
								'<span class="number">-15</span>'+
								'<span class="number">0</span>'+
								'<span class="number">15</span>'+
								'<span class="number">30</span>'+
								'<span class="number">45</span>'+
								'<span class="number">60</span>'+
								'<span class="number">70</span>'+
								'<span class="number">80</span>'+
								'<span class="number">90</span>'+
								'<span class="number">100</span> '+
						'</div>';


	var $sliderArr_5 = [];
	var $sliderArr_5_lower = [];

	for(var i=0;i<5;i++){ // [3, 3, 3, 3,3]
		$sliderArr_5.push(3);
		$sliderArr_5_lower.push(2);
	}

	var $sliderData_5 = [
							{key: -30,  value: $sliderArr_5},
							{key: -15, value: $sliderArr_5},
							{key: 0, value: $sliderArr_5},
							{key: 15, value: $sliderArr_5},
							{key: 30, value: $sliderArr_5},
							{key: 45, value: $sliderArr_5},
							{key: 60, value: $sliderArr_5_lower},
							{key: 70, value: $sliderArr_5_lower},
							{key: 80, value: $sliderArr_5_lower},
							{key: 90, value: $sliderArr_5_lower},
							{key: 100,value: 0.5},
							{key: 101}
						]

	/**** 数值为0-100000 ****/
	var $sliderHtml_6 = $sliderHtml_common +
						'<div class="price-range-text">'+ 
								'<span class="number number-first">0</span>'+
								'<span class="number">1万</span>'+
								'<span class="number">2万</span>'+
								'<span class="number">3万</span>'+
								'<span class="number">4万</span>'+
								'<span class="number">5万</span>'+
								'<span class="number">6万</span>'+
								'<span class="number">7万</span>'+
								'<span class="number">8万</span>'+
								'<span class="number">9万</span>'+
								'<span class="number">10万</span> '+
						'</div>';


	var $sliderArr_6 = [];
	for(var i=0;i<10;i++){ // [1000, 1000, ...]
		$sliderArr_6.push(1000);
	}

	var $sliderData_6 = [
							{key: 0,  value: $sliderArr_6},
							{key: 10000, value: $sliderArr_6},
							{key: 20000, value: $sliderArr_6},
							{key: 30000, value: $sliderArr_6},
							{key: 40000, value: $sliderArr_6},
							{key: 50000, value: $sliderArr_6},
							{key: 60000, value: $sliderArr_6},
							{key: 70000, value: $sliderArr_6},
							{key: 80000, value: $sliderArr_6},
							{key: 90000, value: $sliderArr_6},
							{key: 100000,value: 0.5},
							{key: 100001}
						]

	/**** 数值为0-1000000 ****/
	var $sliderHtml_7 = $sliderHtml_common +
						'<div class="price-range-text">'+ 
								'<span class="number number-first">0</span>'+
								'<span class="number">10万</span>'+
								'<span class="number">20万</span>'+
								'<span class="number">30万</span>'+
								'<span class="number">40万</span>'+
								'<span class="number">50万</span>'+
								'<span class="number">60万</span>'+
								'<span class="number">70万</span>'+
								'<span class="number">80万</span>'+
								'<span class="number">90万</span>'+
								'<span class="number">100万</span> '+
						'</div>';


	var $sliderArr_7 = [];
	for(var i=0;i<10;i++){ // [1000, 1000, ...]
		$sliderArr_7.push(10000);
	}

	var $sliderData_7 = [
							{key: 0,  value: $sliderArr_7},
							{key: 100000, value: $sliderArr_7},
							{key: 200000, value: $sliderArr_7},
							{key: 300000, value: $sliderArr_7},
							{key: 400000, value: $sliderArr_7},
							{key: 500000, value: $sliderArr_7},
							{key: 600000, value: $sliderArr_7},
							{key: 700000, value: $sliderArr_7},
							{key: 800000, value: $sliderArr_7},
							{key: 900000, value: $sliderArr_7},
							{key: 1000000,value: 0.5},
							{key: 1000001}
						]

	/**** 时间为1980-now ****/
	var $time_now = Number(new Date().getFullYear());
	var $time_rest = $time_now - 2012;
	var $time_max = $time_now + 1;

	var $sliderHtml_8 = $sliderHtml_common +
						'<div class="price-range-text">'+ 
								'<span class="number number-first">1980</span>'+
								'<span class="number">1984</span>'+
								'<span class="number">1988</span>'+
								'<span class="number">1992</span>'+
								'<span class="number">1996</span>'+
								'<span class="number">2000</span>'+
								'<span class="number">2003</span>'+
								'<span class="number">2006</span>'+
								'<span class="number">2009</span>'+
								'<span class="number">2012</span>'+
								'<span class="number">2017</span> '+
						'</div>';

	var $sliderArr_8 = [];
	var $sliderArr_8_lower = [];
	var $sliderArr_8_large = [];

	for(var i=0;i<4;i++){ // [1, 1, ...]
		$sliderArr_8.push(1);
	}
	for(var i=0;i<3;i++){ // [1, 1, ...]
		$sliderArr_8_lower.push(1);
	}
	for(var i=0;i<$time_rest;i++){ // [1, 1, ...]
		$sliderArr_8_large.push(1);
	}

	var $sliderData_8 = [
							{key: 1980, value: $sliderArr_8},
							{key: 1984, value: $sliderArr_8},
							{key: 1988, value: $sliderArr_8},
							{key: 1992, value: $sliderArr_8},
							{key: 1996, value: $sliderArr_8},
							{key: 2000, value: $sliderArr_8_lower},
							{key: 2003, value: $sliderArr_8_lower},
							{key: 2006, value: $sliderArr_8_lower},
							{key: 2009, value: $sliderArr_8_lower},
							{key: 2012, value: $sliderArr_8_large},
							{key: 2017, value: 1},
							{key: $time_max}
						]	
	
	/**** 数值为0-10000 ****/
	var $sliderHtml_9 = $sliderHtml_common +
						'<div class="price-range-text">'+ 
								'<span class="number number-first">0</span>'+
								'<span class="number">1000</span>'+
								'<span class="number">2000</span>'+
								'<span class="number">3000</span>'+
								'<span class="number">4000</span>'+
								'<span class="number">5000</span>'+
								'<span class="number">6000</span>'+
								'<span class="number">7000</span>'+
								'<span class="number">8000</span>'+
								'<span class="number">9000</span>'+
								'<span class="number">1万</span> '+
						'</div>';


	var $sliderArr_9 = [];
	for(var i=0;i<10;i++){ // [100, 100, ...]
		$sliderArr_9.push(100);
	}

	var $sliderData_9 = [
							{key: 0,  value: $sliderArr_9},
							{key: 1000, value: $sliderArr_9},
							{key: 2000, value: $sliderArr_9},
							{key: 3000, value: $sliderArr_9},
							{key: 4000, value: $sliderArr_9},
							{key: 5000, value: $sliderArr_9},
							{key: 6000, value: $sliderArr_9},
							{key: 7000, value: $sliderArr_9},
							{key: 8000, value: $sliderArr_9},
							{key: 9000, value: $sliderArr_9},
							{key: 10000,value: 0.5},
							{key: 10001}
						]	
//*******************************************************************************************
//*******************************************************************************************

    for(var i=0;i<$(".price-range").length;i++){

		var $sliderHtml,$sliderData;
		var $thisEle = $(".price-range").eq(i);
		var $thisType = $thisEle.data("type");

		if($thisType == "num-0-100"){
			$sliderHtml = $sliderHtml_1;
			$sliderData = $sliderData_1;
			$sliderUnit = "";
			$sliderLeftValue = 0;
			$sliderRightValue = 101; //101
		}else if($thisType == "num-0-1000"){
			$sliderHtml = $sliderHtml_2;
			$sliderData = $sliderData_2;
			$sliderUnit = "";
			$sliderLeftValue = 0;
			$sliderRightValue = 1001; //1001
		}else if($thisType == "num-0-1"){
			$sliderHtml = $sliderHtml_3;
			$sliderData = $sliderData_3;
			$sliderUnit = "";
			$sliderLeftValue = 0;
			$sliderRightValue = 1.1; //1.1
		}else if($thisType == "num-0-40"){
			$sliderHtml = $sliderHtml_4;
			$sliderData = $sliderData_4;
			$sliderUnit = "";
			$sliderLeftValue = 0;
			$sliderRightValue = 41; //41
		}else if($thisType == "num-b30-100"){
			$sliderHtml = $sliderHtml_5;
			$sliderData = $sliderData_5;
			$sliderUnit = "";
			$sliderLeftValue = -30;
			$sliderRightValue = 101; //101
		}else if($thisType == "num-0-100000"){
			$sliderHtml = $sliderHtml_6;
			$sliderData = $sliderData_6;
			$sliderUnit = "";
			$sliderLeftValue = 0;
			$sliderRightValue =  100001; //100001
		}else if($thisType == "num-0-1000000"){
			$sliderHtml = $sliderHtml_7;
			$sliderData = $sliderData_7;
			$sliderUnit = "";
			$sliderLeftValue = 0;
			$sliderRightValue = 1000001; //1000001
		}else if($thisType == "time-1980-now"){
			$sliderHtml = $sliderHtml_8;
			$sliderData = $sliderData_8;
			$sliderUnit = "";
			$sliderLeftValue = 1980;
			$sliderRightValue = $time_max;				
		}else if($thisType == "num-0-10000"){
			$sliderHtml = $sliderHtml_9;
			$sliderData = $sliderData_9;
			$sliderUnit = "";
			$sliderLeftValue = 0;
			$sliderRightValue = 10001; //10001			
		}


		$thisEle.html($sliderHtml);
		$thisEle.slider({
			unit: $sliderUnit, // 单位
			beyondMax: true,
			beyondMin: true,
			firstWidth: 34,
			lastWidth: 23,
			scale: $sliderData
		}).on("changed", function(e, args) {
			
			var min_r = args.value.leftValue;
			var max_r = args.value.rightValue;
			
			if($(this).parents(".row").data("min")==undefined){
				$(this).parents(".row").attr("data-min",min_r);
			}else{
				$(this).parents(".row").data("min",min_r);
			}
			
			if($(this).parents(".row").data("max")==undefined){
				$(this).parents(".row").attr("data-max",max_r);
			}else{
				$(this).parents(".row").data("max",max_r);
			}
			
			$(this).parents(".row").find(".tip-content").show();
			
		});
		
		$thisEle.data("slider").setRange({
			leftValue: $sliderLeftValue,
			rightValue: $sliderRightValue
		});
	}
	
});