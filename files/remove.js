var File = require ("../build/file-utils").File;

var f = new File ("temp");
f.createDirectory (function (error, created){
	new File ("temp/f.txt").createNewFile (function (error, created){
		f.remove (function (error, removed){
			console.log (removed); //Prints: true
		});
	});
});