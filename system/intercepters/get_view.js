$.define("get_view", function(){
    return function( flow ){
        flow.bind("get_view", function( view_url, url ){
            $.log( "已进入 get_view 栏截器" );
            var fn = $.viewsCache[ view_url ]
            if( fn ){
                var data = this.helper[0];
                var html = fn( data, this.helper[1]);

                if(typeof data.layout == "string"){
                    data.partial = html;
                    var layout_url = $.path.join("app","views/layout", data.layout );
                    this.fire("get_layout", layout_url, url );
                }else{
                    this.fire('cache_page', html, url)
                }
            }else{
                $.readFile( view_url,  'utf-8', function(err, text){
                    if(err){
                        this.fire( "send_error", 404 )
                    }else{
                        $.viewsCache[ view_url ] = $.ejs( text );
                        this.fire( "get_view", view_url, url );
                    }
                }.bind(this) );
            }
        })

    }
})

