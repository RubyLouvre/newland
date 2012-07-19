var File = require ("../build/file-utils").File;

new File ("../src").isDirectory (function (error, isDirectory){
	console.log (isDirectory); //Prints: true
	
	new File ("isDirectory.js").isDirectory (function (error, isDirectory){
		console.log (isDirectory); //Prints: false
	});
});