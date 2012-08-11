$.define("page_generate","helper,more/ejs,hfs",function(get_hepler){

    var url = "D:/newland/app/views/doc/event"
    var layouts = {};

    $.walk(url, function(files){
        var pending = files.length;
        for(var i = 0; i < pending; i++){
            (function(view_url){
           
                var array = get_hepler();
                $.readFile(view_url,"utf-8", function(e, source){
                  
                    var data = array[0]
                    var fn = $.ejs.compile(source, array[1]);
                    var html = fn(data);
                     
                    data.partial =  fn();
                    var layout = data.layout;
                    if( layout ){//如果它需要布局模板
                        html = layouts[layout]
                        if( !html ){
                            try{
                                var layout_url =  $.path.join("D:/newland/app/views/layout", data.layout);
                                html =  $.readFileSync( layout_url , "utf-8");
                                layouts[layout] = html;
                            }catch(e){
                                $.log('<code style="color:red;">找不到必需的布局模板: ', layout_url, '</code>', true);
                            }
                        }
                      
                        fn = $.ejs.compile(html,array[1]);
                        html = fn(data);
                    }
                    if(html){//必须确保其有内容
                        var page_url = view_url.replace("\\views","\\pages");
                        $.updateFile(page_url, html, function(){
                            $.log(page_url+"  同步完成")
                        },1);
                        //同步到rubylouvre项目
                        var rubylouvre = view_url.replace("\\newland\\app\\views","\\rubylouvre")
                        $.updateFile(rubylouvre, html, function(){
                            $.log(rubylouvre+"  同步完成");
                        },1);
                    }
                });
            })( files[i].replace(/\//g,"\\") );//要处理路径时必须先统一path.sep,因为你不知它是/,还是\

        }
    })
})