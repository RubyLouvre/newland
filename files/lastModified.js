var File = require ("../build/file-utils").File;

new File ("canExecute.js").lastModified (function (error, lastModified){
	console.log (lastModified); //Prints: Wed, 04 Apr 2012 20:10:39 GMT
});