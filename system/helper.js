$.define("helper","class", function(){
    function make_helper(){
        var data = {
            links : [],
            scripts : []
        }
        var context = {
            set_layout: function( str ){
                data.layout = str
            },
            set_title: function( str ){
                data.title = str
            },
            add_css : function ( file ) {
                var opts = {
                    media: 'screen',
                    rel: 'stylesheet',
                    type: 'text/css',
                    http: 1
                };
                return create_tag.call(this, file, opts, arguments)
            },
             push_css: function( file ) {
                var opts = {
                    media: 'screen',
                    rel: 'stylesheet',
                    type: 'text/css'
                };
                var tag = create_tag.call(this, file, opts, arguments);
                data.links.push( tag );
            },
            unshift_css: function( file ){
               var opts = {
                    media: 'screen',
                    rel: 'stylesheet',
                    type: 'text/css'
                };
                var tag = create_tag.call(this, file, opts, arguments);
                data.links.unshift( tag );
            },
            push_js: function( file ) {
                var opts = {
                    type: 'text/javascript'
                };
                var tag = create_tag.call(this, file, opts, arguments);
                data.scripts.push( tag);
            },
            unshift_js: function( file ){
                var opts = {
                    type: 'text/javascript'
                };
                var tag = create_tag.call(this, file, opts, arguments);
                data.scripts.unshift( tag);
            },
            add_js: function( file ){
                var opts = {
                    type: 'text/javascript',
                    http: 1
                };
                return create_tag.call(this, file, opts, arguments)
            }
        }
        return [data, context]    
    }
    //opts中的参数 soon为立即输出页面,不放进数组了
    //http表示加上域名
    function create_tag(file, opts, args){
        args = Array.apply([],args)
        var last = args[args.length - 1]
        if (typeof last === "object" ){
            opts = $.mix( opts, args.pop(), false);
        }
        if(opts.http){//添加前缀
            if(file.indexOf(this.host) !== 0){
                file = $.path.join( this.host ,file );
                file = "http://"+ file.replace(/\\/g,"/");
            }
            delete opts.http
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



