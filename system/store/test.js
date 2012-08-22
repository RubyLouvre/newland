require("./mass")
console.log("xxxxxxxxxxxxx")
$.require("./queue",function(queue){
   var a = new queue;
   console.log(a.length)
})