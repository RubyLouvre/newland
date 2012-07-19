var File = require ("../build/file-utils").File;

new File ("../src").isFile (function (error, isFile){
	console.log (isFile); //Prints: false
	
	new File ("isFile.js").isFile (function (error, isFile){
		console.log (isFile); //Prints: true
	});
});