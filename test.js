var mongodb = require('mongodb'),
server = new mongodb.Server("127.0.0.1", 27017, {});
new mongodb.Db('test', server, {}).open(function (error, db) {
    db.collection("dogs",function(err,dogs){

        dogs.insert({
            "day":"2010/10/03",
            "time":"10/3/2010 03:57:01 GMT-400",
            "price":4.23
        }  ,

        {
            "day":"2010/10/04",
            "time":"10/4/2010 11:28:34 GMT-400",
            "price":4.27
        }  ,

        {
            "day":"2010/10/03",
            "time":"10/3/2010 05:00:51 GMT-400",
            "price":4.10
        }  ,

        {
            "day":"2010/10/06",
            "time":"10/6/2010 05:27:22 GMT-400",
            "price":4.30
        } ,

        {
            "day":"2010/10/04",
            "time":"10/4/2010 08:24:58 GMT-400",
            "price":4.01
        }  ,{
            safe:true
        },function(){
          var a =  db.runCommand({
                "group":{
                    "ns":"stocks",
                    "key":"day",
                    "initial":{
                        "time":0
                    },
                    "$reduce":function(doc,prev){
                        if(doc.time>prev.time){
                            prev.price=doc.price;
                            prev.time=doc.time;
                        }
                    }
                    }
                });
                console.log(a)

        })
          

    })
});


