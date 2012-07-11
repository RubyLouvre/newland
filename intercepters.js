mass.define("intercepters", (mass.settings.intercepters || []).map(function(str){
    return "intercepters/"+str
}).join(","), function(){
    console.log("取得一系列栏截器");
    return [].slice.call(arguments,0)
});
//http://yuan.iteye.com/blog/595183
//http://www.infoq.com/cn/news/2010/02/rails-3-beta;jsessionid=ADD0DD479949FCB8F0529CB1AF608E1F
//http://m.onkey.org/active-record-query-interface