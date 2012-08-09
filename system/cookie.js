$.define("cookie", function(){
    var encode = encodeURIComponent;
    var decode = decodeURIComponent;
    /// serialize('foo', 'bar', { httpOnly: true })
    ///   => "foo=bar; httpOnly"
    //将两个字符串变成一个cookie字段
    var serialize = function(name, val, opt){
        var pairs = [name + '=' + encode(val)];
        opt = opt || {};
        if (opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
        if (opt.domain) pairs.push('Domain=' + opt.domain);
        if (opt.path) pairs.push('Path=' + opt.path);
        if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
        if (opt.httpOnly) pairs.push('HttpOnly');
        if (opt.secure) pairs.push('Secure');
        return pairs.join('; ');
    };
    //将一段字符串变成对象
    var parse = function(str) {
        var obj = {}
        var pairs = str.split(/[;,] */);
        pairs.forEach(function(pair) {
            var eq_idx = pair.indexOf('=')
            var key = pair.substr(0, eq_idx).trim()
            var val = pair.substr(++eq_idx, pair.length).trim();
            if ('"' == val[0]) {
                val = val.slice(1, -1);
            }
            if (undefined == obj[key]) {
                obj[key] = decode(val);
            }
        });
        return obj;
    };
    function Cookie (req, res){
        this._resCookies = [];
        this._reqCookies = $.parseQuery(req.headers.cookie, '; ');
        res.setHeader('Set-Cookie', this._resCookies);
    }
    Cookie.parse = parse;
    Cookie.serialize = serialize;
    Cookie.prototype = {
        get: function (key){
            var obj =  this._resCookies
            return typeof key === "string" ? obj[key] : obj
        },
        set: function (name, val, opt){
            var ret = serialize(name, val, opt)
            this._resCookies.push(ret);
        }
    }
    return Cookie;
})