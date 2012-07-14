
$.define("deploy","fs,path,child_process,settings",function( fs, path, child_process){
    var child     //重启线程
    function rebootProcess(exec,args){
        args = args || []
        child = child_process.spawn(exec, args);//创建一个新线程来接力
        child.stdout.addListener("data", function (chunk) {
            chunk && $.log(chunk);
        });
        child.stderr.addListener("data", function (chunk) {
            chunk && $.log(chunk);
        });
        child.addListener("exit", function () {
            $.log("<code style='color:yellow'>rebooting child process</code>" , true);
            rebootProcess(exec, args);
        });

    }
    //杀死一个进程
    function killProcess () {
        if ( !killProcess.lock ){
            killProcess.lock = true;//正在处理中,锁死该操作
            setTimeout(function() {
                if (child) {
                    $.log("<code style='color:yellow'>crashing child process</code>" , true);
                    process.kill( child.pid );
                    child = null;
                } else {
                    rebootProcess( "node",[] );
                    killProcess.lock = false;//解锁!
                }
            }, 50);
        }
    }
    try {
        /**
        信号是发送给进程的特殊信息。
        当一个进程接收到一个信号的时候，它会立即处理此信号，并不等待完成当前的函数调用甚至当前一行代码。
        我们可以通过编程手段发送SIGTERM和SIGKILL信号来结束一个进程。
        在键盘下按下Ctrl+C会产生SIGINT，而Ctrl+\会产生SIGQUIT。
        SIGHUP会在以下3种情况下被发送给相应的进程：
        1、终端关闭时，该信号被发送到session首进程以及作为job提交的进程（即用 & 符号提交的进程）
        2、session首进程退出时，该信号被发送到该session中的前台进程组中的每一个进程
        3、若父进程退出导致进程组成为孤儿进程组，且该进程组中有进程处于停止状态
          （收到SIGSTOP或SIGTSTP信号），该信号会被发送到该进程组中的每一个进程。
        更详细的内容请见:http://tassardge.blog.163.com/blog/static/1723017082011627522600/
         */
        [ "SIGTERM", "SIGINT", "SIGHUP", "SIGQUIT" ].forEach( function(signal) {
            process.on(signal, function () {
                if ( child ) {
                    $.log("<code style='color:yellow'>sending "+signal+" to child process</code>" , true);
                    child.kill(signal);
                }
                process.exit();
            });
        });
    // window平台不支持信号,我们直接忽略
    // https://github.com/joyent/node/issues/1553
    } catch(e) { }
    return function( dir ){
        fs.watch( dir, function (event, filename) {
            if(filename){
                var type = event == "change" ? "changed" : "created"; //有文件或目录发生改变或被添加
                var filepath = path.join( dir ,filename );
                var stat = fs.statSync(filepath);
                "isDirectory,isFile".replace( $.rword, function(method){
                    if( stat[ method ]() ){
                        $.log( '<code style="color:yellow">', filepath ,"' has ", type, "</code>", true);
                        killProcess();
                    }
                });
            }else{
                //如果要知道删除了那些文件,我们使用这里提供的位图法,判定前后两个文件树列表
                //http://www.cnblogs.com/ilian/archive/2012/07/01/tx-test-entry.html
                $.log( '<code style="color:yellow">Some file is removed</code>', true );
                killProcess();
            }
        });
    }
});
/**
参考链接
https://github.com/meteor/meteor/blob/master/app/meteor/deploy.js
https://github.com/DracoBlue/spludo/blob/master/build/run_dev_server.js
http://stackoverflow.com/questions/4681067/how-to-deploy-node-js
 */
