$.define("configs", function(){
    // $.log("已加载用户配置模块");
    return $.config = {
        services: [],
        http_method: "_method",//用于模拟PUT,DELETE方法
        environments: "development",
        port: 8888,
        write_page: true,
        third_modules: "spec,random,menu,tab",//你可以用字符串形式表示，也可以用数组形式表示
        timeout: 4000,
        maxObjects: 128,
        maxLength: 1024 * 256,
        maxAge: 60*60*24*365,
        //默认session配置,如果没有,则不使用session
        session: {
            type: "mongo",
            sid:   "mass_sid",
            table: "sessions",
            life: 60 * 10 //实验用,减少为10分种,
        },
        cookie: {
            path: "/",
            life:60 * 10// 实验用,减少为10分种,其实至少要两星期  14 * 24 * 60 * 60
        },
        db: {
            name: "mongodb",   //数据库的名字
            host:  "localhost",//连接数据库时用
            port:  27017       //连接数据库时用
        }
    }
})