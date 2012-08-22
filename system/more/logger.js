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
// 最重要的参考 https://github.com/jaekwon/nogg/tree/master/lib
//https://github.com/joyent/node/wiki/modules#wiki-logs
// https://github.com/LearnBoost/cluster/blob/master/lib/plugins/logger.js
//  https://github.com/Gagle/Node-BufferedWriter

//log: function() {
//		var trace = getTrace(__stack[1]);
//		var string = util.format("%s [log] in %s:%d \n%s", trace.timestamp, trace.file, trace.lineno, util.format.apply(this, arguments));
//
//		process.stdout.write(string + "\n");
//	},
//function getTrace(call) {
//	return {
//		file: call.getFileName(),
//		lineno: call.getLineNumber(),
//		timestamp: new Date().toUTCString()
//	}
//	<ul>
/*
<li>0 <strong>EMERGENCY</strong>  system is unusable</li>
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