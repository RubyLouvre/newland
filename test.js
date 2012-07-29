var less = require('./less/index.js');

less.render('.class { width: 1 + 1 }', function (e, css) {
    console.log(css);
});