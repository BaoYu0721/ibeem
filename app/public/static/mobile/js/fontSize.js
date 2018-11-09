//根字体随着屏幕大小改变
function fontSize(){
	document.documentElement.style.fontSize=document.documentElement.clientWidth*20/375+'px';
}
fontSize();
window.onresize=function(){
	fontSize();	
};