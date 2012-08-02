$.define("system","hfs,more/mapper, hfs, controller, ../app/configs", function(){
    var libs = "mass,lang_fix,lang,support,class,node,query,data,node,css_fix,css,event_fix,event,attr,flow,ajax,fx"
    var files = [];
    $.mix({
        pagesCache: {}, //用于保存静态页面,可能是临时拼装出来的
        viewsCache: {}, //用于保存模板函数
        staticCache: {}, //用于保存静态资源,
        controllers: {}  //用于保存控制器,
    });
    //=====================添加测试的主体文件=====================
    var more = "spec,random,menu"
    more.replace($.rword, function( name ){
        var path = $.path.join( __dirname,"more", name + ".js" );
        var text = $.readFileSync( path, "utf-8")
        $.writeFile( $.path.join( "app/public/scripts/more", name+ ".js" ), text )
    })


    libs.replace($.rword, function( name ){
        try{
            var url =  $.path.join( __dirname, name +".js" );
            var text = $.readFileSync( url, "utf-8")
            files.push(text)
            //   $.log("合并"+name+"模块")
            $.writeFile( $.path.join( "app/public/scripts/", name +".js" ), text )
        }catch(e){
            $.log(e);
            $.log(url)
        }
    });
    //有用的部分是body
    var merge = function(){
        var module_value = {
            state: 2
        };
        var __core__ =  "@@@@@".match(/\w+/g)
        for(var i = 0, n ; n = __core__[i++];){
            if(n !== "mass"){
                modules["@"+n] = module_value;
            }
        }
    }
    var first = files.shift();
    var rbody = /[^{]*\{([\d\D]*)\}$/;
    var rcomments = /\/\*\*([\s\S]+?)\*\//g;
    var replaced = merge.toString()
    .replace(rbody, '$1')
    .replace(/^\s*|\s*$/g, '')
    .replace("@@@@@",libs);
    replaced = replaced + files.join("\n")
    replaced = first.replace("/*combine modules*/", replaced ).replace(rcomments,"");
    //开始合并
    $.writeFile("app/public/scripts/mass_merge.js", replaced,"utf8",function(e){//生成新的js文件！
        if(e) {
            console.log("出错了 "+e);
        }else{
            console.log("合并成功")
        }
    })
})

