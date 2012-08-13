var mongo  = require('mongodb');
var db = new mongo.Db("northwind", new mongo.Server('localhost', 27017, {}), {});

db.open(function() {
    // 打开名为products的表
    db.collection("animal", function(err, person) {
        // select * from products 相当于db.products.find()
    
    
        //     console.log(person.count())
        person.insert({
            "name":"444",
            "age":30
        })
        person.insert({
            "name":"555",
            "age":40
        })
        var cursor = person.find({
            "age":30
        })
        console.log(cursor)
    //        person.insert({
    //            "name":"222"
    //        })
    //        person.insert({
    //            "name":"333"
    //        })
    // console.log(db.collectionNames(function(e,a){
    //   console.log(e);
    //   console.log("++++++++++")
    //   console.log(a)
    //  }))
    // console.log("================")
    //  console.log(person.find())
    });
});
