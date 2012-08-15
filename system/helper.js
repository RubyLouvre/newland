$.define("helper", function(){
    function make_helper(){
        var data = {
            links : [],
            scripts : []
        }
        var helpers = {
            set_layout: function( str ){
                data.layout = str
            },
            set_title: function( str ){
                data.title = str
            },
            push_css: function( file ) {
                var opts = {
                    media: 'screen',
                    rel: 'stylesheet',
                    type: 'text/css'
                };
                var tag = create_tag( file, opts, arguments );
                data.links.push( tag+"\n" );
            },
            unshift_css: function( file ){
                var opts = {
                    media: 'screen',
                    rel: 'stylesheet',
                    type: 'text/css'
                };
                var tag = create_tag( file, opts, arguments );
                data.links.unshift( tag+"\n" );
            },
            add_css : function ( file ) {
                var opts = {
                    media: 'screen',
                    rel: 'stylesheet',
                    type: 'text/css',
                    root: 1
                };
                return create_tag( file, opts, arguments );
            },
            push_js: function( file, more ) {
                var opts = {
                    type: 'text/javascript'
                };
                $.mix(opts, more || {})
                var tag = create_tag( file, opts, arguments );
                data.scripts.push( tag+"\n" );
            },
            unshift_js: function( file ){
                var opts = {
                    type: 'text/javascript'
                };
                var tag = create_tag( file, opts, arguments );
                data.scripts.unshift( tag+"\n" );
            },
            add_js: function( file, more){
                var opts = {
                    type: 'text/javascript',
                    root: 1
                };
                $.mix(opts, more || {})
                return create_tag( file, opts, arguments );
            }
        }
        return [data, helpers]
    }

    var reg_full_path = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/
    function create_tag(file, opts, args){
        args = Array.apply([],args);//转换成纯数组
        var last = args[args.length - 1];
        if (typeof last === "object" ){
            opts = $.mix( opts, args.pop() );
        }
        if(opts.root){//添加前缀
            if( !reg_full_path.test (file) ) {//如果前面不存在http: https:
                var pre = file.indexOf("/") === 0 ? "" : "/"
                file = $.path.normalize( $.path.join( pre ,file ) ).replace(/\\/g,"/");
            }
            delete opts.root
        }
        var href = checkFile( file );
        if(opts.type == "text/css"){
            delete opts.href;
            return genericTagSelfclosing('link', opts, {
                href: href
            })
        }else{
            delete opts.src
            return  genericTag('script', '', opts, {
                src: href
            });
        }
    }
    //辅助函数
    //判定是开发环境或是测试环境还是线上环境
    function checkProd() {
        return $.configs.env === 'production';
    }

    function checkFile(  href ) {
        if (checkProd() ) {
            href += ( /\?/.test(href) ? "&" : "?" ) + "_time=" + Date.now();
        }
        return href;
    }

    function genericTag(name, inner, params, override) {
        return '<' + name + htmlTagParams(params, override) + '>' + inner + '</' + name + '>';
    }

    function genericTagSelfclosing(name, params, override) {
        return '<' + name + htmlTagParams(params, override) + ' />';
    }
    
    function htmlTagParams(params, override) {
        var maybe_params = '';
        $.mix(params, override, false);
        for (var key in params) {
            if (params[key] != void 0) {
                maybe_params += ' ' + key + '="' + params[key].toString().replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"';
            }
        }
        return maybe_params;
    };
    return make_helper
})
//nodeで空いているポートを見つける http://d.hatena.ne.jp/sugyan/20110403/1301769822
// node-flowless http://d.hatena.ne.jp/koichik/20120304
/*
 *
function quote(s) {
  (s+='').replace(/\\/g, '\\\\');
  var use = +(s.match(quote.q[1][0]) === null);
  return quote.q[0][use] + s.replace(quote.q[1][1-use], '\\$1') + quote.q[0][use];
}
quote.q=[ ['"', "'"], [/(')/g, /(")/g] ];

 */

//ecma 时代的类系统
//https://github.com/Benvie/Node.js-Ultra-REPL/blob/master/lib/utility/object-utils.js
//https://github.com/Benvie/Node.js-Ultra-REPL/blob/master/lib/utility/explorePath.js


