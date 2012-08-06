$.define("page_generate","helper,ejs,hfs",function(get_hepler){

    var url = "D:/newland/app/views/doc/query"
    var layouts = {};

    $.walk(url, function(files){
        var pending = files.length;
        for(var i = 0; i < pending; i++){
            (function(view_url){
           
                var array = get_hepler();
                $.readFile(view_url,"utf-8", function(e, source){
                  
                    var data = array[0]
                    var fn = $.ejs.compile(source, array[1]);
                    //  console.log(fn()+"")
                    data.partial =  fn();
                    var layout = data.layout;
                    var html = layouts[layout]
                    if( !html ){
                        var layout_url =  $.path.join("D:/newland/app/views/layout", data.layout);
                        html =  $.readFileSync( layout_url , "utf-8");
                        layouts[layout] = html
                    }
                    fn = $.ejs.compile(html,array[1]);
                  
                    var ret = fn(data);
                    console.log(view_url+"!!!!!!!!!!!")
                    var page_url = view_url.replace("views","pages");
                    $.updateFile(page_url, ret,function(){
                        $.log(page_url+"================");
                    },1)
                    var rubylouvre = view_url.replace("D:/newland/app/views","D:/rubylouvre/")
                    $.updateFile(rubylouvre, ret, function(){
                        $.log(rubylouvre);
                    },1);
                })
            })( files[i].replace(/\\/,"/") )

        }
    })
})