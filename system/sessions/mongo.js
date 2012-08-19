$.define("mongo","mongodb", function(mongodb){

    $.dbs = $.dbs || {};
    var c = $.config.db;

    var read = function(e, col){
        //从数据库中取得一个文档，从于让用户通过Store实例直接同步操作它
        var flow = this;
        flow.bind("get_cookie", function( ){
            var s = $.config.session
            var sid = flow.cookies[ s.sid ] || flow.uuid()//从cookie中取得键
            col.find({
                sid: sid
            }).toArray(function(e, docs){
                if(!docs.length){//不存在就新建一个键
                    sid = flow.uuid()
                    col.insert({
                        sid: sid,
                        life: s.life,
                        data: {}
                    },{
                        safe: true
                    }, write.bind([flow, sid, col, s ]))
                }else{
                    write.call([flow, sid, col, s ], e, docs)
                }
            })
        })
    }

    var write = function(e, docs){
        var array = this;
        var flow = array[0];
        var sid  = array[1]
        var collection  = array[2]
        var s  = array[3]
        flow.session.open( s.life, docs[0].data );
        flow.addCookie( s.sid, sid );
        flow.bind("header", function(){
            collection.findAndModify ({
                sid:  sid
            }, {
                life: flow.session.life,
                data: flow.session.data
            }, {
                safe: true
            },function(err, doc){
                console.log([err,doc])
            })
        })
    }

    return function(flow){
        if(! $.dbs[ c.name ]){
            $.dbs[ c.name  ] = 1;//临时处理
            var server = new mongodb.Server( c.host, c.port, {});
            new mongodb.Db( c.name, server, {}).open(function (e, db) {
                //新建或打开目标集合
                $.dbs[ c.name ] = db;//正式处理
                $.dbs[ c.name ].collection( $.config.session.table, read.bind(flow))
            });
        }else{
            $.dbs[ c.name ].collection( $.config.session.table, read.bind(flow))
        }
    }

})

