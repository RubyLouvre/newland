var File = require ("../build/file-utils").File;

new File ("getPermissions.js").getPermissions (function (error, permissions){
	console.log (permissions); //Prints: 666
});