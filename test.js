var mongo  = require('mongodb');
var db = new mongo.Db("northwind", new mongo.Server('localhost', 27017, {}), {});
db.open(function() {
    db.collection("users",function(err, users){
        users.update({
            array1:{$exists : true }
        },{//移除第一个
            $rename:{
                array1: "array4"
            }
        },true,function(err){
            users.find().toArray(function(e, els){
                els.forEach(function(el){
                    console.log(el)
                });
            });
        })
    
    })
})