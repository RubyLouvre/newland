var mongo  = require('mongodb');
var db = new mongo.Db("northwind", new mongo.Server('localhost', 27017, {}), {});

db.open(function() {
    db.collection("posts", function(err, posts) {
        posts.drop(function(){
            console.log("xxxxxxxxxx")
        })
//        db.posts.count({},function(e,a){
//            console.log(a)
//        })
    })
//    db.collection("posts", function(err, posts) {
//        posts.insert([{
//            aaa:1
//        },{
//            bbb:2
//        },{
//            ccc:3
//        }],function(){
//            posts.find({}, function(e, cursor){
//                cursor.nextObject(function(){
//                    console.log(cursor.items)
//                })
//            })
//        })
     

//  });
});
