var File = require ("../build/file-utils").File;

new File ("..").search ("file-utils.js", function (error, files){
	console.log (files); //Prints: ["../build/file-utils.js", "../src/file-utils.js"]
});