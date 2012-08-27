//=========================================
//  路由映射模块，提供系统级支撑
//==========================================
define( ["./router", "../app/routes", "./mass/more/plural"], function(Router, curry ){
    //此类用于建立从路由到控制器的映射
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
    var mapper = $.mapper = {}
    var router = $.router = Router.createRouter();
    //http://guides.rubyonrails.org/routing.html
    //http://inosin.iteye.com/blog/786467
    //创建方法路由
    "GET,POST,PUT,DELETE".replace( $.rword, function(method){
        mapper[ method.toLowerCase() ] = function( url, path ){
            router.add( method, url, path )
        }
    });
    /**
         * 创建资源路由
map.resources("photos")
在你的应用程序中，这一行会创建7个不的路由。
HTTP verb    URL          controller      action    用法
GET        /photos        Photos          index    创建一个显示所有photo的页面
GET        /photos/new    Photos          new      用于创建photo的页面
POST       /photos        Photos          create   用于创建photo的POST请求
GET        /photos/1      Photos          show     显示特定photo的明细
GET        /photos/1/edit Photos          edit     用于编辑photo的页面
PUT        /photos/1      Photos          update   用于更新photo的POST请求
DELETE     /photos/1      Photos          destroy  用于删除photo的POST请求
         * @param {String} name 资源的名字，必须是复数
         * @param {Object} options 可选。包含only,except键名的普通对象,或as, path, sensitive等值
         * @param {Number} actions 可选。子路由函数
         */
    mapper.resources = function( name, opts, callback){
        //如果只有两个参数，那么将它修正为三个
        //第三个用于嵌套路由
        opts = opts || {};
        if (typeof opts == 'function') {
            callback = opts;
            opts = {};
        }
        var activeRoutes = getActiveRoutes( opts );
        //命名路由的简捷方式
        var prefix = this.prefix || "";
        delete this.prefix;
        if (typeof callback == 'function') {// users/:user_id
            prefix = $.path.join( name , '/:' + $.String.singularize( name ) + '_id')
            var sub = $.mix({
                prefix: prefix
            }, mapper)
            callback(sub)
        }
        for(var action in activeRoutes){
            var path = activeRoutes[ action ].replace( "mass", name);
            var match = path.match(/\S+/g);
            router.add( match[0], $.path.join( prefix + match[1] ), name+"#"+action )
        }
    }
    mapper.namespace = function( name, callback ){
        var sub = $.mix({
            prefix: name 
        }, mapper)
        callback(sub)
    }
    mapper.add = function(method, path, value){
        router.add(method, path, value)
    }
    curry( mapper );
})



