var File = require ("../src/file-utils").File;

new File ("canRead.js").canRead (function (error, readable){
	console.log (readable); //Prints: true
});