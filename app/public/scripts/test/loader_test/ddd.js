define(["./aaa","./bbb","./ccc","./fff"],function(a,b,c,f){
    exports.ddd = "这是node.js的ddd模块"
    console.log("已加载ddd模块")
    console.log(a+" "+b+JSON.stringify(c)+JSON.stringify(f))
})

