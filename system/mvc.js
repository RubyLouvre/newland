$.define("mvc", "router,../app/routes",function(Router, routes){
    $.log("已加载mvc模块")
    var router =  $.router = Router.createRouter();
    //routes(router)
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
    var mvc = {};
    mapper.resources = function(name, opts, callback){
        mvc[name] = {}
        //如果只有两个参数，那么将它修正为三个
        opts = opts || {};
        if (typeof opts == 'function') {
            callback = opts;
            opts = {};
        }
        var activeRoutes = getActiveRoutes( opts );
        for(var action in activeRoutes){
            var path = activeRoutes[ action ].replace("mass", name);
            var match = activeRoutes[ action ].replace("mass", name).match(/\S+/g)
            console.log(path)
            mvc[name][action] = router.match(match[0], match[1], function(){
               // console.log(path)
            })

        }
       
    }
    mapper.resources("magazines")
//   默认路由
//   match '/:controller(/:action(/:id))'

//正则路由
//match 'products/:id', :to => 'catalog#view'
//命名路由
//match 'logout', :to => 'sessions#destroy', :as => 'logout'
   

})
