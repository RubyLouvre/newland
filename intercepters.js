//用于取得用户指定的拦截器
$.define("intercepters",  $.settings.intercepters.map(function(str){
    return "intercepters/"+ str
}), function(){
    $.log('<code style="color:cyan;">已加载intercepters模块</code>', true);
    $.log('<code style="color:yellow;">取得用户订阅的栏截器</code>', true);
    return Array.apply( [],arguments)
});
//http://yuan.iteye.com/blog/595183
//http://www.infoq.com/cn/news/2010/02/rails-3-beta;jsessionid=ADD0DD479949FCB8F0529CB1AF608E1F
//http://m.onkey.org/active-record-query-interface