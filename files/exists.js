var File = require ("../build/file-utils").File;

new File ("exists.js").exists (function (exists){
	console.log (exists);  //Prints: true
});