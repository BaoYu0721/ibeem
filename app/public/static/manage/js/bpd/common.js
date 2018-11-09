var isLoading = false;
function addLoading(ele,type){
	
		if(ele==null){
			var ele= $("body");
			if(isLoading){
				return;
			}
			isLoading = true;
		}else{
			ele=$(ele)
		}
		ele.each(function(){
			if(ele.children(".loding-panel").length==0){
				ele.prepend('<style>'+
						'.loding-panel{width:100%;height:100%;background-color:rgba(0,0,0,0.5);position:fixed;top:0;left:0;;z-index:2000;}'+
						'.loding-icon{position:absolute;top:50%;left:50%;z-index:2001}'+
						'.loding-icon i{color:white;}'+
						'</style>'+
							'<div class="loding-panel">'+
							'	<div class="loding-icon" ><img src="/public/static/manage/img/loading.gif" style="width:60px;height:60px;"/></div>'+
							'</div>');
				var loadingheight = $(".loding-icon img").height();
				var loadingwidth = $(".loding-icon img").width();
				$(".loding-icon").height(loadingheight);
				$(".loding-icon").width(loadingwidth);
				$(".loding-icon").css("margin-left",-(loadingwidth/2));
				$(".loding-icon").css("margin-top",-(loadingheight/2));
			}
		})
		if(type == 1){
			ele.css("position","relative");
			ele.css("z-index",1);
			ele.find(".loding-panel").css("position","absolute");
		}
}
function removeLoading(ele){
	isLoading = false;
	if(ele==null){
		$(".loding-panel").remove();
	}else{
		$(ele).find(".loding-panel").remove();
	}
	
}