$.define("mongodb","mongodb", function(mongodb){
    var config = $.configs.session;
    var server = new mongodb.Server(config.host, config.port, {});
    var store = function(sid, life, flow){
        this.sid = sid;
        this.life = life;
        if(!this._init){
            var that = this;
            //新建或打开目标数据库
            new mongodb.Db(config.db, server, {}).open(function (e, db) {
                //新建或打开目标集合
                db.collection(config.table,function(e, session){
                    that.data = session
                    session.find({
                        sid: sid
                    }).toArray(function(e, docs){
                        if(!docs.length){//如果指定sessionID不存在,随机生成一个新的
                            that.sid = flow.uuid();
                        }
                        that._init = true;
                        //set,get,remove,clear等事件必须在open操作之后才能执行!
                        String("set,get,remove,clear").replace($.rword, function(event){
                            that.bind(event+"_session_"+flow.id+",open_session_"+flow.id, that[event]);
                        });
                        flow.fire("open_session_"+flow.id, that);
                    })
                })
            });
        }
    }
    var options = {
        safe:true,
        "new":true,
        upsert: true
    }
    var make = function( update, callback){
        callback = callback || $.noop;
        this.data.findAndModify ({
            sid:  this.sid,
            life: this.life
        },[],update,options).toArray(function(err, docs){
            if(err){
                callback(err)
            }else{
                callback(err,docs[0])
            }
        })
    }

    store.prototype = {
        //插入或更新数据
        set: function(key, value, callback, get){
            var set = {
                timestamp: new Date * 1 + this.life
            }
            if(get !== true){
                set[ key ] = value;
            }
            make.call( this, {
                $set: set
            }, callback );
        },
        //读取数据
        get: function( key, callback){
            this.set(null, null, function(doc){
                var fn = callback || $.noop;
                fn(doc[key])
            },true);
        },
        //移除某一数据
        remove: function ( key, callback){
            make.call(this, {
                $unset:key,
                $set:{
                    timestamp: new Date * 1 + this._life
                }
            }, callback );
        },
        //删掉这个文档对象
        clear: function(callback){
            callback = callback || $.noop;
            this.data.remove ({
                sid: this.sid
            },options, callback)
        }
    }
   
})

