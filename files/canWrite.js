var File = require ("../build/file-utils").File;

new File ("canWrite.js").canWrite (function (error, writable){
	console.log (writable); //Prints: true
});