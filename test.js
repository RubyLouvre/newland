var mongodb = require('mongodb'),
server = new mongodb.Server("127.0.0.1", 27017, {});
new mongodb.Db('test', server, {}).open(function (error, db) {
    db.collection("users", function(err, users){
        //当update是替换操作时,即第个参数没有操作符,那么第三个可选对象即使集团了multi为true,它也每次替换一个
//        users.insert([{
//            bbb:1
//        },{
//            aaa:2,
//            ccc:"xxx"
//        }], {
//            safe:true
//        }, function(){
           //相当于 users.find( "this.aaa % 2 == 1")
            users.find({aaa:{$mod:[2, 1]}} ).toArray(function(e, items){
                console.log(items)//{aaa:1,_id:xxxxx},{aaa:3,_id:xxxxx}
            })
        })
 //   })
});
