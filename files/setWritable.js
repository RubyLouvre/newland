var File = require ("../build/file-utils").File;

var f = new File ("contains.js");
f.setWritable (false, function (error, writable){
	console.log (writable); //Prints: Unix -> true, Windows -> true
	
	f.getPermissions (function (error, permissions){
		console.log (permissions); //Prints: Unix -> 466, Windows -> 444
		
		f.setWritable (function (error, writable){
			console.log (writable); //Prints: Unix -> true, Windows -> true
			
			f.getPermissions (function (error, permissions){
				console.log (permissions); //Prints: Unix -> 666, Windows -> 666
			});
		});
	});
});