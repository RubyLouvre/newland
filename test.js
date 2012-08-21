var util = require("util")
var a = ['%s:%s', 'foo', 'bar', 'baz']
var e = util.format.apply(0,a);
console.log("=======")
console.log(e)