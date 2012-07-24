$.define("router", function(){


    //将路由规则把"/"切割成字符串数组
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
    function parse(rule) {
        var tokens = _tokenize(rule);
        var ast = _parse(tokens);
        return ast;
    };

    //http://d.hatena.ne.jp/scalar/20120508/1336488868
})
