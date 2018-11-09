$(function(){
    	 var temValue=0;
         var lightIntensityValue=0;
         var airValue=0;
         
        $(".checkbox").click(function(){
            if($(this).hasClass("checked")){
                $(this).removeClass("checked");
            }else{
                $(this).addClass("checked").siblings().removeClass("checked");
                
            }
        });
        
        $(".temperature .checkbox").click(function(){
        	temValue=$(this).attr("value");
        });
        $(".illumination .checkbox").click(function(){
        	lightIntensityValue=$(this).attr("value");
        });
        $(".airCondition .checkbox").click(function(){
        	airValue=$(this).attr("value");
        });
        
        $(".complainTab .item").click(function(){
            var index=$(".complainTab .item").index($(this));
            $(this).addClass("on").siblings().removeClass("on");
            $(".complainContent ul").eq(index).addClass("on");
            $(".complainContent ul").eq(index).siblings().removeClass("on");
        });

        /*提交*/
        $(".submitBtn").click(function(){
            var checklist=$(".checkbox");
            var count=0;
            var openid=localStorage.getItem("openid");
            var wechatname=localStorage.getItem("wechatname");
            var area=localStorage.getItem("area");
           
            
            var temCheckbox=$(".temperature .checkbox");
            
            
            for(var i=0;i<checklist.length;i++){
                if($(checklist[i]).hasClass("checked")){
                    count++;
                }
            }
            if(count==0){
                $("#alertOk").css("display","block");
                return;
            }
            $.ajax({
                url:"/grumbleRecord/addGrumbleRecord",
                type:"post",
                dataType:"json",
                data:{
                    "openid":openid,
                    "name":wechatname,
                    "area":area,
                    "tem":temValue,
                    "lightIntensity":lightIntensityValue,
                    "air":airValue
                },
                success:function(data){
                	console.log(data);
                    if(data.code==200){
                       $("#cancelOrConfirm").css("display","block");
                    }
                },
                error:function(){

                }
            });
        });
        
        /* 弹框的操作 */
        $("#cancelOrConfirm .confirm").click(function(){
        	$(".opacity").css("display","none");
        	$(".checkbox").removeClass("checked");
        	window.location.href="../views/mobile/bindWechat.jsp";
        });
        /* 确定弹框 */
        $("#alertOk .confirm").click(function(){
        	$(".opacity").css("display","none");
        });
        $(".cancel").click(function(){
        	$(".opacity").css("display","none");
        	$(".checkbox").removeClass("checked");
        });
    });