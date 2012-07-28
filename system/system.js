$.define("system","hfs,more/mapper, hfs, controller, ../app/configs", function(){
    var libs = "mass,lang,lang_fix,support,class,node,query,css,css_fix,event,event_fix,attr,flow,ajax"
    var files = []
    libs.replace($.rword, function( name ){
        try{
            var url =  $.path.join( __dirname, name +".js" );
            var text = $.readFileSync( url, "utf-8")
            files.push(text)
            console.log("合并"+name+"模块")
        //$.writeFile( $.path.join( "app/public/scripts/", name +".js" ), text )
        }catch(e){
            console.log(e);
            console.log(url)
        }
    });
    var merge = function(){
        var module_value = {
            state: 2
        }
        "@@@@@".match($.rword, function(name){
            if(name !== "mass")
                mapper["@"+name] = module_value;
        });
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
    
    $.writeFile("app/public/scripts/mass_merge.js", replaced,"utf8",function(e){//生成新的js文件！
        if(e) {
            console.log("出错了 "+e);
        }else{
            console.log("合并成功")
        }
    })
})

