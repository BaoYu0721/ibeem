var $window      = $(window),
win_height   = $window.height() ;
win_width   = $window.width() ;
var onScroll     = false;
var onAnimate    = false;
var headerNavClassName = "intro";
var height;
var width;
window.getWidth= function(){  
    if(window.innerWidth!= undefined){  
        return window.innerWidth;  
    }  
    else{  
        var scrollWidth = getScrollWidth();
        return $(window).width()+scrollWidth;
    }  
} 

// 获取浏览器滚动条宽度
function getScrollWidth() {  
  var noScroll, scroll, oDiv = document.createElement("DIV");  
  oDiv.style.cssText = "position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;";  
  noScroll = document.getElementsByTagName("body")[0].appendChild(oDiv).clientWidth;  
  oDiv.style.overflowY = "scroll";  
  scroll = oDiv.clientWidth;  
  document.getElementsByTagName("body")[0].removeChild(oDiv);  
  return noScroll-scroll;  
} 
//滚动时动画效果
function animateOnScroll() {
    if(!onAnimate){
      onAnimate = true;
      var scrolled = $window.scrollTop();//获取滚动距离
     $(".revealOnScroll:not(.animated)").each(function () {
       var $this = $(this);
       // alert(offsetTop = $this.offset().top);
       offsetTop = $this.offset().top;//获取元素距离文档顶端距离
       height = $this.outerHeight();//获取元素的高度
       //这里调整元素的定位在什么范围内时，触发动画
       if ((scrolled + win_height*2/3 > offsetTop)&&(offsetTop>scrolled) ) {
         if ($this.data('timeout')) {
           window.setTimeout(function(){
             $this.removeClass('animate-hidden');
             $this.addClass('animated ' + $this.data('animation'));
           }, parseInt($this.data('timeout'),10));
         } else {
           $this.removeClass('animate-hidden');
           $this.addClass('animated ' + $this.data('animation'));
         }
       }
     });
     onAnimate = false;
   }
}
//滚动时导航栏active效果
function activeOnScroll(){
  if(!onScroll){
    onScroll = true;
    var scrolled = $window.scrollTop();//获取滚动距离
    $(".section").each(function () {
        var $this = $(this);
        offsetTop = $this.offset().top;//获取元素距离文档顶端距离
        if(offsetTop >=scrolled && offsetTop<=(scrolled+(win_height*0.5))) {
          targetNav = $(this).data("link");
          $("."+headerNavClassName +" li a").each(function(){
            if($(this).attr("href")==targetNav){
              $("."+headerNavClassName+" .active").each(function(){
                $(this).removeClass("active")
              });
              $(this).addClass("active");
            }
          })
        }
        if($(".section1").offset().top >=scrolled && ($(".section1").offset().top<=scrolled+win_height)){
          $("."+headerNavClassName+" .active").each(function(){
                $(this).removeClass("active")
          });
        }
       });
      onScroll = false;
    }
}
//滚动时导航栏变化效果
function navChangeOnScroll(){
  var scrolled = $window.scrollTop();//获取滚动距离
    var section1Top = $(".section1").offset().top;//获取画面1顶端的高度
    var section1Height = $(".section1").outerHeight();//获取画面1元素的高度
    var navHeight = $("."+headerNavClassName).outerHeight();
    //当滚动高度>=顶端高度+元素高度时，导航栏变为另一套样式
    
    if(scrolled>=(section1Top+(section1Height*0.9)-navHeight)){
      var introEle = $(".intro:not(.intro-second)");
      introEle.removeClass("intro-first");
      introEle.addClass("intro-second");
      $(".section1:not(.marginTopNav)").addClass(".marginTopNav");
    }else{
      var introEle = $(".intro:not(.intro-first)");
      introEle.removeClass("intro-second");
      introEle.addClass("intro-first");
      $(".section1").removeClass(".marginTopNav");
    }
}
//滚动时首屏文字透明化效果
function opacityChangeOnScroll(){
    var scrolled = $window.scrollTop();//获取滚动距离
    var section1Top = $(".section1").offset().top;//获取画面1顶端的高度
    var section1Height = $(".section1").outerHeight();//获取画面1元素的高度
    var navHeight = $("."+headerNavClassName).outerHeight();
    //当滚动高度>=顶端高度+（元素高度／2）时，首屏文字开始变透明度
    if(scrolled>=(section1Top+(section1Height*0.3)) && scrolled<=(section1Height+section1Top)){
      //计算比例
      var m = section1Height*0.7;
      var z = scrolled-section1Height*0.3
      var bl = z/m;
      $(".font-group").css("opacity",(1-bl));
      $(".font-group").css("filter","blur("+(5*bl)+"px)");
    }else if(scrolled<=(section1Top+(section1Height*0.3))){
      $(".font-group").css("opacity",1);
      $(".font-group").css("filter","blur(0px)");
    }
}
function addClickListener(){
  //导航栏按钮事件
  $(".header-nav li a").click(function(){
    var $this = $(this);
    var target = $this.attr("href");
    var targetElement = $("."+target);
    var navHeight = $("."+headerNavClassName).outerHeight();
    $("."+headerNavClassName+" .active").each(function(){
            $(this).removeClass("active")
      });
    if(!targetElement)return false;
    onScroll = true;
    if(target!="section1"){
        $(this).addClass("active");
    }
    if(window.getWidth()>=768){
      var doScrollHeight = targetElement.offset().top-navHeight-1;
      $("html,body").animate({scrollTop:(doScrollHeight)},1000);
      setTimeout("onScroll=false",1000);
    }else{
      var doScrollHeight = targetElement.offset().top+1;
      $("html,body").animate({scrollTop:(doScrollHeight)},10);
    }
    return false;
  });
  $("#return a").click(function(){
    var $this = $(this);
        var target = $this.attr("href");
        var targetElement = $("."+target);
        var navHeight = $("."+headerNavClassName).outerHeight();
        $("."+headerNavClassName+" .active").each(function(){
                $(this).removeClass("active")
          });
        if(!targetElement)return false;
        onScroll = true;
        if(target!="section1"){
            $(this).addClass("active");
        }
        if(window.getWidth()>=768){
          var doScrollHeight = targetElement.offset().top-navHeight+1;
          $("html,body").animate({scrollTop:(doScrollHeight)},1000);
          setTimeout("onScroll=false",1000);
        }else{
          var doScrollHeight = targetElement.offset().top+1;
          $("html,body").animate({scrollTop:(doScrollHeight)},10);
        }
        return false;
  }); 
  //右下角弹出框关闭事件
  $(".t_close").click(function(){
    $(".tanchu_m").css("display","none");

  });
  //小屏时，导航栏展开界面关闭事件
  $(".header-nav .header-nav-ul .t_close").click(function(){
      $(".t_close").css("display","none");
      $(".header-nav").slideUp("slow");
      setTimeout(function(){
        $(".wrapper .navbar_m").css("display","block");
      },500)
    }
  );
  // 小屏时，右上角展开按钮
  $(".wrapper .navbar_m").click(function(){
      $(".header-nav").slideDown("slow");
      $(".t_close").css("display","block");
      $(".wrapper .navbar_m").css("display","none");
  });
  //小屏时，单击导航栏跳转并隐藏导航栏
  if(window.getWidth()<768){
    $(".header-nav .header-nav-ul li a").click(function(){
        $(".t_close").css("display","none");
        $(".header-nav").slideUp("slow");
        $(".wrapper .navbar_m").css("display","block");
      }
    );
  }
  //手机端点立即下载按钮后，判断手机系统，重定位下载链接
  $(".container_m .right_m .btn-download").click(function(){
    redirectDownloadUrl();
  });
}
//浮动时动画效果
  $(".revealOnHover").mouseenter(function(){
    var animation = $(this).data('animation');
    var $this = $(this);
       if ($this.data('timeout')) {
           window.setTimeout(function(){
             $this.removeClass('animate-hidden');
             $this.addClass('animated ' + animation);
             setTimeout(function(){
                $this.removeClass(animation);
              $this.removeClass("animated");
             },1000)
           }, parseInt($this.data('timeout'),10));
         } else {
           $this.removeClass('animate-hidden');
           $this.addClass('animated ' + animation);
           setTimeout(function(){
                $this.removeClass(animation);
                $this.removeClass("animated");
             },1000)
         }
  })

function addMouseoverListener(){
  if(window.getWidth()>=768){
    $(".section13 .bottom-1").mouseover(function(){
      $(this).removeClass("bottom-1");
      $(this).addClass("bottom-1-big");
      $(this).css("z-index","100");
    });
    $(".section13 .bottom-1").mouseout(function(){
      $(this).removeClass("bottom-1-big");
      $(this).addClass("bottom-1");
      $(this).css("z-index","1");
    });
    $(".section13 .bottom-2").mouseover(function(){
      $(this).removeClass("bottom-2");
      $(this).addClass("bottom-2-big");
      $(this).css("z-index","100");
    });
    $(".section13 .bottom-2").mouseout(function(){
      $(this).removeClass("bottom-2-big");
      $(this).addClass("bottom-2");
      $(this).css("z-index","1");
    });
    $(".section13 .bottom-3").mouseover(function(){
      $(this).removeClass("bottom-3");
      $(this).addClass("bottom-3-big");
      $(this).css("z-index","100");
    });
    $(".section13 .bottom-3").mouseout(function(){
      $(this).removeClass("bottom-3-big");
      $(this).addClass("bottom-3");
      $(this).css("z-index","1");
    });
  }
  $(".floating_ck .qrcord").mouseover(function(){
    $(".floating_ck .qrcord .qrcord_p01").innerHTML = "扫一扫<br>进入母婴营销精英社";
  });
}
function addResizeListener(){
    $(window).resize(function() {//添加窗口大小改变事件
      win_height  = $window.height() ;//重新赋值窗口高度
      win_width   = $window.width() ;//重新赋值窗口宽度
      throttle(doResize);
    });
}  
function addScrollListener(){
   $window.on('scroll', function(){
    revealOnScroll();
    opacityChangeOnScroll();
  });//添加滚动事件
} 
function doResize(){
        setFontsize();
        setDefaultHeight();
        //setDefaultMargin();
      }
function setDefaultHeight(){
  if(window.getWidth()>=768){
      $(".section1").css("height",$(window).height());
      $(".section").each(function(){
        var topHeight = $(this).find(".top").outerHeight(true);
        var navHeight = $(".intro").outerHeight(true);
        var thisHeight = $(window).height()-navHeight-topHeight;
        $(this).find(".bottom").css("height",thisHeight);
        $(this).find(".bottom .left").css("height",thisHeight);
        $(this).find(".bottom .right").css("height",thisHeight);
        $(this).find(".bottom .right")
        $(this).find(".swiper-container-mobile").css("height",thisHeight*0.9);
        $(this).find(".swiper-container-mobile").css("width",thisHeight*0.5);
      });
      $(".section2>.bottom").css("height","15em");
  } else{
    $(".section1").css("height","12em");
    $(".section .bottom").css("height","auto");
    $(".section .bottom .left").css("height","auto");
    $(".section .bottom .left").css("height","auto");
    
  }
  if(window.getWidth()<768){
    // $(".section1").css("height",'23.66em'); 
      // 画面7高度设置，高度基于宽度设置
    // $(".section7").css("height",win_width*1.6);//将画面1的高度设置为浏览器屏幕高度
  }  
}

function setFontsize(){
  if(window.getWidth()>=1024){
    $("body").css("font-size",window.getWidth()*0.0138)
  }else if(window.getWidth()>=768){
    $("body").css("font-size",1024*0.0138)//PC端最小适配到宽度1024
  }else if(window.getWidth()>=300){//手机最小适配到320
    $("body").css("font-size",window.getWidth()*0.0668)
  }else{
    $("body").css("font-size",19.8)
  }
  
}
function removeAnimate(){
  if(window.getWidth()<768){
    $(".animate-hover-floatup").each(function(){
      $(this).removeClass("animate-hover-floatup");
    });
  }
}


function revealOnScroll(){
  animateOnScroll();
  activeOnScroll();
  navChangeOnScroll();
}



//识别手机系统
function ismobile(test){
    var u = navigator.userAgent, app = navigator.appVersion;
    if(/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))){
     if(window.location.href.indexOf("?mobile")<0){
      try{
       if(/iPhone|mac|iPod|iPad/i.test(navigator.userAgent)){
        return '0';
       }else{
        return '1';
       }
      }catch(e){}
     }
    }else if( u.indexOf('iPad') > -1){
        return '0';
    }else{
        return '1';
    }
};

//重定位下载链接
function redirectDownloadUrl(){
  // 0:iPhone 1:Android
  var sys = ismobile(1);
  var url ;
  if(sys ==0){
    url = iosDownloadUrl;
  }else{
    url = androidDownloadUrl;
  }
  $(".btn-download").attr("href",url);
}
//节流函数,用于滚动和resize时解决高频发生造成的浏览器重绘卡死问题
function throttle(method, context) {
  //清除执行函数的定时器，第一次进入为空
  clearTimeout(method.tId); 
  //设置一个100ms后在指定上下文中执行传入的method方法的定时器。
  method.tId = setTimeout(function () {
    method.call(context);
  }, 100);
}
function main(){
  doResize();//加载时识别浏览器大小，将首屏调成浏览器屏幕大小
  // setDefaultMargin();//加载时设置画面1container的padding-top值
  addScrollListener();
  addResizeListener();
  addClickListener();//添加单击事件
  addMouseoverListener();//添加鼠标悬浮事件
  revealOnScroll();//加载时执行一次滚动事件方法，为了播放动画
  removeAnimate();//加载时如果识别是小屏，移除动画class
  sectionJS();//页面中不同画面的的js逻辑
}
main();


function alertMes(){
  if(!height || height!=$(window).height() || !width || width!=$(window).width()){
    
    alert("window.width:"+window.getWidth());
    height = $(window).height();
    width = $(window).width();
    return;
  }
}


function sectionJS(backDiv,showDiv){
  $("#btn_login").click(function(){
    var url = $(this).data("url");
    window.location.href=url;
  })
  $("#btn_regist").click(function(){
    var url = $(this).data("url");
    window.location.href=url;
  })
  var myDate = new Date();
    //获取当前年
    var year=myDate.getFullYear();
    $("#copyright_year").html(year);

    if(window.getWidth()>=768){
      if (!$.support.leadingWhitespace) {
        $(".section1>.indexbg").html("");
      }else{
        $(".section1>.indexbg").html("<video autoplay muted loop>"+
            "<source src='ibem_images/ibem_web/video.mp4' type='video/mp4'>"+
        "</video><div class='popover'></div>");  
      }
    }else{
      $(".section1>.indexbg").html('<div class="swiper-container-bg">'+
        '  <div class="swiper-wrapper">'+
        '      <div class="swiper-slide">'+
        '        <img src="/public/promotion/ibem_images/ibem_web/web_1_swiper.jpg">  '+
        '      </div>'+
        '      <div class="swiper-slide">'+
        '        <img src="/public/promotion/ibem_images/ibem_web/web_2_swiper.jpg">  '+
        '      </div>'+
        '      <div class="swiper-slide">'+
        '        <img src="/public/promotion/ibem_images/ibem_web/web_3_swiper.jpg">  '+
        '      </div>'+
        '      <div class="swiper-slide">'+
        '        <img src="/public/promotion/ibem_images/ibem_web/web_4_swiper.jpg">  '+
        '      </div>'+
        ' </div>'+
        '</div>');
    }

    
    // 显示网页内容，去掉loading
    $("#outer").css("display","block");
    $(".loading").addClass("transparent");
    setTimeout(function(){$(".loading").remove();},500)
    
    // 轮播图
    var mySwiper = new Swiper('.swiper-container',{
        loop: true,
        pagination : '.swiper-pagination-web',
        paginationClickable :true,
        autoplay : 2000,
        speed:1000,
        autoplayDisableOnInteraction : false
        //其他设置
     });  
    var firstSwiper = new Swiper(".swiper-container-bg",{
        loop: true,
        paginationClickable :true,
        autoplay : 2500,
        speed:1000,
        autoplayDisableOnInteraction : false
        //其他设置
     });
    var mobileSwiper = new Swiper(".swiper-container-mobile",{
        loop: true,
        paginationClickable :true,
        pagination : '.swiper-pagination-mobile',
        autoplay : 2000,
        speed:1000,
        autoplayDisableOnInteraction : false
        //其他设置
     });
    $(".section2>.bottom>.container>.item").click(function(){
      var $this = $(this);
    var target = $this.data("href");
    var targetElement = $("."+target);
    var navHeight = $("."+headerNavClassName).outerHeight();
    $("."+headerNavClassName+" .active").each(function(){
            $(this).removeClass("active")
      });
    if(!targetElement)return false;
    onScroll = true;
    if(target!="section1"){
        $(this).addClass("active");
    }
    if(window.getWidth()>=768){
      var doScrollHeight = targetElement.offset().top-navHeight-1;
      $("html,body").animate({scrollTop:(doScrollHeight)},1000);
      setTimeout("onScroll=false",1000);
    }else{
      var doScrollHeight = targetElement.offset().top-1;
      $("html,body").animate({scrollTop:(doScrollHeight)},1000);
      setTimeout("onScroll=false",1000);
    }
    return false;
    })
    
}

        
// 微信分享朋友圈配置
var timelineTitle = "IBEM";
var timelineLink = "http://www.ibeem.com/promotion";
var timelineImgUrl = "http://www.ibeem.com/promotion";
// 微信分享给朋友配置
var messageTitle = "IBEM实时建筑环境后评估系统";
var messageDesc = "通过在线移动应用、实时传感设备采集建筑环境的主客观数据采用后评估领域专业模型对“建筑-能耗-客观参数-主观评价”进行深入挖掘分析，提高后评估数据采集分析的效率";
var messageLink = "http://www.ibeem.com/promotion";
var messageImgUrl = "http://www.ibeem.com/promotion/ibem_images/ibem_web/logo.png";



