
var http = require("http")
console.log("xxxxxxxxx")
http.get("http://127.0.0.1:5984/", function(res) {
  console.log("Got response: " + res.statusCode);
  console.log(res)
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});