define( "./helper,./more/tidy, $hfs, $ejs".match($.rword),function( helper, tidy ){
    var url = $.path.join( process.cwd(),"app/views/mvvm"),layouts = {};
    var fs = require("fs")
    $.walk(url, function(files){
        var pending = files.length;
        for(var i = 0; i < pending; i++){
            (function(view_url){
              
                $.readFile(view_url,"utf-8", function(e, source){
                    var data = $.ejs.data = {
                        links: [],
                        scripts: []
                    }
                    var fn = $.ejs.compile(source, helper);
                    var html = fn(data);
                    if( typeof data.layout == "string" ){//如果它需要布局模板
                        data.partial = html;
                        var layout = data.layout;
                        html = layouts[layout]
                        if( !html ){
                            try{
                                var layout_url =  $.path.join( process.cwd(),"app/views/layout", data.layout);
                                html =  $.readFileSync( layout_url , "utf-8");
                                layouts[layout] = html;
                            }catch(e){
                                $.log("找不到必需的布局模板: " + layout_url, "red", 3);
                            }
                        }
                        fn = $.ejs.compile(html, helper);
                        html = fn(data);
                        html = tidy(html)
                    }
                    if(html){//必须确保其有内容
                        var page_url = view_url.replace("/views","/pages").replace(/\.xhtml$/,".html")
                       fs.unlink(view_url.replace("/views","/pages"))
                        if(page_url !== view_url){
                            
                            $.updateFile(page_url, html, function(){
                                $.log(page_url+"  同步完成")
                            },1);
                        }
                        //同步到rubylouvre项目
                        fs.unlink(view_url.replace("/app/views","").replace("newland","rubylouvre"))
                        var rubylouvre = view_url.replace("/app/views","").replace("newland","rubylouvre").replace(/\.xhtml$/,".html")
                        //   console.log(rubylouvre)
                        $.updateFile(rubylouvre, html, function(){
                            $.log(rubylouvre+"  同步完成","green", 7);
                        },1);
                    }
                });
            })( files[i].replace(/\\/g,"/") );//要处理路径时必须先统一path.sep,因为你不知它是/,还是\

        }
    })
})