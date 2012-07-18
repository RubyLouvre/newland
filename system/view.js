$.define("view", "./ejs, fs", function(ejs, fs){
    return function( res, data, flow, opts){
        try{
            //=====================局部模板部分==========================
            var url = opts.url;
            var fn = $.viewsCache[  url ];
            if( !fn ){
                var text =  fs.readFileSync( url,  'utf-8');
                fn =  $.viewsCache[ url ] = $.ejs( text );
            }
            data.partial = fn.call(data, opts.data);
            //======================全局模板部分===========================
            url = $.path("app","views/layout", data.layout );
            fn = $.viewsCache[ url ];
            if( !fn ){
                text =  fs.readFileSync( url,  'utf-8');
                fn =  $.viewsCache[ url ] = $.ejs( text );
            }
            text =  fn( data );
            $.log("<code style='color:green'>", text,"</code>",true);
            res.writeHead(opts.statusCode, {
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

