var File = require ("../build/file-utils").File;

new File ("contains.js").size (function (error, size){
	console.log (size); //Prints: 209
});