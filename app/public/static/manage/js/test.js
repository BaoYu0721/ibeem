function extractDataOld(deviceData){	
     		  var  data=deviceData.data;
     		  ecount++;
     		  if(ecount==10){
     			  ecount=0;
     		  }
     		  
     		  /* tempTemperature={
 					   name:deviceData.deviceName,
 					   time:[],
 					   data:[],
 					   color:colors[ecount]
 			   },tempHumidity={
 					   name:deviceData.deviceName,
 					   time:[],
 					   data:[],
 					   color:colors[ecount]
 			   },tempPm25={
 					   name:deviceData.deviceName,
 					   time:[],
 					   data:[],
 					   color:colors[ecount]
 			   },tempCo2={
 					   name:deviceData.deviceName,
 					   time:[],
 					   data:[],
 					   color:colors[ecount]
 			   },tempSunshine={
 					   name:deviceData.deviceName,
 					   time:[],
 					   data:[],
 					   color:colors[ecount]
 			   };  */
     		   
     			data.sort(function(a,b){
     				return a.time * 1 - b.time * 1;
     			});
     			var i, len= data.length;
     			var datum;
     			var time;
     			var newDate = new Date();
     			
     			//temperature=[],humidity=[],pm25=[],co2=[],sunshine=[];
     			
     			//为了表格数据显示，逆序排列
 	   			 data=data.sort(function(a,b){
 	   				return b.time * 1 - a.time * 1;
 	   			});
 	   			for(i = 0; i < len; i=i+10){
 	   				newDate.setTime(data[i].time);
 	   				data[i].time = newDate.Format("MM-dd hh:mm");
 	   			}
 	   			console.log(length);
     			for(i = 0; i < len; i=i+5){
     				var temparr=[];
     				datum = data[i];
     				time = datum.time;
     				timeArr.push(time);
     				datum.d1 = (datum.tem * 1).toFixed(1);
     				/* temperature.push([time,datum.d1 * 1]); */
     				/* tempTemperature.time.push(time); */
     				temparr.push(datum.time);
     				temparr.push(datum.d1*1);
     				tempTemperature.push(temparr);
     				/* tempTemperature.data[i].push(datum.time);
     				tempTemperature.data[i].push(datum.d1*1); */
     				//datum.d2 = Math.round(datum.d2 * 0.85);
     				datum.d2 = (datum.hum * 1).toFixed(1);
     				/* humidity.push([time,datum.d2 * 1]); */
     				/* tempHumidity.time.push(time); */
     				
     				/* tempHumidity.data.push(datum.d2*1);
     				tempHumidity.data.push(datum.time); */
     				
     				datum.d3 = datum.pm;
     				/* pm25.push([time,datum.d3*1]); */
     				/* tempPm25.time.push(time); */
     				
     				/* tempPm25.data.push(datum.d3*1);
     				tempPm25.data.push(datum.time); */
     				
     				datum.d4 =datum.co2;
     				/* co2.push([time,datum.d4*1]); */
     				/* tempCo2.time.push(time); */
     				
     				/* tempCo2.data.push(datum.d4*1);
     				tempCo2.data.push(datum.time); */
     				
     				//datum.d5 = Math.round(datum.d5 * 0.1);
     				datum.d5 = datum.lightIntensity
     				/* sunshine.push([time,datum.d5 * 1]);  */
     				/* tempSunshine.time.push(time); */
     				
     				/* tempSunshine.data.push(datum.d5*1);
     				tempSunshine.data.push(datum.time); */
     			}
     			/* console.log(tempTemperature);
     			temperature.push(tempTemperature);
     			humidity.push(tempHumidity);
     			pm25.push(tempPm25);
     			co2.push(tempCo2);
     			sunshine.push(tempSunshine); */
     			
     			setStockChart("tempartureChart","temparture",tempTemperature);
     			setStockChart("humidityChart","hum",humidity);
 			    setStockChart("beamChart","sunshine",sunshine);
 			    setStockChart("co2Chart","co2",co2);
 			    setStockChart("pmChart","pm25",pm25);
     		}