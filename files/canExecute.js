var File = require ("../build/file-utils").File;

new File ("canExecute.js").canExecute (function (error, executable){
	console.log (executable); //Prints: false
});