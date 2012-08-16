var mongodb = require('mongodb'),
server = new mongodb.Server("127.0.0.1", 27017, {});
new mongodb.Db('test', server, {}).open(function (error, db) {
    db.collection("users", function(err, users){
        //当update是替换操作时,即第个参数没有操作符,那么第三个可选对象即使集团了multi为true,它也每次替换一个
        users.findAndModify({
            safe:true
        },[],{
            $unset:{safe:1}
        },
        {
            safe:true
        }, function(err, ee){
            console.log(ee)
            users.find().toArray(function(e, items){
                console.log(items)
            })
        })
    })
});