var mongodb = require('mongodb'),
server = new mongodb.Server("127.0.0.1", 27017, {});
new mongodb.Db('userdb', server, {}).open(function (error, db) {
    db.collection("users",function(err,users){
        users.remove ({
            a:{
                $lt : 6
            }
        },{
            safe:true
        },function(e){
             users.find().toArray(function(e, els){
                  console.log(els)
             })//看还剩下多少个
        })
    })
});
