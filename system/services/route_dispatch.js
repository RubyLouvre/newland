define( function(){
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
                        $.require( path, function( ret){
                            controller = $.controllers[ cname  ] = ret
                        });
                    }
                    if( controller && typeof controller[aname] == "function" ){
                        var action = controller[aname];
                        //如果调用了get_cookie服务,肯定会调用session服务,但如果session服务还没有到位,
                        //就通过bind("open_session",fn)这加锁机制等待服务过错成才进入action
                        if( flow.cookies && !flow.session){//如果调用了cookie服务
                            flow.bind("open_session",function(){
                                action( flow );//到达指定action
                            })
                        }else{
                            action( flow );//到达指定action
                        }
                    }else{
                        //如果已找不到，抛500内部错误
                        $.log("找不到对应controller或action","red", 3)
                    }
                }
            }else{
                flow.params = $.parseUrl(this.url, true).query
                flow.fire("no_action")
            //走静态路线
            }
        })
    }
})



