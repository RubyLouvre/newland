var File = require ("../build/file-utils").File;

new File ("..").searchFiles ("file-utils.js", function (error, files){
	var msg = "[";
	var first = true;
	files.forEach (function (file){
		if (first) first = false;
		else msg += ", ";
		msg += "\"" + file + "\"";
	});
	msg += "]";
	
	console.log (msg); //Prints: ["../build/file-utils.js", "../src/file-utils.js"]
});