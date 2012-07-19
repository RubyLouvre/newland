var File = require ("../build/file-utils").File;

var f = new File ("contains.js");
f.setReadOnly (function (error, updated){
	console.log (updated); //Prints: Unix -> true, Windows -> true
	
	f.getPermissions (function (error, permissions){
		console.log (permissions); //Prints: Unix -> 444, Windows -> 444
		
		f.setPermissions ("666");
	});
});