//上传图片方法
function UploadPhotoMethod(obj){
	var getFile=$(obj).val();
  	var fileName=getFileName(getFile)
	function getFileName(o){
	    var pos=o.lastIndexOf(".");
	    return o.substring(pos+1);  
	}
	var te=/jpg|jpeg|png|JPG|PNG/g;
	if(te.test(fileName)==false){
		alert("图片格式错误")
	}else{
		$(".portraitForm").ajaxSubmit(function(json) {
			console.log(json);
			if(json.code != 200) {
				alert("上传图片失败，请稍后重试");
				return;
			}
			uploadImg=json.imageList[0].imageurl;
			$(".portraitStyle").attr("src",uploadImg);
		})
}};

//上传图片方法2
function uploadImg(obj,okFun){
	var getFile=$(obj).val();
  	var fileName=getFileName(getFile)
	function getFileName(o){
	    var pos=o.lastIndexOf(".");
	    return o.substring(pos+1);  
	}
	var te=/jpg|jpeg|png|JPG|PNG/g;
	if(te.test(fileName)==false){
		alert("图片格式错误")
	}else{
		$(obj).ajaxSubmit(function(json) {
			console.log(json);
			if(json.code != 200) {
				alertokMsg("上传图片失败，请稍后重试","确定");
				return;
			}
			okFun(json);
		})
}};

function uploadImg3(obj,okFun){
	var getFile=$(obj).val();
  	var fileName=getFileName(getFile)
	function getFileName(o){
	    var pos=o.lastIndexOf(".");
	    return o.substring(pos+1);  
	}
	var te=/jpg|jpeg|png|JPG|PNG/g;
	if(te.test(fileName)==false){
		alert("图片格式错误")
	}else{
		$(obj).ajaxSubmit(function(json) {
			console.log(json);
			if(json.code != 200) {
				alertokMsg("上传图片失败，请稍后重试","确定");
				return;
			}
			okFun(json);
		})
}};