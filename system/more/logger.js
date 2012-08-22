$.define("logger", "../hfs,../../app/config",function(){
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
    function Log(level,stream){
        if ('string' == typeof level) level = levels[level.toUpperCase()];
        this.level = level || levels.DEBUG;
        this.stream = stream || process.stdout;
        if (this.stream.readable) this.read();
    };
    var EOL = $.isWindows? "\r\n" :"\n"
    Log.prototype = {
        write: function(level, msg) {
            if (level == 10 || level <= this.level) {
                console.log(msg)
                this.stream.write(
                    '[' + $.timestamp() + ']'
                    + ' ' + mapper[level] || "DEBUG"
                    + ' ' + msg
                    + EOL );
            }
        }
    }
    $.logger = new Log($.log.level, $.createWriteStream( $.config.logfile, {
        flags: 'a',
        encoding:"utf-8"
    }));
    return Log;

});
//https://github.com/joyent/node/wiki/modules#wiki-logs
// https://github.com/LearnBoost/cluster/blob/master/lib/plugins/logger.js
//  https://github.com/Gagle/Node-BufferedWriter