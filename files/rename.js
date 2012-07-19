var File = require ("../build/file-utils").File;

var f = new File ("foo");
f.removeOnExit ();
f.createNewFile (function (error, created){
	f.rename ("bar", true, function (error, renamed){
		console.log (renamed); //Prints: true
		console.log (f.toString ()); //Prints: bar
	});
});