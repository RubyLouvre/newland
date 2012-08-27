define( [ "$hfs" ], function(){
    var levels = {
        // System is unusable.
        EMERGENCY : 0,
        // Action must be taken immediately.
        ALERT: 1,
        // Critical condition.
        CRITICAL: 2,
        //Error condition.
        ERROR: 3,
        // Warning condition.
        WARNING: 4,
        // Normal but significant condition.
        NOTICE: 5,
        // Purely informational message.
        INFO: 6,
        //Application debug messages.
        DEBUG: 7
    }
    var mapper = {}
    for(var i in levels){
        mapper[levels[i]] = i
    }
    function Log(level,file){
        if ('string' == typeof level) level = levels[level.toUpperCase()];
        this.level = level || levels.DEBUG;
        this.file = file;
        this.stream = [];
    };
    var EOL = $.isWindows? "\r\n" :"\n"
    Log.prototype = {
        write: function(level, msg) {
            if (level == 10 || level <= this.level) {
                var str =  '[' + $.timestamp() + ']'
                + ' ' + (mapper[level] || "DEBUG")
                + ' ' + msg
                + EOL
                this.stream.push( str );
                if(!this.lock){
                    this._write()
                }
            }
        },
        _write: function(){
            var self = this;
            self.lock = true;
            $.writeFile(this.file, this.stream.shift() ,"utf-8","append",function(){
                if(self.stream.length){
                    self._write()
                }else{
                    self.lock = false;
                }
            })
        }
    }
    $.logger = new Log($.log.level, $.config.logfile);
    return Log;
});

//	<ul>
/*
<li>0 <strong>EMERGENCY</strong> system is unusable</li>
<li>1 <strong>ALERT</strong> action must be taken immediately</li>
<li>2 <strong>CRITICAL</strong> the system is in critical condition</li>
<li>3 <strong>ERROR</strong> error condition</li>
<li>4 <strong>WARNING</strong> warning condition</li>
<li>5 <strong>NOTICE</strong> a normal but significant condition</li>
<li>6 <strong>INFO</strong> a purely informational message</li>
<li>7 <strong>DEBUG</strong> messages to debug an application</li>
</ul>
*/
//}