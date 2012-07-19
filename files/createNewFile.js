var File = require ("../build/file-utils").File;

var f = new File ("temp");
f.createNewFile (function (error, created){
	console.log (created); //Prints: true
	
	f.createNewFile (function (error, created){
		console.log (created); //Prints: false (temp already exists)
	});
});