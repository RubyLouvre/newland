$.define("mongo","mongodb", function(mongodb){
    //从数据库中取得一个文档{mtime:mtime,data:data} ，当中的data就是flow.session
    var read = function(e, col){
        $.log('<code style="color:cyan;">开始在存放session的集合中寻找目标文档</code>', true);
        var flow = this;
        var s = $.config.session
        var sid = flow.cookies[ s.sid ] || flow.uuid()//从cookie中取得键
        col.find({
            sid: sid
        }).toArray(function(e, docs){
            if(!docs.length){//不存在就新建一个键
                sid = flow.uuid();
                $.log('<code style="color:cyan;">不存在就创建一个新的</code>', true);
                col.insert({
                    sid: sid,
                    data: {}
                },{
                    safe: true
                }, function(e, docs){
                    write( col, docs[0], flow, sid, s )
                })
            }else{
                $.log('<code style="color:cyan;">继续使用原先的文档</code>', true);
                write( col, docs[0], flow, sid, s )
            }
        })
    }

    var write = function( col, doc, flow, sid, s){
        flow.addCookie( s.sid, sid );
        console.log("进入action等待关闭")
        flow.bind("end", function(){
            col.findAndModify ({
                sid:  sid
            },[], {
                $set: {
                    mtime: Date.now() + s.life,
                    data: flow.store.data
                }
            }, {
                "new":true,
                safe: true
            },function(err, doc){
                console.log("调整完成")
                console.log([err,doc])
            })
        })
        flow.store.open( s.life, doc.data );
    }

    return function(flow){
        $.dbs = $.dbs || {};
        var c = $.config.db;
        if(! $.dbs[ c.name ]){
            $.log('<code style="color:cyan;">第一次连上mongo数据库</code>', true);
            $.dbs[ c.name  ] = 1;//临时处理
            var server = new mongodb.Server( c.host, c.port, {});
            new mongodb.Db( c.name, server, {}).open(function (e, db) {
                //新建或打开目标集合
                $.dbs[ c.name ] = db;//正式处理
                //  db.dropCollection(c.name)
                $.dbs[ c.name ].collection( $.config.session.table, read.bind(flow))
            });
        }else{
            $.dbs[ c.name ].collection( $.config.session.table, read.bind(flow))
        }
    }

})

