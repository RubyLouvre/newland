$.define("cookie", function(){
    var encode = encodeURIComponent;
    var decode = decodeURIComponent;
    // serialize('foo', 'bar', { httpOnly: true })  => "foo=bar; httpOnly"
    //将两个字符串变成一个cookie字段
    var stringify = function(name, val, opts){
        var pairs = [name + '=' + encode(val)];
        if( isFinite( opts ) && $.type( opts, "Number" ) ){
            pairs.push('Max-Age=' + opts );
        }else{
            opts = opts || {};
            if (opts.maxAge) pairs.push('Max-Age=' + opts.maxAge);
            if (opts.domain) pairs.push('Domain=' + opts.domain);
            if (opts.path) pairs.push('Path=' + opts.path);
            if (opts.expires) pairs.push('Expires=' + opts.expires.toUTCString());
            if (opts.httpOnly) pairs.push('HttpOnly');
            if (opts.secure) pairs.push('Secure');
        } 
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


    return {
        parse: parse,
        stringify: stringify
    }

})
//2012.8.19  全新cookie工具类