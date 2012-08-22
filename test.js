var $ = require("./nstore/mass").$
$.require("system/hfs",function(){
    var e = $.path.join(process.cwd(),"/log/master.log");
    console.log(e)
    $.writeFile(e,"ttttt",function(){
        console.log("xxxxxxxxxx")
    })
})
