$.define("cookie",function(){

    $.log("已加载cookie模块");

    function cookie (req, res){
        this._resCookies = [];
        this._reqCookies = this._querystring.parse(req.headers.cookie, '; ');
        res.setHeader('Set-Cookie', this._resCookies);
    }

    cookie.prototype._querystring = require('querystring');

    cookie.prototype.get = function (key){
        return this._reqCookies[key];
    }

    cookie.prototype.set = function (key, value, second, path, domain, secure){
        var ret = key + '=' + value;

        if (second){
            var time = new Date;
            time.setTime(+time + second * 1000);
            ret += '; expires=' + time.toGMTString();
        }

        if (path){
            ret += '; path=' + path;
        }

        if (domain){
            ret += '; domain=' + domain;
        }

        if (secure === true){
            ret += '; secure';
        }

        this._resCookies.push(ret);
    }

    return cookie;

})