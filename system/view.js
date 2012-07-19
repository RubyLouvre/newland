$.define("view", "./ejs, fs", function(ejs, fs){
    return function view( res, data, flow, opts){
        try{
            //=====================局部模板部分==========================
            var url = opts.url, fn = $.viewsCache[  url ]
            if( !fn ){
                var text =  fs.readFileSync( url,  'utf-8');
                fn =  $.viewsCache[ url ] = $.ejs( text );
            }
            text = fn.call(data, opts.data);
            //======================全局模板部分===========================
            if(typeof data.layout == "string"){
                data.partial = text
                url = $.path("app","views/layout", data.layout ), fn = $.viewsCache[  url ];
                if( !fn ){
                    text =  fs.readFileSync( url,  'utf-8');
                    fn =  $.viewsCache[ url ] = $.ejs( text );
                }
                text = fn.call(data, opts.data);
            }
            $.log('<code style="color:', (opts.status == 200 ? "green" : "red"),'">', text,"</code>", true);
            res.writeHead(opts.status, {
                "Content-Type":  opts.contentType
            });
            res.write( text );
            res.end();
        }catch(e){
            $.log('<code style="color:red">', e ,'</code>', true);
            flow.fire("404")
        }
    }
   
})

