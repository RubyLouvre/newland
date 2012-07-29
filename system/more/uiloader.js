$.define("uiloader", function(){
    /*
      //传统的UI库，为了创建一个UI需要引用一个或数个JS文件，
      //有时还要用到CSS文件，文件一多不但请求多了，还不好打包。
      //我决定把它们封装到一个HTML文件上，然后通过iframe加载，
      //利用window.name或postMessage搞定跨域问题，这样已经写好的HTML模块与相关JS逻辑就传送到主页面，以组件形式显示出来了！
       postMessage的兼容测试
       http://stevesouders.com/misc/test-postmessage.php
       window.name的实现步骤如下：
       创建一个iframe，把其src指向目标页面（提供web service的页面，该目标页面会把数据附加到这个iframe
       的window.name上，大小一般为2M，IE和firefox下可以大至32M左右；数据格式可以自定义，如json字符串）；
       监听iframe的onload事件，在此事件中立即设置这个iframe的src指向本地域的某个页面，由本地域的这个页面
       读取iframe的window.name。获取数据以后销毁这个iframe，释放内存；这也保证了安全（不被其他域frame js访问）。
       总结起来即：iframe的src属性由外域转向本地域，跨域数据即由iframe的window.name从外域传递到本地域。
       这个就巧妙地绕过了浏览器的跨域访问限制，但同时它又是安全操作。
       window.postMessge的实现步骤如下：
       本地使用message进行监听，iframe在文档载入后立即调用父窗口的postMessage自己对自己进行通信
    */
    var UIloader = function( url, callback, operatime){
        if(typeof url === "string" && typeof callback == "function"){
            url += (url.indexOf('?') > 0 ? '&' : '?') + '_time'+ new Date * 1
            operatime = operatime || 3000;
            var el = document.createElement('iframe'), data, fn ;
            //使用postMessage
            fn = $.bind(window, "message", function(e){
                e = e || event;
                el._state = 2;
                callback(e.data);
                $.unbind(window, "message", fn);
                body.removeChild(el)
            } );
            //使用iframe加载页面与window.name传输数据
            el.style.display = "none";
            el._state = 0;
            var body = document.body || document.documentElement;
            body.insertBefore( el, body.firstChild );

            $.bind( el , "load", function(e){
                if(el._state === 1 ) {
                    try {
                        data = el.contentWindow.name;
                    } catch(e) {}
                    el._state = 2;
                    callback(data)
                    callback = function(){}
                    body.removeChild(el)
                } else if(el._state === 0) {
                    setTimeout(function(){
                        el._state = 1;
                        el.contentWindow.location.replace("about:blank")
                    }, (window.opera ? operatime : 31) )
                }
            });
            el.src = url;
        }else{
            throw "arguments error"
        }
    }
//    参考http://www.cnblogs.com/rubylouvre/archive/2012/07/28/2613565.html源码中的数据返回方式
//    UIloader("http://www.cnblogs.com/rubylouvre/archive/2012/07/28/2613565.html",function(a){
//        console.log(a+"!!!!!!!!!!!!!")
//    })
    return UIloader
})

