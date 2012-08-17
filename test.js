var mongodb = require('mongodb'),
server = new mongodb.Server("127.0.0.1", 27017, {});
var life = 60* 60 * 24;
new mongodb.Db('test', server, {}).open(function (e, db) {
    db.collection("dogs", function(e,table){
        table.findAndModify ({
            sid: "rubylouvre",
            life: life
        },[],{
            $set:{
                timestamp: new Date * 1 * life
            }
        },{
            safe:true,
            "new":true,
            upsert: true
        }, function(e, a){
            console.log(e)
            console.log(a)
        })
    })
})



