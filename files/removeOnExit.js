var File = require ("../build/file-utils").File;

var f = new File ("temp");
f.removeOnExit (function (error, removed){
	console.log (removed); //Prints: true
});
f.createNewFile ();