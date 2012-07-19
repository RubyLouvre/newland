var File = require ("../build/file-utils").File;

var f = new File ("contains.js");
f.setExecutable (function (error, executable){
	console.log (executable); //Prints: Unix -> true, Windows -> false (no-op)
	
	f.getPermissions (function (error, permissions){
		console.log (permissions); //Prints: Unix -> 766, Windows -> 666 (no-op)
		
		f.setExecutable (false, function (error, executable){
			console.log (executable); //Prints: Unix -> true, Windows -> false (no-op)
			
			f.getPermissions (function (error, permissions){
				console.log (permissions); //Prints: Unix -> 666, Windows -> 666 (no-op)
			});
		});
	});
});