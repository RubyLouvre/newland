$.define("cache_page","../more/tidy_html", function(tidy){
    return function( flow ){
        flow.bind('cache_page', function( html, url ){
            $.log( "已进入 cache_page 栏截器" );
            html = tidy(html);
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


