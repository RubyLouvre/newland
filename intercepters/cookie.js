mass.define("parseCookie","cookie",function(Cookie){
    console.log("本模块用于在req上添加一个名为cookie的对象");
    return mass.intercepter(function(req, res){
        var str = req.headers.cookie ;
        if (typeof str !== "string") {
            req.cookie = {}
        }else{
            req.cookie = Cookie.parse(str)
        }
        /*
             * @description Set a cookies on the client. 在客户端设置cookies
             * @param {String} name name of the cookies.(require) cookies的名字*
             * @param {String} val content of the cookies.(require) cookies的数据*
             * @param {Object} options Detail options of the cookies. cookies的详细设置
             */
        res.setCookie = function (name, val, options) {
            if (typeof options != 'object')
                options = {};
            if (typeof options.path != 'string')
                options.path = '/';
            if (!(options.expires instanceof Date))
                options.expires = new Date();
            if (isNaN(options.maxAge))
                options.maxAge = 0;
            options.expires.setTime(options.expires.getTime() + options.maxAge * 1000);
            var cookie = Cookie.stringify(name, val, options);
            var oldcookie = this.headers['Set-Cookie'];
            if (typeof oldcookie != 'undefined')
                cookie = oldcookie + '\r\nSet-Cookie: ' + cookie;
            this.headers['Set-Cookie'] = cookie;
            return this;
        };
        /*
             * @decription Claer the specify cookies. 清除某指定cookies
             * @param {String} name Name of the cookies to clear.(require) 需要清除的cookies的名字*
             * @param {Object} options Detail options of the cookies. cookies的详细设置
             */
        res.clearCookie = function (name, options) {
            this.cookie(name, '', options);
            return this;
        };
        return true;
    })
});