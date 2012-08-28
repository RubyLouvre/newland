define( [ "$hfs"], function(){
    //,class,node,query,data,node,css_fix,css,event_fix,event,attr,flow,ajax,fx
    var libs = "mass,lang_fix,lang,support,class,node,query,data,node,css_fix,css,event_fix,event,attr,flow,ajax,fx"
    var files = [];

    //注意：下面这些代码都是与newland项目无关，它们是用于同步rubylouvre.github.com项目的JS文件
    //    var more = $.config.third_modules
    //    more.replace($.rword, function( name ){
    //        var path = $.path.join( __dirname,"mass/more", name + ".js" );
    //        var text = $.readFileSync( path, "utf-8");
    //        var rubylouvre = $.path.join( "D:/rubylouvre/scripts/more",name+ ".js")
    //        $.updateFile( rubylouvre, path, function(){
    //            //  $.log(rubylouvre+" 更新成功");
    //            });
    //        $.writeFile( $.path.join( "app/public/scripts/more", name+ ".js" ), text )
    //    });
    //
    //    $.updateFile( $.path.join( __dirname, "mass", "lang.js" ), $.path.join( __dirname, "lang.js" ) );
    //用mass Framework的所有核心模块合并成mass_merge.js文件
    libs.replace($.rword, function( name, url ){
        try{

            url = $.path.join( __dirname,"mass", name +".js" );
          
            var text = $.readFileSync( url, "utf-8");
            var rubylouvre = url.replace(/\\/g,"/").replace("newland/system/mass","rubylouvre/scripts");
            //            $.updateFile( rubylouvre, text, function(){
            //                $.log(rubylouvre+" 更新成功", 5);
            //            }, 1);
            files.push( text )
        //  $.updateFile( $.path.join( "app/public/scripts/", name +".js" ), text, $.noop, 1 );

        }catch(e){
            $.log( e + "  "+url, "red", 3);
        }
    });

    var merge = function(){
        var define = function(a){
            if(typeof a == "string" && a.indexOf($.core.base) == -1 ){
                arguments[0] = $.core.base + a +".js"
            }
            return $.define.apply($, arguments)
        }
        var __core__ =  "@@@@@".match(/\w+/g)
        for( var c = 0, cn ; cn = __core__[c++];){
            if(cn !== "mass"){
                Module.update($.core.base + cn + ".js", 0, 2);
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
    replaced = first.replace("/*combine modules*/", replaced+"\r\n" ).replace(rcomments,"");
    //console.log(replaced)
    var merge_url = "app/public/scripts/mass_merge.js"
    $.writeFile( merge_url, replaced, function(e){//生成新的js文件！
        if(e) {
            $.log("合并出错 "+e ,"red", 3);
        }else{
            $.log("merge.js 合并成功","green", 7);
            $.updateFile(  "D:/2012/trunk/mass_merge.js", replaced, function(){
                $.log("merge.js 更新成功","green", 7);
            },1);
        }
    })
//到这里为止的代码都与newland项目无关，它们是用于同步rubylouvre.github.com项目的JS文件
//http://www.elmerzhang.com/2011/09/nodejs-module-develop-publish/
//==================================================================
})

