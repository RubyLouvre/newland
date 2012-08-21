$.define("system","hfs, more/mapper, hfs, controller, ../app/config", function(){
    var libs = "mass,lang_fix,lang,support,class,node,query,data,node,css_fix,css,event_fix,event,attr,flow,ajax,fx"
    var files = [];
    $.mix({
        pagesCache: {}, //用于保存静态页面,可能是临时拼装出来的
        viewsCache: {}, //用于保存模板函数
        staticCache: {}, //用于保存静态资源,
        controllers: {}  //用于保存控制器,
    });
    //==================================================================================
    //==================================================================================
    //==================================================================================
    //注意：下面这些代码都是与newland项目无关，它们是用于同步rubylouvre.github.com项目的JS文件
    var more = $.config.third_modules
    more.replace($.rword, function( name ){
        var path = $.path.join( __dirname,"mass/more", name + ".js" );
        var text = $.readFileSync( path, "utf-8");
        var rubylouvre = $.path.join( "D:/rubylouvre/scripts/more",name+ ".js")
        $.updateFile( rubylouvre, path, function(){
            //  $.log(rubylouvre+" 更新成功");
            });
        $.writeFile( $.path.join( "app/public/scripts/more", name+ ".js" ), text )
    });
    
    $.updateFile( $.path.join( __dirname, "mass", "lang.js" ), $.path.join( __dirname, "lang.js" ) );
    //用mass Framework的所有核心模块合并成mass_merge.js文件
    libs.replace($.rword, function( name, url ){
        try{
            if(name == "lang"){
                url =  $.path.join( __dirname, name +".js" );
            }else{
                url = $.path.join( __dirname,"mass", name +".js" );
            }
          
            var text = $.readFileSync( url, "utf-8");
            var rubylouvre = url.replace(/\\/g,"/").replace("newland/system/mass","rubylouvre/scripts");
            $.updateFile( rubylouvre, text, function(){
                $.log(rubylouvre+" 更新成功", "> 5");
            }, 1);
            files.push( text )
            $.updateFile( $.path.join( "app/public/scripts/", name +".js" ), text, $.noop, 1 );

        }catch(e){
            $.log( e + "  "+url, "red", ">= 2");
        }
    });

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
    var merge_url = "app/public/scripts/mass_merge.js"
    $.writeFile( merge_url, replaced, function(e){//生成新的js文件！
        if(e) {
            $.log("合并出错 "+e ,"red", "> 6");
        }else{
            $.updateFile(  "D:/rubylouvre/scripts/mass_merge.js", replaced, function(){
                $.log("mass_merge.js 合并成功", "> 6");
            },1);
        }
    })
//到这里为止的代码都与newland项目无关，它们是用于同步rubylouvre.github.com项目的JS文件
//http://www.elmerzhang.com/2011/09/nodejs-module-develop-publish/
//==================================================================
})

