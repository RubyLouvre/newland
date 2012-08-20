//LevelDB https://github.com/creationix/nstore-session

/**
 * 工具函数
 */

var crypto = require('crypto');
var config = require('../config');


/**
 * 32位MD5加密
 *
 * @param {string} text 文本
 * @return {string}
 */
var md5 = exports.md5 = function (text) {
    return crypto.createHash('md5').update(text).digest('hex');
};

/**
 * 加密密码
 *
 * @param {string} password
 * @return {string}
 */
exports.encryptPassword = function (password) {
    var random = md5(Math.random() + '' + Math.random()).toUpperCase();
    var left = random.substr(0, 2);
    var right = random.substr(-2);
    var newpassword = md5(left + password + right).toUpperCase();
    return [left, newpassword, right].join(':');
};

/**
 * 验证密码
 *
 * @param {string} password 待验证的密码
 * @param {string} encrypted 密码加密字符串
 * @return {bool}
 */
exports.validatePassword = function (password, encrypted) {
    var random = encrypted.toUpperCase().split(':');
    if (random.length < 3) return false;
    var left = random[0];
    var right = random[2];
    var main = random[1];
    var newpassword = md5(left + password + right).toUpperCase();
    return newpassword === main;
};

//一个很好的网站,有用户登录验证 https://github.com/leizongmin/url-forwarding/blob/master/routes/user.js
//一个简单的node.js 数据库 https://github.com/creationix/nstore-session
//又一个简单的node.js 数据库 https://github.com/philipp-spiess/json-db/blob/master/lib/client/collection.js
//添加cookie 真正使用实例 http://www.noday.net/articles/2011/11/27/1322376242011.html
//http://devilalbum.com/?p=847
//            if(!this.resCookies){
//                this.resCookies = [ name, val, opt ];
//                this.bind("header", function(){
//                    var r = this.resCookies, array = [];
//                    for(var i = 0; i < r.length; i = i+3){
//                        array.push( Cookie.stringify( r[i], r[i+1],r[i+2] ) )
//                    }
//                    this._setHeader.call(this.res, "Set-Cookie",array)
//                })
//            }else{
//                this.resCookies.push( name, val, opt )
//            }