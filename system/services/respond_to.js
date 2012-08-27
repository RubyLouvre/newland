define( function(){
 
    return function(flow){
        flow.bind("respond_to", function(format){
            var str, res = flow.res;
            var url = $.path.join($.core.base, "app/views", flow._cname, flow._aname + "."+ format);
            try{
                str = $.readFileSync(url,"utf-8");
            }catch(e){
                $.log(e.message, "red", 3);
                return flow.fire("send_error", 406, e)
            }
            switch(format){
                case "html":
                    res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Content-Length', str.length);
                    res.end(str);
                    break;
                case "json":
                    str = JSON.stringify(str);
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Content-Length', str.length);
                    res.end(str);
                case "txt":
                    res.setHeader('Content-Type', 'text/plain');
                    res.setHeader('Content-Length', str.length);
                    res.end(str);
                    break;
            }
        })
    }

})
