$.define("memory_store","../more/uuid",function(){
    var store = $.memory
    function sweep (){//清理过期的session
        var now = +new Date;
        for (var key in store) {
            if (store[key].timestamp < now){
                delete store[key];
            }
        }
    }
    // 每 24 分钟执行一次
    setInterval(sweep, 1440 * 1000);
    getSession = function(sid, life){
        if(store[sid])
            return store[sid]
        return new memory (sid, life)
    }
    function memory (sid, life) {
        this._sid = sid || uuid()
        this._life = life;
        this._store = store[sid] = store[sid] || {
            data: {}
        };
        this._store.timestamp = new Date + life;
    };
    //为一个用户分配一个新的session
    memory.prototype = {
        get: function(key){
            return this._store.data[key];
        },
        set: function (key, val){
            this._store.data[key] = val;
            //每次都延长一段时间
            this._store.timestamp = +new Date + this._life;
        },
        remove: function (key){
            delete this._store.data[key];
            this._store.timestamp = +new Date + this._life;
        },
        destroy: function (){
            delete this._store;
            delete store[this._sid];
        }
    }
    return memory

})
