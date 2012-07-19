var File = require ("../build/file-utils").File;

var f = new File ("contains.js");
f.setReadable (false, function (error, readable){
	console.log (readable); //Prints: Unix -> true, Windows -> false (no-op)
	
	f.getPermissions (function (error, permissions){
		console.log (permissions); //Prints: Unix -> 266, Windows -> 666 (no-op)
		
		f.setReadable (function (error, readable){
			console.log (readable); //Prints: Unix -> true, Windows -> false (no-op)
			
			f.getPermissions (function (error, permissions){
				console.log (permissions); //Prints: Unix -> 666, Windows -> 666 (no-op)
			});
		});
	});
});