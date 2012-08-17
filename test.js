var mongodb = require('mongodb'),
server = new mongodb.Server("127.0.0.1", 27017, {});
new mongodb.Db('test', server, {}).open(function (e, db) {
  db.removeUser("aaa",{safe: true}, function(e,ok){
      console.log(e);
      console.log(ok)//true
  })
});


