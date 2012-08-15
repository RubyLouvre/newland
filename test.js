var mongodb = require('mongodb'),
server = new mongodb.Server("127.0.0.1", 27017, {});
new mongodb.Db('test', server, {}).open(function (error, db) {
    db.collection("users", function(err, users){
       users.save({user:"David"},{safe:true}, function(){
           users.find().toArray(function(e, items){
               console.log(items)
           })
       })
    })
});