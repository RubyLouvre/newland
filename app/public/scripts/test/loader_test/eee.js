exports.eee = "这是node.js的eee模块"
console.log("已加载eee模块")
require("./more/ggg",function(){
    console.log("这是ggg模块加载后的同步回调")
})