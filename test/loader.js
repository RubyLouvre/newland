$.define("loader","path,../system/hfs", function(path){
    $.log('<code style="color:cyan;">本模块是用于测试加载器的</code>', true);
    $.writeFileSync(  "ddd.js" , '$.define("ddd", function(){console.log("这是newland/ddd模块") })')
    $.require.root += "/test"
    $.require("aaa", function(){
        $.log('<code style="color:green;">require("aaa")</code>', true);
    });
    $.require("./aaa", function(){
        $.log('<code style="color:green;">require("./aaa")</code>', true);
    });
    $.require("bbb", function(){
        $.log('<code style="color:green;">require("bbb")</code>', true);
    });
    $.require("bbb.js", function(){
        $.log('<code style="color:green;">require("bbb.js")</code>', true);
    });
    $.require("./bbb.js", function(){
        $.log('<code style="color:green;">require("./bbb.js")</code>', true);
    });
    $.require("ddd", function(){
        $.log('<code style="color:green;">require("ddd.js")</code>', true);
    });
})
