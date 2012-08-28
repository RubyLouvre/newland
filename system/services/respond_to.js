define( function(){
 
    return function(flow){
        flow.bind("respond_to", function(format){
            var str, res = flow.res;
            var url = $.path.join($.core.base, "app/views", flow._cname, flow._aname + "."+ format);
            //  res.setEncoding("utf8")
            try{
                str = $.readFileSync(url,"utf8");
            }catch(e){
                $.log(e.message, "red", 3);
                return flow.fire("send_error", 406, e)
            }
            switch(format){
                case "html":
                    res.setHeader('Content-Type', 'text/html');
                    break;
                case "json":
                    str = JSON.stringify(str);
                    res.setHeader('Content-Type', 'application/json');
                case "txt":
                    res.setHeader('Content-Type', 'text/plain');
                    break;
            }
            //不要使用str.length，会导致页面等内容传送不完整
            res.setHeader('Content-Length', Buffer.byteLength(str));
            res.end(str);
        })
    }

})
