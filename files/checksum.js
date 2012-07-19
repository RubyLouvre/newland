var File = require ("../build/file-utils").File;

new File ("canExecute.js").checksum ("md5", "hex", function (error, checksum){
	console.log (checksum); //Prints: a902fa4b30e6d3403814a5a7145810d2
});