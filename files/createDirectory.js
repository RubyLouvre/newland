var File = require ("../build/file-utils").File;

var f = new File ("a/b/c");
f.createDirectory (function (error, created){
	console.log (created); //Prints: true
	
	f.createDirectory (function (error, created){
		console.log (created); //Prints: false (a/b/c already exists)
	});
	
	f.getParentFile ().getParentFile ().remove ();
});