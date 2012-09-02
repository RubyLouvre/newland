define( ["http"], function( http ){
    var html = '<!DOCTYPE HTML><html><head><title>Error</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>'+
    '<body><h1 style="color:red">{title}</h1><ul>{stack}</ul></body></html>'
    return function( flow ){
        flow.bind("send_error", function( code, error, format ){
            var res = flow.res;
            var req = flow.req
            format = format || req.headers.accept || '';
            if(!error || typeof error == "string"){
                error = {
                    stack: String(error || "")
                }
            }
            if (~format.indexOf('html')) {
                var title = "Error "+code +" : "+ http.STATUS_CODES[code]
                var stack = String(error.stack || '')
                .split('\n').slice(1)
                .map(function(v){
                    return '<li>' + v + '</li>';
                }).join('');
                html = String(html)
                .replace('{stack}', stack)
                .replace('{title}', title)
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(html);
            // json
            } else if (~format.indexOf('json')) {
                var object = {
                    code:  code,
                    message: object.message||"unknown",
                    stack: object.stack
                };
                for (var p in error)
                    object[p] = error[p];
                var json = JSON.stringify({
                    error: object
                });
                res.setHeader('Content-Type', 'application/json');
                res.end(json);
            // plain text
            } else {
                res.writeHead(res.statusCode, {
                    'Content-Type': 'text/plain'
                });
                res.end(code+"  "+error.stack);
            }
        });
    }
})


/**
Last-Modified 与If-Modified-Since 都是用于记录页面最后修改时间的 HTTP 头信息，
只是 Last-Modified 是由服务器往客户端发送的 HTTP 头，而 If-Modified-Since
则是由客户端往服务器发送的头，可 以看到，再次请求本地存在的 cache 页面时，
客户端会通过 If-Modified-Since 头将先前服务器端发过来的 Last-Modified 最后修改时间戳发送回去，
这是为了让服务器端进行验证，通过这个时间戳判断客户端的页面是否是最新的，如果不是最新的，
则返回新的内容，如果是最新的，则 返回 304 告诉客户端其本地 cache 的页面是最新的，
于是客户端就可以直接从本地加载页面了，这样在网络上传输的数据就会大大减少，同时也减轻了服务器的负担。
前后端不一样。
很少有听说后端同学为了使用某个组件，比如rbac权限控制，而刻意改变自己的模型或模型的关系吧？
但是前端同学为了使用现成的某个组件，会经常调整自己的数据对象的格式，，来满足组件的要求。
这是因为前端的复杂度在适应多浏览器的兼容组件的编写上，所以弱化数据，，让数据模型去适应控制器。
后端一般都是控制器（角色）去适应模型（实体），而不是改变自己的模型，去适应自己的控制器吧。
* */