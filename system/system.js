$.define("system","hfs,more/mapper, hfs, controller, ../app/configs", function(){
    var libs = "mass,lang,lang_fix,support,class,node,query,data,css,css_fix,event,event_fix,attr,flow,ajax"
    var files = []
    libs.replace($.rword, function( name ){
        try{
            var url =  $.path.join( __dirname, name +".js" );
            var text = $.readFileSync( url, "utf-8")
            files.push(text)
         //   $.log("合并"+name+"模块")
           //$.writeFile( $.path.join( "app/public/scripts/", name +".js" ), text )
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

