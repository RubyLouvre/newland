var mongo  = require('mongodb');
var db = new mongo.Db("northwind", new mongo.Server('localhost', 27017, {}), {});

db.open(function() {
    db.collection("posts", function(err, posts) {

        posts.find().toArray(function(e, cursor){
            cursor.forEach(function(el){
                console.log(el._id.generationTime)
                console.log("created at " + new Date(el._id.generationTime) + "\n")
            })



        })
       
    })

});
