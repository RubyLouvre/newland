$.define("page_generate","helper,ejs,hfs",function(get_hepler){

    var url = "D:/newland.git/trunk/app/views/doc/query"
    var layouts = {};

    $.walk(url, function(files){
        var pending = files.length;
        for(var i = 0; i < pending; i++){
            var view_url = files[i]
            $.readFile(view_url,"utf-8", function(e, source){
                var array = get_hepler();
                var data = array[0]
                var fn = $.ejs.compile(source, array[1]);
              //  console.log(fn()+"")
                data.partial =  fn();
                var layout = data.layout;
                var html = layouts[layout]
                if( !html ){
                    var page_url =  $.path.join("D:/newland.git/trunk/app/views/layout", data.layout);
                   // console.log(page_url)
                    html =  $.readFileSync( page_url , "utf-8");
                    layouts[layout] = html
                }
                fn = $.ejs.compile(html,array[1]);
                var ret = fn(data);
               $.update()
                console.log(ret)
                console.log("==========================")
               // console.log(pending)
            })
        }
    })
})