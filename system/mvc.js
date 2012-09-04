define( ["./httpflow", "http", "fs", "./mapper"], function( Flow, http, fs ){
    var services_path = __dirname +"/services";
    var services = fs.readdirSync(services_path);
    var urls = []
    services.forEach(function(name){
        if(name.substr(-3,3) ==".js")
            urls.push( $.path.join(services_path, name) )
    });
    services =  $.require(urls);

    $.mix({
        pagesCache: {}, //用于保存静态页面,可能是临时拼装出来的
        viewsCache: {}, //用于保存模板函数
        staticCache: {}, //用于保存静态资源,
        controllers: {}  //用于保存控制器,
    });
    
    http.createServer(function(req, res) {
        var flow = new Flow()//创建一个流程对象，处理所有异步操作，如视图文件的读取、数据库连接
        flow.patch(req, res);
        $.log("请求req.url "+req.url, "green", 7)
        services.forEach(function(fn, i){
            try{
                fn(flow);//将拦截器绑到流程对象上
            }catch(e){
                $.log(urls[i] +"cause error! " ,"red", 3);
                $.log(e)
            }
        });
    }).listen( $.config.port );

    $.log("Server running at http://127.0.0.1:" + $.config.port,"red", 7)

})