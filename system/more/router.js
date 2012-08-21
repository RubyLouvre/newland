$.define("router", function(){
    $.log("已加载路由器模块", "> 6")
    //表的结构：method+segments.length 普通字段
    function _tokenize (pathStr) {
        var stack = [''];
        for (var i = 0; i < pathStr.length; i ++) {
            var chr = pathStr[i];
            if (chr === '/') {//用于让后面的字符串相加
                stack.push('');
                continue;
            } else if (chr === '(') {
                stack.push('(');
                stack.push('');
            } else if (chr === ')') {
                stack.push(')');
                stack.push('');
            } else {
                stack[stack.length - 1] += chr;
            }
        }
        return stack.filter(function (str) {
            return str.length !== 0;
        });
    };
    //将(  ) 转换为数组的两端,最后构成一个多维数组返回
    function _parse(tokens) {
        var smallAst = [];
        var token;
        while ((token = tokens.shift()) !== undefined) {
            if (token.length <= 0) {
                continue;
            }
            switch (token) {
                case '(':
                    smallAst.push( _parse(tokens));
                    break;
                case ')':
                    return smallAst;
                default:
                    smallAst.push(token);
            }
        }
        return smallAst;
    };
    var combine = function (list, func) {
        var first = list.shift();
        var second = list.shift();
        if (second === undefined) {
            return first;
        }
        var combination = first.map(function (val1) {
            return second.map(function (val2) {
                return func(val1, val2);
            });
        }).reduce(function (val1, val2) {
            return val1.concat(val2);
        });
        if (list.length === 0) {
            return combination;
        } else {
            return combine([combination].concat(list), func);
        }
    };
    function parse(rule) {
        var tokens = _tokenize(rule);
        var ast = _parse(tokens);
        return ast;
    };
    ///////////////////////////////////////////////////////////
    function Router () {
        this.routingTable = {};
    }
    Router.createRouter = function () {
        return new Router;
    };
    Router.prototype._set = function (table, query, value) {
        var nextKey = query.shift();

        if (nextKey.length <= 0) {
            throw new Error('Invalid query.');
        }
        if (nextKey[0] === ':') {//如果碰到参数
            var n = nextKey.substring(1);
            if (table.hasOwnProperty('^n') && table['^n'] !== n) {
                return false;
            }
            table['^n'] = n;
            nextKey = '^v';
        }
        if (query.length === 0) {
            table[nextKey] = value;
            return true;
        } else {
            var nextTable = table.hasOwnProperty(nextKey) ?
            table[nextKey] : table[nextKey] = {};
            return this._set(nextTable, query, value);
        }
    };

    Router.prototype.add = function (method, path, value) {
        var ast = parse(path),
        patterns = this._expandRules(ast);
        if (patterns.length === 0) {
            var query = [method, 0];
            this._set(this.routingTable, query, value);
        }else{
            patterns.every(function (pattern) {
                var length = pattern.length,
                query = [method, length].concat(pattern);
                return this._set(this.routingTable, query, value);
            }.bind(this));
        }
        return value
    };

    var methods = [
    'GET',
    'POST',
    'PUT',
    'DELETE'
    ];
    methods.forEach(function (method) {
        Router.prototype[ method ] = function (path, value) {
            return this.add( method, path, value );
        };
    });

    Router.prototype.all = function (path, value) {
        methods.every( function (method) {
            return this.add( method, path, value );
        });
        return value
    };

    Router.prototype.routeWithQuery = function (method, path) {
        var parsedUrl = $.parseUrl(path, true),
        dest = this.route(method, parsedUrl.pathname);
        if (dest === undefined) {
            return undefined;
        } else {
            for (var key in parsedUrl.query) {
                dest.params[key] = parsedUrl.query[key];
            }
            return dest;
        }
    };

    Router.prototype.route = function (method, path) {
        path = path.trim();
        var splitted = path.split('/'),
        query = Array(splitted.length),
        index = 0,
        params = {},
        table = [],
        val, key, j;
        for (var i = 0; i < splitted.length; ++ i) {
            val = splitted[i];
            if (val.length !== 0) {
                query[index] = val;
                index ++;
            }
        }
        query.length = index;
        table = this.routingTable[method];
        if (table === undefined) return undefined;
        table = table[query.length];
        if (table === undefined) return undefined;
        for (j = 0; j < query.length; ++ j) {
            key = query[j];
            if (table.hasOwnProperty(key)) {
                table = table[key];
            } else if (table.hasOwnProperty('^v')) {
                params[table['^n']] = key;
                table = table['^v'];
            } else {
                return undefined;
            }
        }
        return {
            params: params,
            value: table
        };
    };

    Router.prototype._expandRules = function (ast) {
        if (Array.isArray(ast) && ast.length === 0) {
            return [];
        }
        var self = this;
        var result = combine(ast.map(function (val) {
            if (typeof val === 'string') {
                return [[val]];
            } else if (Array.isArray(val)) {
                return self._expandRules(val).concat([[]]);
            } else {
                throw new Error('Invalid AST. Unexpected neither a string nor an array.');
            }
        }), function (a, b) {
            return a.concat(b);
        });
        return result;
    };
    return Router
});
