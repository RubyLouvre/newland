$.define("mvc", "flow,http, more/mapper, hfs, controller, ../app/configs",function( Flow,http ){
    $.log("已加载mvc模块");
    //http://guides.rubyonrails.org/action_controller_overview.html
    //提供了组件(component)、模板(layout)、过滤器(filter)、路由(router)、类自动加载(class autoload)、
    ////http://code.google.com/p/raremvc/
    //静态资源按需加载、框架核心函数钩子(hook)，让代码更容易共用，使用更加方便!
    var  flash = function(type, msg) {
        var arr, msgs;
        msgs = this.session.flash = this.session.flash || {};
        if (type && msg) {
            return msgs[type] = String(msg);
        } else if (type) {
            arr = msgs[type];
            delete msgs[type];
            return String(arr || "");
        } else {
            this.session.flash = {};
            return msgs;
        }
    }
    var resource_flow = new Flow;
    resource_flow.bind("ok", function(intercepters){
      console.log(intercepters.length)
        http.createServer(function(req, res) {
            var flow = Flow()
            flow.res =  res;
            flow.req =  req;

            intercepters.forEach(function(fn){

                fn(flow)
            });
           console.log("xxxxxxxxxxx")
            var go = $.router.routeWithQuery(req.method,req.url);
            if( go ){
                var value = go.value;
                if(typeof value === "string"){
                    var match = value.split("#");
                    var cname = match[0];
                    var aname = match[1];
                    var instance = $.controllers[cname];
                    if( instance ){
                        console.log("调用控制器")
                        instance[aname](flow);
                    }else{
                        console.log("不存在此控制器")
                    }
                }
            }else{ //直接读取
                flow.fire("xxxx")
            }
        }).listen( $.configs.port );

    })
    var inter = $.configs.intercepters
    $.walk("app/controllers", function(files){//加载资源
        inter.forEach(function(str){
            files.unshift( "system/intercepters/"+str)
        });
        $.require(files, function(){
            var intercepters = [].slice.call(arguments,0, inter.length);
            resource_flow.fire( "ok",intercepters )
            console.log("已加载所有控制器与所需拦截器")
        });
    })

//   默认路由
//   match '/:controller(/:action(/:id))'

//正则路由
//match 'products/:id', :to => 'catalog#view'
//命名路由
//match 'logout', :to => 'sessions#destroy', :as => 'logout'
   

})
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
http://vertx.io/ 一个漂亮的网站
     *
     */