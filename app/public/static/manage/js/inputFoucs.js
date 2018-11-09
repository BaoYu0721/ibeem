var oEventUtil = new Object(); 
		oEventUtil.AddEventHandler = function(oTarget,sEventType,fnHandler){ 
			 if(oTarget.addEventListener){ 
				 oTarget.addEventListener(sEventType,fnHandler,false); 
			 } else if(oTarget.attachEvent) { 
				 oTarget.attachEvent('on'+sEventType,fnHandler); 
			 } else{ 
				 oTarget['on'+sEventType] = fnHandler; 
			 } 
		}; 
		//回调函数,获得焦点时变为红色 
		var oTF = function() { 
			var oEvent = arguments[0]; 
			var oTarget = oEvent.target || oEvent.srcElement; 
			 //oTargelor="#ff0000"; 
			$(oTarget).css({
				"borderWidth":"1px",
				"borderStyle":"solid",
				"borderColor":"#019ddd"
			});
			 //oTarget.style.color="#019ddd";
		
		} 
		//失去焦点时变为黑色 
		var oTB = function() 
		{ 
			 var oEvent = arguments[0]; 
			 var oTarget = oEvent.target || oEvent.srcElement; 
			 //oTargelor="#000000"; 
			 $(oTarget).css({
					"borderWidth":"1px",
					"borderStyle":"solid",
					"borderColor":"#fff"
				});
			 //oTarget.style.color="#979797";
		} 

        jQuery.fn.extend({
            slideRightShow: function() {
                return this.each(function() {
                    $(this).show('slide', {direction: 'right'}, 1000);
                });
            },
            slideLeftHide: function() {
                return this.each(function() {
                    $(this).hide('slide', {direction: 'left'}, 1000);
                });
            },
            slideRightHide: function() {
                return this.each(function() {
                    $(this).hide('slide', {direction: 'right'}, 1000);
                });
            },
            slideLeftShow: function() {
                return this.each(function() {
                    $(this).show('slide', {direction: 'left'}, 1000);
                });
            }
        });
       