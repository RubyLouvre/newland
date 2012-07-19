var File = require ("../build/file-utils").File;

var create = function (cb){
	var finish = function (){
		i++;
		if (i === 6) cb ();
	};
	var i = 0;
	new File ("a/b/c").createDirectory (function (){
		new File ("a/b/c/c1.txt").createNewFile (finish);
		new File ("a/b/b1.txt").createNewFile (finish);
		new File ("a/b/b2.txt").createNewFile (finish);
		new File ("a/a1.txt").createNewFile (finish);
		new File ("a/a2.txt").createNewFile (finish);
		new File ("a/d").createDirectory (finish);
	});
};

create (function (){
	new File ("a").listFiles (function (error, files){
		console.log (files);
		//Prints:
		/*
		{
			"a1.txt": File ("a/a1.txt"),
			"b": {
				"b1.txt": File ("a/b/b1.txt"),
				"b2.txt": File ('a/b/b2.txt"),
				c: {
					"c1.txt": File ("a/b/c/c1.txt")
				}
			},
			"a2.txt": File ("a/a2.txt"),
			d: {}
		}
		*/
		
		var names = [];
		new File ("a").list (function (name, path){
			names.push (name);
			return true;
		}, function (){
			console.log (names); //Prints: ["a1.txt", "a2.txt", "b", "d", "b1.txt", "b2.txt", "c", "c1.txt"]
			new File ("a").remove ();
		});
	});
});