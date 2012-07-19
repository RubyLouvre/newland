var File = require ("../build/file-utils").File;

var f = new File ("contains.js");
f.setPermissions ("764", function (error, updated){
	console.log (updated); //Prints: Unix -> true, Windows -> true
	
	f.getPermissions (function (error, permissions){
		console.log (permissions); //Prints: Unix -> 764, Windows -> 666
		
		f.setPermissions ("666", function (error, updated){
			console.log (updated); //Prints: Unix -> true, Windows -> true
			
			f.getPermissions (function (error, permissions){
				console.log (permissions); //Prints: Unix -> 666, Windows -> 666
			});
		});
	});
});