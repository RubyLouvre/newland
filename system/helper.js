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
            add_css : function (file) {
                var args = Array.apply([],arguments);
                var opts = {
                    media: 'screen',
                    rel: 'stylesheet',
                    type: 'text/css'
                };
                if (typeof args[args.length - 1] == 'object') {
                    opts = $.mix( opts, args.pop(), false);
                }
                var href = checkFile('css', file);
                delete opts.href;
                data.links.push( genericTagSelfclosing('link', opts, {
                    href: href
                }));
            },
            add_js: function( file ){
                var args = Array.apply([],arguments);
                var opts = {
                    type: 'text/javascript'
                };
                if (typeof args[args.length - 1] == 'object') {
                    opts = $.mix( opts, args.pop(), false);
                }
                var href = checkFile('js', file);
                delete opts.src;
                data.scripts.push( genericTag('script', '', opts, {
                    src: href
                }));
            }
        }
        return [data, context]    
    }
    //辅助函数
    //判定是开发环境或是测试环境还是线上环境
    function checkProd() {
        return $.configs.env === 'production';
    }
    var regexps = {
        'cached': /^cache\//,
        'isHttp': /^https?:\/\/|\/\//
    },
    exts = {
        'css': '.css',
        'js' : '.js'
    },
    paths = {
        'css': '/stylesheets/',
        'js' : '/javascripts/'
    };
    function checkFile(type, file) {
        var isExternalFile = regexps.isHttp.test(file),
        isCached         = file.match(regexps.cached),
        href             = !isExternalFile ? paths[type] + file + exts[type] : file,
        isProd           = checkProd();
        if (!isCached && !isProd && !isExternalFile ) {
            href += '?' + Date.now()
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



