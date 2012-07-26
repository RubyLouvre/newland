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
            var page_url = $.path.join("app","pages", url );
            // $.writeFile(pages_url, html )
            $.pagesCache[ url ] = cache;
            this.fire("send_file", cache)
        })
    }
})


