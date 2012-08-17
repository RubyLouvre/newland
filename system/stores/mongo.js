$.define("mongodb","mongodb", function(mongodb){
    var config = $.configs.session;
    var hoder
    var server = new mongodb.Server(config.host, config.port, {});
   
    var store = function(sid, life){
        this.sid = sid;
        this.life = life;
        var that = this;
        new mongodb.Db(config.db, server, {}).open(function (e, db) {
            db.collection(config.table,function(err, session){
                that.data = session
            })
        });
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

