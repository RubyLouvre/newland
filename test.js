var encode = encodeURIComponent;
var decode = decodeURIComponent;
// serialize('foo', 'bar', { httpOnly: true })  => "foo=bar; httpOnly"
//将两个字符串变成一个cookie字段
var serialize = function(name, val, opts){
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


var http = require('http');
http.createServer(function (req, res) {
    // 获得客户端的Cookie
    var cookie = {};
    cookie = parse( req.headers.cookie )
    console.log(cookie)
    var json = cookie.sid
    if(json){
        json =  JSON.parse(json);
        console.log(json)
    }
    // 向客户端设置一个Cookie
    res.writeHead(200, {
        'Set-Cookie':serialize("sid", JSON.stringify({
            aaa:111,
            bbb:222
        })),
        'Content-Type': 'text/plain'
    });
    res.end('Hello World\n');
}).listen(8888);
console.log('Server running at http://127.0.0.1:8888/');