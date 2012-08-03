$.define("cache_page","../more/tidy_css,../more/tidy_html,../more/tidy_js",function(tidy_css,tidy_html,tidy_js){
    return function( flow ){
        var matchAll = /<pre(?:.)+?class\s*=\s*([\'\"])\s*brush\b(?:.|\n|\r)+?\1\s*>(?:.|\n|\r)+?<\/pre>/gi
        var matchOne = /<pre class="brush:(\w+)(?:[^"]+)">((?:.|\n|\r)+?)<\/pre>/i
        flow.bind('cache_page', function( html, url ){
           // $.log( "已进入cache_page栏截器" );
            var buffer = []
            html = html.replace(matchAll, function(ss){
                var match = ss.match(matchOne)
                var type = match[1];
                var context = match[2];
                switch(type){
                    case "javascript":
                    case "js":
                        context = tidy_js(context);
                        break;
                    case "html":
                    case "xml":
                        context = tidy_html(context);
                        break;
                    case "css":
                        context = tidy_css(context);
                        break;
                }
                buffer.push( context )
                return '<pre class="brush:'+type+';gutter:false;toolbar:false">mass_mass</pre>'
            });
            html = tidy_html(html);
            var index = 0
            html = html.replace(/mass_mass/g, function(s){
                return "\n"+buffer[index++]+"\n"
            });
            var cache = {
                code: 200,
                data: html,
                type: this.content_type("html")
            }
            if( $.configs.write_page ){
                $.writeFile( $.path.join("app","pages", url ) , html )
            }
            $.pagesCache[ url ] = cache;
            this.fire("send_file", cache)
        })
    }
});
