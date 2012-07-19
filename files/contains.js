var File = require ("../build/file-utils").File;

new File ("..").contains ("file-utils.js", function (error, contains){
	console.log (contains); //Prints: true (build/file-utils.js, src/file-utils.js)
});