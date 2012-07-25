$.define("mvc", "more/router, flow, ../app/routes,deploy, more/plural, hfs, ../app/configs",function(Router,Flow, routes, deploy, plural){
    $.log("已加载mvc模块")
  
    deploy(  process.cwd() );//监听app目录下文件的变化,实现热启动

    var router = Router.createRouter();
    var mapper = {}
    /* @param {String} name 资源的名字，必须是复数
     * @param {Object} options 可选。包含only,except键名的普通对象,或as, path, sensitive等值
     * @param {Number} actions 可选。子路由函数
HTTP Verb	Path	action	used for
GET	/photos	index	display a list of all photos
GET	/photos/new	new	return an HTML form for creating a new photo
POST	/photos	create	create a new photo
GET	/photos/:id	show	display a specific photo
GET	/photos/:id/edit	edit	return an HTML form for editing a photo
PUT	/photos/:id	update	update a specific photo
DELETE	/photos/:id	destroy	delete a specific photo
     */
    var availableRoutes = {
        index:  "GET    /mass(.:format)",
        "new":  "GET    /mass/new(.:format)",
        create: "POST   /mass(.:format)",
        show:   "GET    /mass/:id(.:format)",
        edit:   "GET    /mass/:id/edit(.:format)",
        update: "PUT   /mass/:id(.:format)",
        destroy: "DELETE  /mass/:id(.:format)"
    }
    function getActiveRoutes(options) {
        var activeRoutes = {};
        if (options.only) {
            // map.resources('users', {only: ['index', 'show']});
            if (typeof options.only == 'string') {//如果是一个字符串则将它变成一个数组
                options.only = [options.only];
            }
            options.only.forEach(function (action) {
                if (action in availableRoutes) {
                    activeRoutes[action] = availableRoutes[action];
                }
            });
        }else if (options.except) {
            // map.resources('users', {except: ['create', 'destroy']});
            if (typeof options.except == 'string') {//如果是一个字符串则将它变成一个数组
                options.except = [options.except];
            }
            for (var action in availableRoutes) {
                if ( options.except.indexOf(action) === -1 ) {//如果不在列表中
                    activeRoutes[action] = availableRoutes[action];
                }
            }
        }else {
            $.mix(activeRoutes,availableRoutes)
        }
        return activeRoutes;
    }
    //http://guides.rubyonrails.org/routing.html
    //http://inosin.iteye.com/blog/786467
    "GET,POST,PUT,DELETE".replace( $.rword, function(method){
        mapper[ method.toLowerCase() ] = function( url, path ){
            router.add(method, url, path)
        }
    })

    mapper.resources = function(name, opts, callback){   
        //如果只有两个参数，那么将它修正为三个
        opts = opts || {};
        if (typeof opts == 'function') {
            callback = opts;
            opts = {};
        }
        var activeRoutes = getActiveRoutes( opts );
        var namespace  = opts.module  ? "/"+ opts.module : "";//
        delete opts.module;
        if (typeof handle == 'function') {// users/:user_id
            this.subroutes(name + '/:' + $$(name).singularize() + '_id', callback);
        }
        for(var action in activeRoutes){
            var path = activeRoutes[ action ].replace("mass", name);
            var match = path.match(/\S+/g)
            router.add(match[0], namespace + match[1], name+"#"+action)
        }
       
    }
//http://guides.rubyonrails.org/action_controller_overview.html
//提供了组件(component)、模板(layout)、过滤器(filter)、路由(router)、类自动加载(class autoload)、
//
////http://code.google.com/p/raremvc/
//静态资源按需加载、框架核心函数钩子(hook)，让代码更容易共用，使用更加方便!
    var controllers = $.controllers = {};
    var resource_flow = new Flow
    resource_flow.bind("ok", function(full){
        routes(mapper);//加载酏置
        var go = router.routeWithQuery("GET","/");
    //    console.log("======================")
        console.log( go )
        if(go){
            var value = go.value;
            if(typeof value === "string"){
                var match = value.split("#");
                var cname = match[0];
                var aname = match[1];
              //  console.log(value)
                var controller = full[cname];
                if( controller ){
                    var action = controller[aname];
                    console.log(action+"")
                }else{
                    console.log("不存在此控制器")
                }
            }
        }
    })
    $.walk("app/controllers", function(files){//加载资源
        $.require(files, function(  ){
            Array.apply([], arguments).forEach(function(obj ){
                var name = obj.controller_name;
                delete obj.controller_name;
                controllers[ name ] = obj
            });
            resource_flow.fire("ok",controllers)
        // console.log("已加载所有控制器")
        });
    })



    mapper.resources("magazines")
//   默认路由
//   match '/:controller(/:action(/:id))'

//正则路由
//match 'products/:id', :to => 'catalog#view'
//命名路由
//match 'logout', :to => 'sessions#destroy', :as => 'logout'
   

})
