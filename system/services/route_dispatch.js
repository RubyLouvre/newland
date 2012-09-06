define( ["../controller"], function(){
    //这是必经的第三个服务
    return function( flow ){
        flow.bind("route_dispatch", function(){
            var go = $.router.routeWithQuery( this.method, this.url );
            var cpath = $.core.base + "app/controllers"
            if( go ){//如果当前URL请求匹配路由规则（app/routes）中的某一项，则交由MVC系统去处理
                flow.params = go.params || {};//重写params
                var value = go.value;
                if(typeof value === "string"){
                    var match = value.split("#");
                    var cname = match[0];//取得控制器的名字
                    var aname = match[1];//取得action的名字
                    var controller = $.controllers[ cname  ];
                    if(!controller){//如果不存在才加载
                        var path =  $.path.join( cpath ,cname +"_controller");
                        $.require( path, function( option ){
                            //进行控制反转，构建我们所需要的控制器子类与它的实例
                            option.inherit = $.core.controller;
                            var klass = $.factory(option);
                            controller = $.controllers[ cname  ] = new klass;
                        });
                    }
                    //newland.js的路由系统，由路由器，路由映射，路由规则这三模块组成
                    //路由器(system/more/router.js)用于定义路由
                    //路由映射(system/more/mapper.js),用上面的提供add方法,将用户请求导向MVC系统
                    //路由规则(app/routes.js),用上面提供的一系列API，对URL究竟导向哪个控制器哪个action进行更细致的制定
                    if( controller && typeof controller[aname] == "function" ){
                        var action = controller[aname];
                        flow._cname = cname;
                        flow._aname = aname;
                        $.log("开始调用action", "magenta", 7)
                        //如果调用了get_cookie服务,肯定会调用session服务,但如果session服务还没有到位,
                        //就通过bind("open_session",fn)这加锁机制等待服务过错成才进入action
                        flow.bind("open_session",function(){
                            $.log("已经到达指定action","green",7)
                            action( flow );//到达指定action
                            if( !flow.rendered ){
                                flow.render({
                                    location: flow._cname + "/"+ flow._aname
                                });
                            }
                        });
                        flow.fire("create_cookie");
                    }else{
                        var msg = "找不到对应controller或action"
                        $.log(msg,"red", 3)
                        flow.fire("send_error", 501, msg)
                    }
                }
            }else{
                flow.params = $.parseUrl(this.url, true).query
                var format =  this.pathname.match( /\.(\w+)$/) ;
                format = format || "**"
                flow.fire("respond_to", format[1])  //走静态路线
            }
        })
    }
})

//2012.8.19 使用httpflow.pacth方法节省代码量
    //http://d.hatena.ne.jp/scalar/20120508/1336488868
/*
 用cookie在本地传输数据

最近在研究如何测试网页的加载速度，发现了一个html5有一个叫performance的类可以获取诸如网络延迟，页面加载以及onload event处理时间等信息。
为了自动化这个测试，我需要在用javascript获取这些信息之后用其他工具把他记录下来，我不想自己搭建一个webserver用javascript往web server发送数据。一个比较简单的办法就是把这些信息用cookie的形式记录下来，然后在其他程序读取cookie信息即可。
以下是Javascript操作cookie的代码：

function createCookie(name, value, days)
{
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    }
  else var expires = "";
  document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name)
{
  var ca = document.cookie.split(';');
  var nameEQ = name + "=";
  for(var i=0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1, c.length); //delete spaces
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
  return null;
}

function eraseCookie(name)
{
  createCookie(name, "", -1);
}

IE下读取cookie用wininet API中的InternetGetCookie即可。需要注意的是第一个参数lpszUrl。我做测试的时候是在本机上面写了一个 html页面，在这个页面里面用javascript设置了cookie。从ie临时文件夹可以看到，cookie文件的名字叫cookie:zhijun.peizj@~~local~~/。其他的网站的cookie文件名叫cookie:zhijun.peizj@163.com/。 如下图所示：

所以我猜测这个url参数应该使用~~local~~， 但是发现函数调用失败，返回值是12006，也就是ERROR_INTERNET_UNRECOGNIZED_SCHEME。尝试使用了local, 127.0.0.1都无效。后来发现这篇文章http://www.cnblogs.com/huqingyu/archive/2008/11/27/1342256.html， 知道需要加上http头，于是试过http:// ~~local~~, http://local, http://local.com, http://127.0.0.1 都发现无效。最后再次读上面那篇文章，发现下面有一个微软的员工的回答：that the URL field is the url that the user navigates to when browsing to a site. 于是想起再次用ie去打开那个html文件，发现地址栏是file:///C:/Users/zhijun.peizj/Desktop/performance.html。 重新使用file:///作为URL，发现函数调用成功！
http://www.mikealrogers.com/

https://github.com/substack/tilemap

http://substack.net/
    //http://guides.rubyonrails.org/action_controller_overview.html
    //提供了组件(component)、模板(layout)、过滤器(filter)、路由(router)、类自动加载(class autoload)、
    //http://code.google.com/p/raremvc/
    //静态资源按需加载、框架核心函数钩子(hook)，让代码更容易共用，使用更加方便!
 */

