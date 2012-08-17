$.define("mongodb","mongodb", function(mongodb){
    var config = $.configs.session;
    var server = new mongodb.Server(config.host, config.port, {});
    var store = function(sid, life, flow){
        this._id = sid;
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
                        String("set,get,remove,clear").replace($.rword, function(event){
                            that.bind(event+"_session_"+flow._id, that[event]);
                        });
                        flow.fire("open_session_"+flow._id, that);
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
    store.prototype = {
        set: function(key, value, callback){
            callback = callback || $.noop;
            var set = {
                timestamp: new Date * 1 + this._life
            }
            set[ key ] = value;
            this.data.findAndModify ({
                sid:  this.sid,
                life: this.life
            },[],{
                $set:set
            },options).toArray(callback)
        },
        get: function(key, callback){
            callback = callback || $.noop;
            var set = {
                timestamp: new Date * 1 + this._life
            }
            this.data.findAndModify ({
                sid:  this.sid,
                life: this.life
            },[],{
                $set:set
            }, options).toArray(function(err, docs){
                if(err){
                    callback(err)
                }else{
                    callback(err,docs[0][key])
                }
            })
        },
        remove: function (key, callback){
            callback = callback || $.noop;
            this.data.findAndModify ({
                sid:  this.sid,
                life: this.life
            },[],{
                $unset:key,
                $set:{
                    timestamp: new Date * 1 + this._life
                }
            }, options).toArray(function(err, docs){
                if(err){
                    callback(err)
                }else{
                    callback(err, !(key in docs[0]))
                }
            })
        },
        clear: function(callback){
            callback = callback || $.noop;
            this.data.remove ({
                sid:this.sid
            },options,callback)
        }
    }
   
})

